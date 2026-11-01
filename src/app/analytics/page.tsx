import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { getUserId } from '@/lib/auth'
import AnalyticsCharts from '@/components/AnalyticsCharts'
export const dynamic = 'force-dynamic'
const key = (d: Date) => d.toISOString().slice(0, 10)
export default async function Analytics() {
  const userId = await getUserId()
  if (!userId) redirect('/login')
  const since = new Date(Date.now() - 7 * 864e5)
  const [ms, mp, answers, acts] = await Promise.all([
    db.topicMastery.findMany({ where: { userId }, include: { topic: true }, orderBy: { score: 'asc' } }),
    db.mistakePattern.findMany({ where: { userId }, orderBy: { count: 'desc' }, take: 5 }),
    db.studentAnswer.findMany({ where: { userId, createdAt: { gte: since } }, select: { correct: true, createdAt: true } }),
    db.studyActivity.findMany({ where: { userId, createdAt: { gte: since } }, select: { minutes: true, createdAt: true } }) ])
  const days = Array.from({ length: 7 }, (_, i) => new Date(Date.now() - (6 - i) * 864e5))
  const daily = days.map(d => {
    const k = key(d), a = answers.filter(x => key(x.createdAt) === k)
    return { day: k.slice(5), accuracy: a.length ? Math.round((a.filter(x => x.correct).length / a.length) * 100) : null,
      minutes: acts.filter(x => key(x.createdAt) === k).reduce((s, x) => s + x.minutes, 0) }
  })
  const topics = ms.map(m => ({ topic: m.topic.name, current: Math.round(m.score), previous: m.prevScore == null ? null : Math.round(m.prevScore) }))
  // Insights are generated from stored data only (no AI, no made-up numbers).
  const insights: string[] = []
  for (const m of ms) if (m.prevScore != null && Math.round(m.prevScore) !== Math.round(m.score))
    insights.push(`Your ${m.topic.name} mastery ${m.score > m.prevScore ? 'improved' : 'dropped'} from ${Math.round(m.prevScore)}% to ${Math.round(m.score)}%.`)
  if (ms[0]) insights.push(`${ms[0].topic.name} is currently your weakest concept (${Math.round(ms[0].score)}%). We recommend targeted revision.`)
  for (const x of mp.filter(x => x.count >= 2)) insights.push(`Recurring mistake: "${x.tag}" in ${ms.find(m => m.topicId === x.topicId)?.topic.name ?? 'a topic'} (${x.count} times).`)
  for (const m of ms.filter(m => Date.now() - m.lastPracticedAt.getTime() > 3 * 864e5)) insights.push(`${m.topic.name} has not been practiced for ${Math.floor((Date.now() - m.lastPracticedAt.getTime()) / 864e5)} days.`)
  return (
    <main className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <div><h1 className="text-3xl font-extrabold">Learning <span className="bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">analytics</span></h1><p className="text-sm opacity-60">Every chart and insight is computed from your stored learning history.</p></div>
      <section className="glass border-violet-400/30 p-4">
        <h2 className="mb-2 font-semibold">Insights</h2>
        {insights.length === 0 ? <p className="text-sm opacity-60">No insights yet. Complete an assessment first.</p> : <ul className="list-disc space-y-1 pl-5 text-sm">{insights.map((t, i) => <li key={i}>{t}</li>)}</ul>}
      </section>
      <AnalyticsCharts topics={topics} daily={daily} />
    </main>
  )
}
