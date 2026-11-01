// Run: npx tsx prisma/add-questions.ts   (safe to run many times; keeps all user data)
import { PrismaClient } from '@prisma/client'
import { ensureQuestions } from './questions'
const db = new PrismaClient()
async function main() {
  const subject = (await db.subject.findFirst({ where: { name: 'Python', ownerId: null } })) ?? (await db.subject.create({ data: { name: 'Python' } }))
  const topics: Record<string, string> = {}
  for (const n of ['Variables', 'Loops', 'Functions', 'Lists']) {
    topics[n] = (await db.topic.upsert({ where: { subjectId_name: { subjectId: subject.id, name: n } }, create: { name: n, subjectId: subject.id }, update: {} })).id
  }
  console.log(`Added ${await ensureQuestions(db, topics)} new questions. Total: ${await db.question.count()}`)
}
main().finally(() => db.$disconnect())
