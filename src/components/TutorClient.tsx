'use client'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Brain, Send, Sparkles } from 'lucide-react'
type Msg = { role: string; content: string }
const MODES = [['BEGINNER', 'Beginner'], ['SIMPLE', 'Simple'], ['DETAILED', 'Detailed'], ['EXAMPLE', 'Example-based']]
const IDEAS = ['Explain functions', 'Why does my loop miss the last number?', 'Show an example of list slicing', 'What should I revise first?']
export default function TutorClient({ initial }: { initial: Msg[] }) {
  const [msgs, setMsgs] = useState<Msg[]>(initial), [text, setText] = useState(''), [mode, setMode] = useState('SIMPLE')
  const [busy, setBusy] = useState(false), [err, setErr] = useState(''), [ai, setAi] = useState<boolean | null>(null)
  const end = useRef<HTMLDivElement>(null)
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs, busy])
  async function ask(q: string) {
    q = q.trim(); if (!q || busy) return
    setText(''); setErr(''); setBusy(true); setMsgs(m => [...m, { role: 'user', content: q }])
    const r = await fetch('/api/tutor', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: q, mode }) })
    const j = await r.json().catch(() => ({})); setBusy(false)
    if (!r.ok) { setErr(j.error ?? 'Tutor unavailable, try again.'); return }
    setAi(j.ai); setMsgs(m => [...m, { role: 'assistant', content: j.reply }])
  }
  return (
    <main className="mx-auto flex h-[calc(100vh-1rem)] max-w-3xl flex-col gap-3 p-3 sm:p-5 md:h-screen">
      <div className="glass flex items-center justify-between p-3">
        <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400"><Brain size={20} /></div>
          <div><div className="font-bold">PrepBrain Tutor</div><div className="text-xs opacity-60">Knows your weak topics and repeated mistakes</div></div></div>
        {ai !== null && <span className={`rounded-full px-3 py-1 text-xs ${ai ? 'bg-emerald-400/15 text-emerald-200' : 'bg-amber-400/15 text-amber-200'}`}>{ai ? 'Gemini AI' : 'Offline mode'}</span>}
      </div>
      <div className="flex flex-wrap gap-2">{MODES.map(([v, l]) => <button key={v} onClick={() => setMode(v)} className={`rounded-full px-4 py-1.5 text-sm transition ${mode === v ? 'bg-violet-500 ring-2 ring-violet-300/30' : 'bg-white/10 hover:bg-white/15'}`}>{l}</button>)}</div>
      <div className="glass flex-1 space-y-4 overflow-y-auto p-4">
        {msgs.length === 0 && <div className="grid h-full place-items-center text-center"><div className="space-y-4"><Sparkles className="mx-auto text-cyan-300" /><p className="text-sm opacity-70">Ask anything about Python, or try one of these:</p>
          <div className="flex flex-wrap justify-center gap-2">{IDEAS.map(s => <button key={s} onClick={() => ask(s)} className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10">{s}</button>)}</div></div></div>}
        <AnimatePresence initial={false}>{msgs.map((m, i) => <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : ''}`}>
          {m.role !== 'user' && <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400"><Brain size={16} /></div>}
          <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === 'user' ? 'rounded-br-sm bg-gradient-to-br from-violet-500 to-violet-600' : 'rounded-bl-sm bg-white/10'}`}>{m.content}</div></motion.div>)}</AnimatePresence>
        {busy && <div className="flex gap-2"><div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400"><Brain size={16} /></div>
          <div className="flex items-center gap-1 rounded-2xl bg-white/10 px-4 py-3">{[0, 1, 2].map(k => <motion.span key={k} className="h-2 w-2 rounded-full bg-cyan-300" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.7, repeat: Infinity, delay: k * 0.15 }} />)}</div></div>}
        <div ref={end} />
      </div>
      {err && <p className="text-sm text-red-300">{err}</p>}
      <form onSubmit={e => { e.preventDefault(); ask(text) }} className="glass flex items-center gap-2 p-2">
        <input value={text} onChange={e => setText(e.target.value)} maxLength={1000} placeholder="Ask your tutor..." className="flex-1 bg-transparent p-2 outline-none" />
        <button disabled={busy || !text.trim()} aria-label="Send" className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500 disabled:opacity-40"><Send size={18} /></button>
      </form>
    </main>
  )
}
