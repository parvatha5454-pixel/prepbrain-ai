'use client'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Brain, Send, Sparkles, X } from 'lucide-react'
type Msg = { role: string; content: string }
const IDEAS = ['What should I revise first?', 'Explain my weakest topic simply']
export default function FloatingTutor() {
  const path = usePathname()
  const [open, setOpen] = useState(false), [msgs, setMsgs] = useState<Msg[]>([]), [text, setText] = useState(''), [busy, setBusy] = useState(false), [err, setErr] = useState('')
  const end = useRef<HTMLDivElement>(null)
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs, busy, open])
  if (path === '/tutor' || path === '/quiz') return null // full tutor page exists; hidden during quizzes so answers cannot be looked up
  async function ask(q: string) {
    q = q.trim(); if (!q || busy) return
    setText(''); setErr(''); setBusy(true); setMsgs(m => [...m, { role: 'user', content: q }])
    const r = await fetch('/api/tutor', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: q, mode: 'SIMPLE' }) })
    const j = await r.json().catch(() => ({})); setBusy(false)
    if (!r.ok) { setErr(j.error ?? 'Tutor unavailable, try again.'); return }
    setMsgs(m => [...m, { role: 'assistant', content: j.reply }])
  }
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>{open && <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="glass mb-3 flex h-[28rem] w-[calc(100vw-2rem)] flex-col overflow-hidden bg-[#11172f]/95 shadow-2xl sm:w-96">
        <div className="flex items-center justify-between border-b border-white/10 p-3"><div className="flex items-center gap-2"><div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400"><Brain size={16} /></div>
          <div><div className="text-sm font-bold">Ask PrepBrain</div><a href="/tutor" className="text-[11px] text-cyan-300 underline">Open full tutor</a></div></div>
          <button onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button></div>
        <div className="flex-1 space-y-3 overflow-y-auto p-3">
          {msgs.length === 0 && <div className="space-y-3 pt-6 text-center"><Sparkles className="mx-auto text-cyan-300" /><p className="text-sm opacity-70">Quick help from your tutor, based on your learner model.</p>
            <div className="flex flex-col gap-2">{IDEAS.map(s => <button key={s} onClick={() => ask(s)} className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs hover:bg-white/10">{s}</button>)}</div></div>}
          {msgs.map((m, i) => <div key={i} className={m.role === 'user' ? 'text-right' : ''}><div className={`inline-block max-w-[88%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-left text-sm ${m.role === 'user' ? 'bg-violet-500' : 'bg-white/10'}`}>{m.content}</div></div>)}
          {busy && <div className="flex gap-1 px-2">{[0, 1, 2].map(k => <motion.span key={k} className="h-2 w-2 rounded-full bg-cyan-300" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.7, repeat: Infinity, delay: k * 0.15 }} />)}</div>}
          <div ref={end} /></div>
        {err && <p className="px-3 pb-1 text-xs text-red-300">{err}</p>}
        <form onSubmit={e => { e.preventDefault(); ask(text) }} className="flex gap-2 border-t border-white/10 p-2">
          <input value={text} onChange={e => setText(e.target.value)} maxLength={1000} placeholder="Ask anything..." className="flex-1 bg-transparent px-2 text-sm outline-none" />
          <button disabled={busy || !text.trim()} aria-label="Send" className="grid h-9 w-9 place-items-center rounded-xl bg-violet-500 disabled:opacity-40"><Send size={16} /></button></form>
      </motion.div>}</AnimatePresence>
      <div className="flex justify-end"><motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }} onClick={() => setOpen(o => !o)} aria-label="Ask PrepBrain"
        className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 shadow-lg shadow-violet-500/30">{open ? <X /> : <Brain />}</motion.button></div>
    </div>
  )
}
