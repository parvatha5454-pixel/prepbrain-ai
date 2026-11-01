import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { updateMastery, nextDifficulty } from './mastery'
import { geminiJSON } from './gemini'
const db = new PrismaClient()
type Sub = { questionId: string; given: string; responseMs: number }
export type TraceStep = { agent: string; mode: 'rules' | 'gemini' | 'fallback'; summary: string; details: string[]; ms: number }
const timed = async <T,>(f: () => Promise<T>) => { const t = Date.now(); const r = await f(); return { r, ms: Date.now() - t } }

// Separate real functions coordinated by orchestrate(). Rules decide; Gemini only explains. Each step reports what it actually did.
async function assessmentAgent(userId: string, assessmentId: string, subs: Sub[]) {
  const qs = await db.question.findMany({ where: { id: { in: subs.map(s => s.questionId) } } })
  const rows = subs.map(s => { const q = qs.find(x => x.id === s.questionId)!
    return { q, correct: q.answer.trim().toLowerCase() === s.given.trim().toLowerCase(), given: s.given, responseMs: s.responseMs } })
  await db.studentAnswer.createMany({ data: rows.map(r => ({ assessmentId, userId, questionId: r.q.id, given: r.given, correct: r.correct, responseMs: r.responseMs })) })
  const score = Math.round((rows.filter(r => r.correct).length / rows.length) * 100)
  await db.assessment.update({ where: { id: assessmentId }, data: { completedAt: new Date(), score } })
  return { rows, score }
}
async function learnerAnalysisAgent(userId: string, rows: Awaited<ReturnType<typeof assessmentAgent>>['rows']) {
  const byTopic = new Map<string, typeof rows>()
  rows.forEach(r => byTopic.set(r.q.topicId, [...(byTopic.get(r.q.topicId) ?? []), r]))
  const names = new Map((await db.topic.findMany({ where: { id: { in: [...byTopic.keys()] } } })).map(t => [t.id, t.name]))
  const changes: { topic: string; before: number | null; after: number; diffBefore: number | null; diffAfter: number }[] = []
  for (const [topicId, rs] of byTopic) {
    const m = await db.topicMastery.findUnique({ where: { userId_topicId: { userId, topicId } } })
    const score = updateMastery(m?.score ?? null, m?.attempts ?? 0, rs.map(r => ({ correct: r.correct, difficulty: r.q.difficulty })))
    const hist = await db.studentAnswer.findMany({ where: { userId, question: { topicId } }, orderBy: { createdAt: 'asc' }, select: { correct: true } })
    const { difficulty } = nextDifficulty(m?.currentDifficulty ?? 1, hist.map(h => h.correct))
    await db.topicMastery.upsert({ where: { userId_topicId: { userId, topicId } },
      create: { userId, topicId, score, attempts: rs.length, currentDifficulty: difficulty },
      update: { prevScore: m?.score, score, attempts: { increment: rs.length }, currentDifficulty: difficulty, lastPracticedAt: new Date() } })
    changes.push({ topic: names.get(topicId) ?? 'Topic', before: m ? Math.round(m.score) : null, after: Math.round(score), diffBefore: m?.currentDifficulty ?? null, diffAfter: difficulty })
  }
  const found = new Map<string, { tag: string; topic: string; count: number }>()
  for (const r of rows.filter(r => !r.correct && r.q.misconceptionTag)) { // recurring-mistake detection
    const up = await db.mistakePattern.upsert({ where: { userId_topicId_tag: { userId, topicId: r.q.topicId, tag: r.q.misconceptionTag! } },
      create: { userId, topicId: r.q.topicId, tag: r.q.misconceptionTag! }, update: { count: { increment: 1 }, lastSeenAt: new Date() } })
    found.set(up.tag + up.topicId, { tag: up.tag, topic: names.get(r.q.topicId) ?? 'Topic', count: up.count })
  }
  const all = await db.topicMastery.findMany({ where: { userId } })
  const overall = all.reduce((s, m) => s + m.score, 0) / Math.max(1, all.length)
  await db.learnerProfile.upsert({ where: { userId }, create: { userId, overallMastery: overall }, update: { overallMastery: overall } })
  return { changes, mistakes: [...found.values()], overall: Math.round(overall) }
}
// Priority = weakness*0.6 + repeated mistakes (cap 10)*2.5 + days since practice (cap 10)*1.5
export async function studyPlanningAgent(userId: string) {
  const [ms, mp] = await Promise.all([db.topicMastery.findMany({ where: { userId }, include: { topic: true } }), db.mistakePattern.findMany({ where: { userId } })])
  const ranked = ms.map(m => {
    const mistakes = mp.filter(p => p.topicId === m.topicId).reduce((s, p) => s + p.count, 0)
    const days = (Date.now() - m.lastPracticedAt.getTime()) / 864e5
    return { m, mistakes, priority: Math.round((100 - m.score) * 0.6 + Math.min(mistakes, 10) * 2.5 + Math.min(days, 10) * 1.5 + (m.topic.weight - 1) * 3) }
  }).sort((a, b) => b.priority - a.priority).slice(0, 5)
  const plan = await db.studyPlan.create({ data: { userId, tasks: { create: ranked.map((r, i) => ({
    topicId: r.m.topicId, title: `Practice ${r.m.topic.name}`, priority: r.priority, dueDay: i,
    reason: `Mastery ${Math.round(r.m.score)}%${r.mistakes ? `, ${r.mistakes} repeated mistakes` : ''}` })) } }, include: { tasks: true } })
  return { plan, weakest: ranked[0]?.m, ranked: ranked.map(r => ({ topic: r.m.topic.name, priority: r.priority, score: Math.round(r.m.score), mistakes: r.mistakes })) }
}
async function recommendationAgent(w?: { score: number; topic: { name: string } }) {
  if (!w) return { text: 'Complete an assessment to get recommendations.', ai: false }
  const fb = { text: `${w.topic.name} is your weakest topic (${Math.round(w.score)}%). Do a short targeted practice set next.` }
  const r = await geminiJSON(`Weakest topic: ${w.topic.name} (${Math.round(w.score)}%). Reply JSON {"text":"<2 encouraging sentences>"}`, z.object({ text: z.string().max(400) }), fb)
  return { ...r.data, ai: r.ai }
}
export async function orchestrate(userId: string, assessmentId: string, subs: Sub[]) {
  const trace: TraceStep[] = []
  const a = await timed(() => assessmentAgent(userId, assessmentId, subs))
  const { rows, score } = a.r
  const avg = Math.round(rows.reduce((s, r) => s + r.responseMs, 0) / rows.length / 100) / 10
  trace.push({ agent: 'Assessment Agent', mode: 'rules', ms: a.ms, summary: `Graded ${rows.length} answers: ${rows.filter(r => r.correct).length} correct (${score}%)`,
    details: [`Average response time ${avg}s`, 'Saved every answer to your learning history'] })
  const l = await timed(() => learnerAnalysisAgent(userId, rows))
  trace.push({ agent: 'Learner Analysis Agent', mode: 'rules', ms: l.ms, summary: `Updated your learner model for ${l.r.changes.length} topic(s). Overall mastery is now ${l.r.overall}%`,
    details: [...l.r.changes.map(c => `${c.topic}: ${c.before === null ? 'new' : c.before + '%'} → ${c.after}%, difficulty ${c.diffBefore === null || c.diffBefore === c.diffAfter ? (c.diffBefore === null ? `set to ${c.diffAfter}` : `unchanged at ${c.diffAfter}`) : `${c.diffBefore} → ${c.diffAfter}`}`),
      ...l.r.mistakes.map(m => `Mistake pattern "${m.tag}" in ${m.topic}: now seen ${m.count}x`),
      'Difficulty rule: 4+ of last 5 correct raises it, 1 or fewer lowers it'] })
  const p = await timed(() => studyPlanningAgent(userId))
  trace.push({ agent: 'Study Planning Agent', mode: 'rules', ms: p.ms, summary: `Chose "${p.r.plan.tasks[0]?.title}" as your next best action`,
    details: [...p.r.ranked.slice(0, 3).map((r, i) => `${i + 1}. ${r.topic}: priority ${r.priority} (mastery ${r.score}%, ${r.mistakes} repeated mistakes)`), 'Priority = weakness 60% + repeated mistakes + time since practice'] })
  const g = await timed(() => recommendationAgent(p.r.weakest ? { score: p.r.weakest.score, topic: p.r.weakest.topic } : undefined))
  trace.push({ agent: 'Recommendation Agent', mode: g.r.ai ? 'gemini' : 'fallback', ms: g.ms,
    summary: g.r.ai ? 'Gemini wrote a personalised tip (output validated before use)' : 'Gemini was unavailable, so a rule-based tip was used', details: [g.r.text] })
  await db.learnerProfile.update({ where: { userId }, data: { nextAction: p.r.plan.tasks[0]?.title } })
  const minutes = Math.max(1, Math.ceil(subs.reduce((s, x) => s + x.responseMs, 0) / 60000))
  await db.studyActivity.create({ data: { userId, type: 'ASSESSMENT', detail: `Scored ${score}%`, minutes } })
  await db.learnerProfile.update({ where: { userId }, data: { studyMinutes: { increment: minutes } } })
  return { score, nextAction: p.r.plan.tasks[0]?.title, recommendation: { text: g.r.text, ai: g.r.ai }, trace }
}
