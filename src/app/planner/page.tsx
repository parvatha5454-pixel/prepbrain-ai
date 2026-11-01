import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { getUserId } from '@/lib/auth'
import PlannerClient from '@/components/PlannerClient'
export const dynamic = 'force-dynamic'
export default async function Planner() {
  const userId = await getUserId()
  if (!userId) redirect('/login')
  const plan = await db.studyPlan.findFirst({ where: { userId }, orderBy: { generatedAt: 'desc' }, include: { tasks: { orderBy: { dueDay: 'asc' } } } })
  return <PlannerClient generatedAt={plan?.generatedAt.toLocaleString() ?? null} tasks={plan?.tasks.map(t => ({ id: t.id, title: t.title, reason: t.reason, priority: t.priority, dueDay: t.dueDay, done: t.done })) ?? []} />
}
