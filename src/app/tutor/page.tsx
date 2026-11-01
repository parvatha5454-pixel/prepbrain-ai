import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { getUserId } from '@/lib/auth'
import TutorClient from '@/components/TutorClient'
export const dynamic = 'force-dynamic'
export default async function TutorPage() {
  const userId = await getUserId()
  if (!userId) redirect('/login')
  const h = await db.chatHistory.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 30 })
  return <TutorClient initial={h.reverse().map(x => ({ role: x.role, content: x.content }))} />
}
