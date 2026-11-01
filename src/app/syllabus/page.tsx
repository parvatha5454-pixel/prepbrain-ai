import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { getUserId } from '@/lib/auth'
import SyllabusClient from '@/components/SyllabusClient'
export const dynamic = 'force-dynamic'
export default async function SyllabusPage() {
  const userId = await getUserId()
  if (!userId) redirect('/login')
  const s = await db.subject.findMany({ where: { ownerId: userId }, orderBy: { name: 'asc' }, include: { topics: { include: { _count: { select: { questions: true } } } } } })
  return <SyllabusClient existing={s.map(x => ({ id: x.id, name: x.name, topics: x.topics.length, questions: x.topics.reduce((a, t) => a + t._count.questions, 0) }))} />
}
