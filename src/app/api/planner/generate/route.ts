import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserId } from '@/lib/auth'
import { studyPlanningAgent } from '@/lib/orchestrator'
export async function POST() {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
  if ((await db.topicMastery.count({ where: { userId } })) === 0) return NextResponse.json({ error: 'Complete an assessment first so the planner has data.' }, { status: 400 })
  const { plan } = await studyPlanningAgent(userId)
  return NextResponse.json({ ok: true, tasks: plan.tasks.length })
}
