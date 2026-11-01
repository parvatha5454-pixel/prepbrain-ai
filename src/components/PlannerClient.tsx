'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CalendarCheck, Check, RefreshCw } from 'lucide-react'
type T = { id: string; title: string; reason: string; priority: number; dueDay: number; done: boolean }
const label = (d: number) => (d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : `Day ${d + 1}`)
const level = (p: number) => p >= 40 ? { l: 'High', c: '#fb7185' } : p >= 25 ? { l: 'Medium', c: '#fbbf24' } : { l: 'Low', c: '#34d399' }
export default function PlannerClient({ tasks: init, generatedAt }: { tasks: T[]; generatedAt: string | null }) {
  const [tasks, setTasks] = useState(init), [busy, setBusy] = useState(false), [err, setErr] = useState('')
  const router = useRouter()
  async function toggle(t: T) {
    setTasks(ts => ts.map(x => x.id === t.id ? { ...x, done: !x.done } : x))
    const r = await fetch('/api/planner/toggle', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ taskId: t.id, done: !t.done }) })
    if (!r.ok) { setTasks(ts => ts.map(x => x.id === t.id ? { ...x, done: t.done } : x)); setErr('Could not save, try again.') }
  }
  async function regenerate() {
    setBusy(true); setErr('')
    const r = await fetch('/api/planner/generate', { method: 'POST' }); const j = await r.json().catch(() => ({})); setBusy(false)
    if (!r.ok) { setErr(j.error ?? 'Could not generate plan'); return }
    router.refresh(); setTimeout(() => window.location.reload(), 200)
  }
  const done = tasks.filter(t => t.done).length, pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0
  return (
    <main className="mx-auto max-w-3xl space-y-5 p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-3xl font-extrabold">Study <span className="bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">planner</span></h1>
        <p className="text-sm opacity-60">Ranked by weakness, repeated mistakes and time since you last revised.{generatedAt && ` Generated ${generatedAt}`}</p></div>
        <button onClick={regenerate} disabled={busy} className="flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold disabled:opacity-50"><RefreshCw size={16} className={busy ? 'animate-spin' : ''} />{busy ? 'Planning...' : tasks.length ? 'Regenerate plan' : 'Generate plan'}</button></div>
      {err && <p className="rounded-lg bg-red-500/10 p-2 text-sm text-red-300">{err}</p>}
      {tasks.length === 0 ? <div className="glass grid place-items-center gap-3 p-10 text-center"><CalendarCheck size={36} className="text-cyan-300" /><p className="text-sm opacity-70">No plan yet. Complete an assessment, then generate your personalised plan.</p><a href="/quiz" className="rounded-xl bg-white/10 px-4 py-2 text-sm hover:bg-white/15">Take an assessment</a></div> : <>
        <div className="glass p-4"><div className="mb-2 flex justify-between text-sm"><span>{done} of {tasks.length} tasks done</span><span className="text-cyan-300">{pct}%</span></div>
          <div className="h-2 rounded bg-white/10"><motion.div className="h-2 rounded bg-gradient-to-r from-violet-400 to-cyan-300" animate={{ width: `${pct}%` }} /></div></div>
        <ul className="space-y-3">{tasks.map((t, i) => { const p = level(t.priority)
          return <motion.li key={t.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <button onClick={() => toggle(t)} className="glass flex w-full items-start gap-4 p-4 text-left transition hover:bg-white/10">
              <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg border ${t.done ? 'border-emerald-400 bg-emerald-400/20 text-emerald-300' : 'border-white/25'}`}>{t.done && <Check size={14} />}</span>
              <div className={`flex-1 ${t.done ? 'opacity-50' : ''}`}><div className={`font-semibold ${t.done ? 'line-through' : ''}`}>{t.title}</div><div className="mt-0.5 text-sm opacity-70">{t.reason}</div>
                <div className="mt-2 flex gap-2 text-xs"><span className="rounded-full bg-white/10 px-2 py-0.5">{label(t.dueDay)}</span><span className="rounded-full px-2 py-0.5" style={{ background: p.c + '22', color: p.c }}>{p.l} priority</span></div></div></button></motion.li> })}</ul></>}
    </main>
  )
}
