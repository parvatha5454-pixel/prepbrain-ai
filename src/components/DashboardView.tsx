'use client'
import { motion } from 'framer-motion'
import { AlertTriangle, ArrowRight, Clock, Flame, Gauge, MessageSquare, Sparkles, TrendingDown, TrendingUp } from 'lucide-react'
type T = { id: string; name: string; score: number; prev: number | null; difficulty: number; mistakes: number }
type D = { name: string; isDemo: boolean; overall: number; attempted: number; minutes: number; streak: number; topics: T[]; next: { title: string; reason: string } | null;
  mistakes: { tag: string; count: number; topic: string }[]; acts: { id: string; detail: string; date: string; minutes: number }[] }
const tone = (s: number) => s < 50 ? { c: '#fb7185', l: 'Needs work' } : s < 75 ? { c: '#fbbf24', l: 'Developing' } : { c: '#34d399', l: 'Strong' }
const up = (i: number) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.06, duration: 0.45 } })
function Ring({ v }: { v: number }) {
  const C = 2 * Math.PI * 54
  return <div className="relative h-36 w-36"><svg viewBox="0 0 128 128" className="-rotate-90"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stopColor="#a78bfa" /><stop offset="1" stopColor="#22d3ee" /></linearGradient></defs>
    <circle cx="64" cy="64" r="54" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="10" />
    <motion.circle cx="64" cy="64" r="54" fill="none" stroke="url(#g)" strokeWidth="10" strokeLinecap="round" strokeDasharray={C} initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: C * (1 - v / 100) }} transition={{ duration: 1.2, ease: 'easeOut' }} /></svg>
    <div className="absolute inset-0 grid place-items-center text-center"><div><div className="text-3xl font-extrabold">{v}%</div><div className="text-[10px] uppercase tracking-wider opacity-60">Overall mastery</div></div></div></div>
}
export default function DashboardView({ data: d }: { data: D }) {
  const stats = [[Gauge, 'Questions attempted', String(d.attempted)], [Clock, 'Study time', `${d.minutes} min`], [Flame, 'Streak', `${d.streak} days`]] as const
  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <motion.div {...up(0)} className="flex flex-wrap items-end justify-between gap-2">
        <div><h1 className="text-3xl font-extrabold">Welcome back, <span className="bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">{d.name}</span></h1>
          <p className="text-sm opacity-60">Here is what your learner model knows about you today.</p></div>
        {d.isDemo && <span className="rounded-full bg-amber-400/15 px-3 py-1 text-xs text-amber-200">Demonstration data</span>}
      </motion.div>
      <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
        <motion.div {...up(1)} className="glass grid place-items-center p-5"><Ring v={d.overall} /></motion.div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">{stats.map(([I, l, v], i) => <motion.div key={l} {...up(i + 2)} whileHover={{ y: -3 }} className="glass p-4">
          <I size={18} className="mb-2 text-cyan-300" /><div className="text-2xl font-bold">{v}</div><div className="text-xs opacity-60">{l}</div></motion.div>)}</div>
      </div>
      {d.next && <motion.div {...up(5)} className="rounded-2xl bg-gradient-to-r from-violet-500/60 to-cyan-400/60 p-[1px]"><div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#11172f] p-5">
        <div className="flex items-start gap-3"><Sparkles className="mt-1 text-cyan-300" /><div><div className="text-xs uppercase tracking-wider opacity-60">Next best action</div><div className="text-xl font-bold">{d.next.title}</div><p className="text-sm opacity-70">{d.next.reason}</p></div></div>
        <div className="flex gap-2"><a href="/quiz" className="flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold hover:bg-violet-400">Start practice <ArrowRight size={16} /></a>
          <a href="/tutor" className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm hover:bg-white/15"><MessageSquare size={16} />Ask tutor</a></div></div></motion.div>}
      <section><h2 className="mb-3 font-semibold">Topic mastery</h2>
        {d.topics.length === 0 ? <div className="glass p-6 text-center text-sm opacity-70">No data yet. <a href="/quiz" className="text-cyan-300 underline">Take your first assessment</a> to build your learner model.</div> :
          <div className="grid gap-4 sm:grid-cols-2">{d.topics.map((t, i) => { const k = tone(t.score), delta = t.prev == null ? 0 : t.score - t.prev
            return <motion.a key={t.id} href="/quiz" {...up(i + 6)} whileHover={{ y: -4 }} className="glass block p-4">
              <div className="flex items-center justify-between"><span className="font-semibold">{t.name}</span><span className="rounded-full px-2 py-0.5 text-xs" style={{ background: k.c + '22', color: k.c }}>{k.l}</span></div>
              <div className="mt-2 flex items-baseline gap-2"><span className="text-3xl font-extrabold">{t.score}%</span>
                {t.prev != null && delta !== 0 && <span className={`flex items-center gap-1 text-xs ${delta > 0 ? 'text-emerald-300' : 'text-rose-300'}`}>{delta > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}{delta > 0 ? '+' : ''}{delta}</span>}</div>
              <div className="mt-3 h-2 rounded bg-white/10"><motion.div className="h-2 rounded" style={{ background: k.c }} initial={{ width: 0 }} animate={{ width: `${t.score}%` }} transition={{ duration: 0.9, delay: 0.2 }} /></div>
              <div className="mt-2 flex justify-between text-xs opacity-60"><span>Difficulty level {t.difficulty}</span>{t.mistakes > 0 && <span>{t.mistakes} repeated mistakes</span>}</div></motion.a> })}</div>}
      </section>
      <div className="grid gap-4 md:grid-cols-2">
        <motion.section {...up(10)} className="glass p-4"><h2 className="mb-3 flex items-center gap-2 font-semibold"><AlertTriangle size={16} className="text-amber-300" />Recurring mistakes</h2>
          {d.mistakes.length === 0 ? <p className="text-sm opacity-60">None detected yet.</p> : <div className="flex flex-wrap gap-2">{d.mistakes.map(m => <span key={m.tag + m.topic} className="rounded-full bg-amber-400/10 px-3 py-1 text-xs text-amber-200">{m.tag} · {m.topic} · {m.count}x</span>)}</div>}</motion.section>
        <motion.section {...up(11)} className="glass p-4"><h2 className="mb-3 font-semibold">Recent activity</h2>
          {d.acts.length === 0 ? <p className="text-sm opacity-60">No activity yet.</p> : <ul className="space-y-3 border-l border-white/10 pl-4">{d.acts.map(a => <li key={a.id} className="relative text-sm">
            <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-cyan-300" />{a.detail}<div className="text-xs opacity-50">{a.date}{a.minutes ? ` · ${a.minutes} min` : ''}</div></li>)}</ul>}</motion.section>
      </div>
    </main>
  )
}
