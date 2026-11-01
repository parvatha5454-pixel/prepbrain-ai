import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { getUserId } from '@/lib/auth'
import PrintButton from '@/components/PrintButton'
export const dynamic = 'force-dynamic'
export default async function Report() {
  const userId = await getUserId()
  if (!userId) redirect('/login')
  const user = await db.user.findUnique({ where: { id: userId }, include: { profile: true } })
  if (!user) redirect('/login')
  const [ms, mp, acts, total, correct] = await Promise.all([
    db.topicMastery.findMany({ where: { userId }, include: { topic: { include: { subject: true } } } }),
    db.mistakePattern.findMany({ where: { userId }, orderBy: { count: 'desc' }, take: 8 }),
    db.studyActivity.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 8 }),
    db.studentAnswer.count({ where: { userId } }), db.studentAnswer.count({ where: { userId, correct: true } }) ])
  const rows = ms.map(m => { const mistakes = mp.filter(p => p.topicId === m.topicId).reduce((s, p) => s + p.count, 0), days = (Date.now() - m.lastPracticedAt.getTime()) / 864e5
    return { id: m.id, name: `${m.topic.subject.name}: ${m.topic.name}`, score: Math.round(m.score), prev: m.prevScore == null ? '-' : `${Math.round(m.prevScore)}%`, level: m.currentDifficulty, mistakes,
      priority: (100 - m.score) * 0.6 + Math.min(mistakes, 10) * 2.5 + Math.min(days, 10) * 1.5 + (m.topic.weight - 1) * 3 } }).sort((a, b) => a.score - b.score)
  const focus = [...rows].sort((a, b) => b.priority - a.priority).slice(0, 3)
  const topicName = (id: string) => { const m = ms.find(x => x.topicId === id); return m ? `${m.topic.subject.name}: ${m.topic.name}` : 'Topic' }
  const H = ({ t }: { t: string }) => <h2 className="mb-2 mt-6 border-b border-white/20 pb-1 text-lg font-bold">{t}</h2>
  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-6">
      <div className="no-print mb-4 flex justify-end"><PrintButton /></div>
      <div className="print-area glass space-y-1 p-6">
        <h1 className="text-2xl font-extrabold">PrepBrain AI: Progress report</h1>
        <p className="text-sm">{user.name} · {new Date().toLocaleDateString('en-GB')}{user.isDemo ? ' · Demonstration data' : ''}</p>
        <H t="Summary" />
        <p className="text-sm">Overall mastery <b>{Math.round(user.profile?.overallMastery ?? 0)}%</b> · Questions answered <b>{total}</b> · Accuracy <b>{total ? Math.round((correct / total) * 100) : 0}%</b> · Study time <b>{user.profile?.studyMinutes ?? 0} min</b> · Streak <b>{user.profile?.streak ?? 0} days</b></p>
        <H t="Topic mastery" />
        {rows.length === 0 ? <p className="text-sm">No data yet. Complete an assessment first.</p> : <table className="w-full text-left text-sm"><thead><tr className="border-b border-white/20"><th className="py-1">Topic</th><th>Mastery</th><th>Previous</th><th>Level</th><th>Repeated mistakes</th></tr></thead>
          <tbody>{rows.map(r => <tr key={r.id} className="border-b border-white/10"><td className="py-1">{r.name}</td><td>{r.score}%</td><td>{r.prev}</td><td>{r.level}</td><td>{r.mistakes}</td></tr>)}</tbody></table>}
        {rows.length > 0 && <><H t="Strengths and gaps" />
          <p className="text-sm"><b>Strong (75%+):</b> {rows.filter(r => r.score >= 75).map(r => r.name).join(', ') || 'none yet'}</p>
          <p className="text-sm"><b>Needs work (under 50%):</b> {rows.filter(r => r.score < 50).map(r => r.name).join(', ') || 'none'}</p>
          <H t="Recommended focus" /><ol className="list-decimal pl-5 text-sm">{focus.map(f => <li key={f.id}>{f.name}: mastery {f.score}%, {f.mistakes} repeated mistakes</li>)}</ol></>}
        {mp.length > 0 && <><H t="Recurring mistakes" /><ul className="list-disc pl-5 text-sm">{mp.map(m => <li key={m.id}>{m.tag} in {topicName(m.topicId)}: {m.count}x</li>)}</ul></>}
        {acts.length > 0 && <><H t="Recent activity" /><ul className="list-disc pl-5 text-sm">{acts.map(a => <li key={a.id}>{a.detail} ({a.createdAt.toLocaleDateString('en-GB')}{a.minutes ? `, ${a.minutes} min` : ''})</li>)}</ul></>}
        <p className="pt-6 text-xs">Generated from your stored learning data. Mastery uses a transparent rule-based algorithm (see README).</p>
      </div>
    </main>
  )
}
