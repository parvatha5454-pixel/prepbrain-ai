import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { getUserId } from '@/lib/auth'
import QuizClient from '@/components/QuizClient'
export const dynamic = 'force-dynamic'
export default async function QuizPage() {
  const userId = await getUserId()
  if (!userId) redirect('/login')
  const subjects = await db.subject.findMany({ where: { OR: [{ ownerId: null }, { ownerId: userId }] }, orderBy: { name: 'asc' },
    select: { id: true, name: true, topics: { select: { id: true, name: true }, orderBy: { name: 'asc' } } } })
  return <QuizClient subjects={subjects} />
}
