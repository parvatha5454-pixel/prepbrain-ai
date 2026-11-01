// DEMONSTRATION DATA ONLY: demo student demo@prepbrain.ai / demo1234
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { ensureQuestions } from './questions'
const db = new PrismaClient()
const day = 864e5
async function main() {
  const old = await db.user.findUnique({ where: { email: 'demo@prepbrain.ai' } })
  if (old) {
    const w = { where: { userId: old.id } }
    await db.studentAnswer.deleteMany(w); await db.assessment.deleteMany(w); await db.studyPlan.deleteMany(w)
    await db.topicMastery.deleteMany(w); await db.mistakePattern.deleteMany(w); await db.studyActivity.deleteMany(w)
    await db.chatHistory.deleteMany(w); await db.learnerProfile.deleteMany(w); await db.user.delete({ where: { id: old.id } })
  }
  const subject = (await db.subject.findFirst({ where: { name: 'Python', ownerId: null } })) ?? (await db.subject.create({ data: { name: 'Python' } }))
  const topics: Record<string, string> = {}
  for (const n of ['Variables', 'Loops', 'Functions', 'Lists'])
    topics[n] = (await db.topic.upsert({ where: { subjectId_name: { subjectId: subject.id, name: n } }, create: { name: n, subjectId: subject.id }, update: {} })).id
  await ensureQuestions(db, topics)
  const user = await db.user.create({ data: { email: 'demo@prepbrain.ai', name: 'Demo Student', isDemo: true, passwordHash: await bcrypt.hash('demo1234', 10) } })
  const m: [string, number, number, number][] = [['Variables', 92, 88, 3], ['Loops', 45, 40, 1], ['Functions', 32, 42, 1], ['Lists', 78, 70, 2]]
  for (const [n, score, prev, diff] of m)
    await db.topicMastery.create({ data: { userId: user.id, topicId: topics[n], score, prevScore: prev, attempts: 12, currentDifficulty: diff, lastPracticedAt: new Date(Date.now() - (n === 'Functions' ? 1 : 4) * day) } })
  await db.mistakePattern.createMany({ data: [
    { userId: user.id, topicId: topics.Loops, tag: 'range-off-by-one', count: 4 },
    { userId: user.id, topicId: topics.Functions, tag: 'implicit-return', count: 3 } ] })
  await db.learnerProfile.create({ data: { userId: user.id, overallMastery: 61.75, streak: 5, studyMinutes: 340, nextAction: 'Practice Functions' } })
  await db.studyActivity.createMany({ data: [
    { userId: user.id, type: 'ASSESSMENT', detail: 'Demo: Python diagnostic, 58%', minutes: 20, createdAt: new Date(Date.now() - 3 * day) },
    { userId: user.id, type: 'PRACTICE', detail: 'Demo: Lists practice', minutes: 15, createdAt: new Date(Date.now() - day) } ] })
  console.log(`Seeded. Questions: ${await db.question.count()}. Login: demo@prepbrain.ai / demo1234 (demonstration data)`)
}
main().finally(() => db.$disconnect())
