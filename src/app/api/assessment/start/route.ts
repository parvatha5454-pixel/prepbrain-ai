import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getUserId } from '@/lib/auth'
// Adaptive selection: unseen questions first, then closest to the student's stored difficulty, with a little randomness.
export async function POST(req: Request) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
  const p = z.object({ subjectId: z.string().optional(), topicId: z.string().optional() }).safeParse(await req.json().catch(() => ({})))
  if (!p.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  const access = { OR: [{ ownerId: null }, { ownerId: userId }] }
  const subject = await db.subject.findFirst({ where: p.data.subjectId ? { id: p.data.subjectId, ...access } : { name: 'Python', ownerId: null } })
  if (!subject) return NextResponse.json({ error: 'Subject not found.' }, { status: 404 })
  const topics = await db.topic.findMany({ where: { subjectId: subject.id, ...(p.data.topicId ? { id: p.data.topicId } : {}) }, include: { questions: true, mastery: { where: { userId } } } })
  const seen = new Map((await db.studentAnswer.groupBy({ by: ['questionId'], where: { userId }, _count: { _all: true } })).map(s => [s.questionId, s._count._all]))
  const picked = topics.flatMap(t => {
    const cur = t.mastery[0]?.currentDifficulty ?? 2
    return t.questions.map(q => ({ q, s: (seen.get(q.id) ?? 0) * 10 + Math.abs(q.difficulty - cur) + Math.random() * 0.5 }))
      .sort((a, b) => a.s - b.s).slice(0, 3).map(x => ({ q: x.q, topic: t.name }))
  }).sort(() => Math.random() - 0.5)
  if (!picked.length) return NextResponse.json({ error: 'No questions yet for this subject. Tap "Generate AI questions" first.' }, { status: 404 })
  const a = await db.assessment.create({ data: { userId, subjectId: subject.id, kind: p.data.topicId ? 'ADAPTIVE' : 'DIAGNOSTIC',
    difficulty: Math.round(picked.reduce((s, x) => s + x.q.difficulty, 0) / picked.length) } })
  return NextResponse.json({ assessmentId: a.id, questions: picked.map(({ q, topic }) => ({ id: q.id, topic, difficulty: q.difficulty, ai: q.source === 'gemini', prompt: q.prompt, options: JSON.parse(q.options) })) })
}
