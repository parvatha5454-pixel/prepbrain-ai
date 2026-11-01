'use client'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Check, CheckCircle2, Clock, Cpu, Play, Sparkles, TrendingDown, TrendingUp, XCircle } from 'lucide-react'
type Q = { ai?: boolean; id: string; topic: string; difficulty: number; prompt: string; options: string[] }
type Step = { agent: string; mode: 'rules' | 'gemini' | 'fallback'; summary: string; details: string[]; ms: number }
type Res = { trace: Step[]; score: number; nextAction?: string; recommendation: { text: string; ai: boolean };
  review: { topic: string; prompt: string; given: string; correct: boolean; answer: string; explanation: string }[];
  mastery: { topic: string; before: number | null; after: number; difficulty: number }[] }
function Ring({ v }: { v: number }) {
  const C = 2 * Math.PI * 54
  return <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 120 }} className="relative h-40 w-40">
    <svg viewBox="0 0 128 128" className="-rotate-90"><defs><linearGradient id="qg" x1="0" x2="1"><stop offset="0" stopColor="#a78bfa" /><stop offset="1" stopColor="#22d3ee" /></linearGradient></defs>
      <circle cx="64" cy="64" r="54" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="10" />
      <motion.circle cx="64" cy="64" r="54" fill="none" stroke="url(#qg)" strokeWidth="10" strokeLinecap="round" strokeDasharray={C} initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: C * (1 - v / 100) }} transition={{ duration: 1.3, ease: 'easeOut' }} /></svg>
    <div className="absolute inset-0 grid place-items-center text-4xl font-extrabold">{v}%</div></motion.div>
}
export default function QuizClient({ subjects }: { subjects: { id: string; name: string; topics: { id: string; name: string }[] }[] }) {
  const [subjectId, setSubjectId] = useState(subjects.find(s => s.name === 'Python')?.id ?? subjects[0]?.id ?? '')
  const topics = subjects.find(s => s.id === subjectId)?.topics ?? []
  const [phase, setPhase] = useState<'setup' | 'run' | 'result'>('setup')
  const [topicId, setTopicId] = useState(''), [err, setErr] = useState(''), [busy, setBusy] = useState(false)
  const [aid, setAid] = useState(''), [qs, setQs] = useState<Q[]>([]), [i, setI] = useState(0), [sel, setSel] = useState('')
  const [answers, setAnswers] = useState<{ questionId: string; given: string; responseMs: number }[]>([])
  const [res, setRes] = useState<Res | null>(null), [secs, setSecs] = useState(0)
  const t0 = useRef(0)
  const [gen, setGen] = useState(''), [genBusy, setGenBusy] = useState(false)
  async function generate() {
    setGenBusy(true); setGen('')
    const r = await fetch('/api/questions/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subjectId, ...(topicId ? { topicId } : {}) }) })
    const j = await r.json().catch(() => ({})); setGenBusy(false)
    setGen(r.ok ? `Added ${j.added} new ${j.topic} questions aimed at your weak spots. They can appear in your next assessment.` : (j.error ?? 'Could not generate questions.'))
  }
  useEffect(() => { if (phase !== 'run') return; const id = setInterval(() => setSecs(s => s + 1), 1000); return () => clearInterval(id) }, [phase])
  async function start() {
    setBusy(true); setErr('')
    const r = await fetch('/api/assessment/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subjectId, ...(topicId ? { topicId } : {}) }) })
    const j = await r.json(); setBusy(false)
    if (!r.ok) { setErr(j.error ?? 'Could not start'); return }
    setAid(j.assessmentId); setQs(j.questions); setI(0); setSel(''); setAnswers([]); setSecs(0); t0.current = Date.now(); setPhase('run')
  }
  async function next() {
    const all = [...answers, { questionId: qs[i].id, given: sel, responseMs: Date.now() - t0.current }]
    setAnswers(all); setSel(''); t0.current = Date.now()
    if (i + 1 < qs.length) { setI(i + 1); return }
    setBusy(true)
    const r = await fetch('/api/assessment/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assessmentId: aid, answers: all }) })
    const j = await r.json(); setBusy(false)
    if (!r.ok) { setErr(j.error ?? 'Submit failed'); return }
    setRes(j); setPhase('result')
  }
  const pills = [{ id: '', name: 'All topics' }, ...topics]
  return (
    <main className="mx-auto max-w-3xl space-y-5 p-4 sm:p-6">
      {phase === 'setup' && <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass space-y-5 p-6">
        <div><h1 className="text-3xl font-extrabold">Assessment</h1><p className="mt-1 text-sm opacity-70">Questions adapt to your saved learner model. Your mastery updates the moment you finish.</p></div>
        <div className="flex flex-wrap gap-2">{['Adaptive difficulty', 'Timed', 'Instant learner-model update'].map(c => <span key={c} className="rounded-full bg-white/10 px-3 py-1 text-xs">{c}</span>)}</div>
        {subjects.length > 1 && <div><div className="mb-2 text-xs uppercase tracking-wider opacity-60">Subject</div><div className="flex flex-wrap gap-2">{subjects.map(s => <button key={s.id} onClick={() => { setSubjectId(s.id); setTopicId('') }} className={`rounded-xl px-4 py-2 text-sm transition ${subjectId === s.id ? 'bg-cyan-500/80' : 'bg-white/10 hover:bg-white/15'}`}>{s.name}</button>)}</div></div>}
        <div><div className="mb-2 text-xs uppercase tracking-wider opacity-60">Choose a topic</div><div className="flex flex-wrap gap-2">{pills.map(p => <button key={p.id} onClick={() => setTopicId(p.id)}
          className={`rounded-xl px-4 py-2 text-sm transition ${topicId === p.id ? 'bg-violet-500 ring-2 ring-violet-300/40' : 'bg-white/10 hover:bg-white/15'}`}>{p.name}</button>)}</div></div>
        {err && <p className="text-sm text-red-300">{err}</p>}
        <button onClick={generate} disabled={genBusy || busy} className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/5 p-3 text-sm text-cyan-200 hover:bg-cyan-400/10 disabled:opacity-50"><Sparkles size={16} className={genBusy ? 'animate-pulse' : ''} />{genBusy ? 'Gemini is writing questions...' : 'Generate AI questions for my weak spots'}</button>
        {gen && <p className="text-xs opacity-80">{gen}</p>}
        <button onClick={start} disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 p-3 font-semibold disabled:opacity-50"><Play size={18} />{busy ? 'Preparing questions...' : 'Start assessment'}</button>
      </motion.div>}
      {phase === 'run' && qs[i] && <div className="space-y-4">
        <div className="flex items-center gap-3"><div className="flex flex-1 gap-1">{qs.map((_, k) => <div key={k} className="h-1.5 flex-1 rounded bg-white/10"><motion.div className="h-1.5 rounded bg-gradient-to-r from-violet-400 to-cyan-300" animate={{ width: k < i ? '100%' : k === i ? '45%' : '0%' }} /></div>)}</div>
          <span className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs"><Clock size={12} />{Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}</span></div>
        <AnimatePresence mode="wait"><motion.div key={i} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="glass space-y-5 p-6">
          <div className="flex items-center justify-between text-xs"><span className="rounded-full bg-violet-500/20 px-3 py-1 text-violet-200">{qs[i].topic}</span>{qs[i].ai && <span className="ml-2 rounded-full bg-cyan-400/20 px-2 py-1 text-cyan-200">AI-generated</span>}
            <span className="flex items-center gap-2 opacity-70">Question {i + 1}/{qs.length}<span className="flex gap-1">{[1, 2, 3].map(d => <span key={d} className={`h-2 w-2 rounded-full ${d <= qs[i].difficulty ? 'bg-cyan-300' : 'bg-white/15'}`} />)}</span></span></div>
          <h2 className="whitespace-pre-wrap text-xl font-semibold leading-snug">{qs[i].prompt}</h2>
          <div className="space-y-2">{qs[i].options.map((o, k) => <motion.button key={o} whileTap={{ scale: 0.98 }} onClick={() => setSel(o)}
            className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${sel === o ? 'border-violet-400 bg-violet-500/20' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
            <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold ${sel === o ? 'bg-violet-500' : 'bg-white/10'}`}>{sel === o ? <Check size={14} /> : 'ABCD'[k]}</span><span>{o}</span></motion.button>)}</div>
        </motion.div></AnimatePresence>
        {err && <p className="text-sm text-red-300">{err}</p>}
        <button onClick={next} disabled={!sel || busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500 p-3 font-semibold disabled:opacity-40">{busy ? 'Saving to your learner model...' : i + 1 < qs.length ? <>Next <ArrowRight size={16} /></> : 'Finish'}</button>
      </div>}
      {phase === 'result' && res && <div className="space-y-4">
        <div className="glass flex flex-col items-center gap-3 p-6 text-center"><Ring v={res.score} />
          <h1 className="text-2xl font-extrabold">{res.score >= 80 ? 'Excellent work!' : res.score >= 50 ? 'Good progress!' : 'Keep going, you are learning!'}</h1>
          <p className="text-sm opacity-70">{res.review.filter(r => r.correct).length} of {res.review.length} correct. Your learner model is updated.</p></div>
        <div className="glass space-y-3 p-4"><h2 className="font-semibold">Mastery changes</h2>
          {res.mastery.map(m => { const a = Math.round(m.after), b = m.before === null ? null : Math.round(m.before), dl = b === null ? 0 : a - b
            return <div key={m.topic}><div className="flex items-center justify-between text-sm"><span>{m.topic}</span><span className="flex items-center gap-2">{b === null ? 'new' : `${b}%`} → <b>{a}%</b>
              {dl !== 0 && <span className={`flex items-center text-xs ${dl > 0 ? 'text-emerald-300' : 'text-rose-300'}`}>{dl > 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}{dl > 0 ? '+' : ''}{dl}</span>}</span></div>
              <div className="mt-1 h-1.5 rounded bg-white/10"><motion.div className="h-1.5 rounded bg-gradient-to-r from-violet-400 to-cyan-300" initial={{ width: 0 }} animate={{ width: `${a}%` }} transition={{ duration: 0.9 }} /></div>
              <div className="mt-1 text-xs opacity-50">Next difficulty level {m.difficulty}</div></div> })}</div>
        <div className="rounded-2xl bg-gradient-to-r from-violet-500/60 to-cyan-400/60 p-[1px]"><div className="flex gap-3 rounded-2xl bg-[#11172f] p-4"><Sparkles className="mt-1 shrink-0 text-cyan-300" /><div>
          <div className="text-xs uppercase tracking-wider opacity-60">Next best action</div><div className="font-bold">{res.nextAction}</div><p className="text-sm opacity-70">{res.recommendation.text}</p></div></div></div>
        <div className="glass space-y-4 p-4"><div><h2 className="flex items-center gap-2 font-semibold"><Cpu size={16} className="text-cyan-300" />How PrepBrain decided</h2><p className="text-xs opacity-60">Rules make the learning decisions. Gemini only explains.</p></div>
          <ol className="space-y-4 border-l border-white/10 pl-5">{res.trace.map((s, k) => <motion.li key={s.agent} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + k * 0.25 }} className="relative">
            <span className="absolute -left-[27px] top-1 grid h-4 w-4 place-items-center rounded-full bg-cyan-300 text-[9px] font-bold text-black">{k + 1}</span>
            <div className="flex flex-wrap items-center gap-2 text-sm"><b>{s.agent}</b>
              <span className={`rounded-full px-2 py-0.5 text-[10px] ${s.mode === 'gemini' ? 'bg-cyan-400/20 text-cyan-200' : s.mode === 'rules' ? 'bg-violet-400/20 text-violet-200' : 'bg-amber-400/20 text-amber-200'}`}>{s.mode === 'gemini' ? 'Gemini' : s.mode === 'rules' ? 'Rule-based' : 'Rule fallback'}</span>
              <span className="text-xs opacity-40">{s.ms} ms</span></div>
            <p className="text-sm">{s.summary}</p><ul className="mt-1 space-y-0.5 text-xs opacity-60">{s.details.map((d, j) => <li key={j}>{d}</li>)}</ul></motion.li>)}</ol></div>
        <div className="glass space-y-3 p-4"><h2 className="font-semibold">Review</h2>{res.review.map((r, k) => <div key={k} className="flex gap-3 text-sm">
          {r.correct ? <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-300" /> : <XCircle size={18} className="mt-0.5 shrink-0 text-rose-300" />}
          <div><p className="whitespace-pre-wrap font-medium">{r.prompt}</p>{!r.correct && <p className="opacity-80">You: {r.given} · Correct: <span className="text-emerald-300">{r.answer}</span></p>}<p className="text-xs opacity-60">{r.explanation}</p></div></div>)}</div>
        <div className="flex gap-3"><button onClick={() => { setPhase('setup'); setRes(null) }} className="flex-1 rounded-xl bg-violet-500 p-3 font-semibold">Take another</button>
          <a href="/dashboard" className="flex-1 rounded-xl bg-white/10 p-3 text-center font-semibold hover:bg-white/15">Dashboard</a></div>
      </div>}
    </main>
  )
}
