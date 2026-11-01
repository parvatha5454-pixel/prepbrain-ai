import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getUserId } from '@/lib/auth'
export async function POST(req: Request) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
  const p = z.object({ taskId: z.string(), done: z.boolean() }).safeParse(await req.json().catch(() => null))
  if (!p.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  const r = await db.studyTask.updateMany({ where: { id: p.data.taskId, plan: { userId } }, data: { done: p.data.done } }) // only own tasks
  return r.count ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'Task not found' }, { status: 404 })
}
