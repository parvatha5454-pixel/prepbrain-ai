import { NextResponse } from 'next/server'
import { z } from 'zod'
import { orchestrate } from '@/lib/orchestrator'
import { getUserId } from '@/lib/auth'
import { db } from '@/lib/db'
const body = z.object({ assessmentId: z.string(),
  answers: z.array(z.object({ questionId: z.string(), given: z.string().max(500), responseMs: z.number().int().min(0) })).min(1).max(50) })
export const maxDuration = 60
export async function POST(req: Request) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
  const p = body.safeParse(await req.json().catch(() => null))
  if (!p.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  const a = await db.assessment.findFirst({ where: { id: p.data.assessmentId, userId, completedAt: null } })
  if (!a) return NextResponse.json({ error: 'Assessment not found or already submitted.' }, { status: 404 })
  const ids = [...new Set(p.data.answers.map(x => x.questionId))]
  if (ids.length !== p.data.answers.length || (await db.question.count({ where: { id: { in: ids } } })) !== ids.length)
    return NextResponse.json({ error: 'Invalid questions.' }, { status: 400 })
  const before = await db.topicMastery.findMany({ where: { userId } })
  const result = await orchestrate(userId, a.id, p.data.answers)
  const rows = await db.studentAnswer.findMany({ where: { assessmentId: a.id }, include: { question: { include: { topic: true } } } })
  const topicIds = [...new Set(rows.map(r => r.question.topicId))]
  const after = await db.topicMastery.findMany({ where: { userId, topicId: { in: topicIds } }, include: { topic: true } })
  return NextResponse.json({ ...result,
    review: rows.map(r => ({ topic: r.question.topic.name, prompt: r.question.prompt, given: r.given, correct: r.correct, answer: r.question.answer, explanation: r.question.explanation })),
    mastery: after.map(m => ({ topic: m.topic.name, before: before.find(b => b.topicId === m.topicId)?.score ?? null, after: m.score, difficulty: m.currentDifficulty })) })
}
