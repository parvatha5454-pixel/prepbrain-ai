import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { getUserId } from '@/lib/auth'
import DashboardView from '@/components/DashboardView'
export const dynamic = 'force-dynamic'
export default async function Dashboard() {
  const userId = await getUserId()
  if (!userId) redirect('/login')
  const user = await db.user.findUnique({ where: { id: userId }, include: { profile: true } })
  if (!user) redirect('/login')
  const [ms, mp, acts, answers] = await Promise.all([
    db.topicMastery.findMany({ where: { userId }, include: { topic: true } }),
    db.mistakePattern.findMany({ where: { userId }, orderBy: { count: 'desc' } }),
    db.studyActivity.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 5 }),
    db.studentAnswer.count({ where: { userId } }) ])
  // Same priority formula as the study planner, so "next action" always agrees with the planner.
  const topics = ms.map(m => {
    const mistakes = mp.filter(p => p.topicId === m.topicId).reduce((s, p) => s + p.count, 0)
    const days = (Date.now() - m.lastPracticedAt.getTime()) / 864e5
    return { id: m.id, name: m.topic.name, score: Math.round(m.score), prev: m.prevScore == null ? null : Math.round(m.prevScore), difficulty: m.currentDifficulty, mistakes,
      priority: (100 - m.score) * 0.6 + Math.min(mistakes, 10) * 2.5 + Math.min(days, 10) * 1.5 + (m.topic.weight - 1) * 3, days: Math.floor(days) }
  }).sort((a, b) => b.priority - a.priority)
  const top = topics[0]
  const next = top ? { title: `Practice ${top.name}`, reason: `${top.name} is at ${top.score}%${top.mistakes ? `, with ${top.mistakes} repeated mistakes` : ''}${top.days >= 3 ? `, and not revised for ${top.days} days` : ''}.` } : null
  return <DashboardView data={{ name: user.name, isDemo: user.isDemo, overall: Math.round(user.profile?.overallMastery ?? 0), attempted: Math.max(ms.reduce((s, m) => s + m.attempts, 0), answers),
    minutes: user.profile?.studyMinutes ?? 0, streak: user.profile?.streak ?? 0, topics: [...topics].sort((a, b) => a.score - b.score), next,
    mistakes: mp.slice(0, 5).map(x => ({ tag: x.tag, count: x.count, topic: ms.find(m => m.topicId === x.topicId)?.topic.name ?? '' })),
    acts: acts.map(a => ({ id: a.id, detail: a.detail, date: a.createdAt.toLocaleDateString('en-GB'), minutes: a.minutes })) }} />
}
