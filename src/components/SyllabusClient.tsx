'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Sparkles, Upload } from 'lucide-react'
type Topic = { id: string; name: string; weight: number }
type Res = { subjectId: string; subject: string; ai: boolean; topics: Topic[] }
const post = (url: string, b: object) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) })
export default function SyllabusClient({ existing }: { existing: { id: string; name: string; topics: number; questions: number }[] }) {
  const [name, setName] = useState(''), [text, setText] = useState(''), [busy, setBusy] = useState(false), [err, setErr] = useState('')
  const [res, setRes] = useState<Res | null>(null), [prog, setProg] = useState(''), [done, setDone] = useState(false)
  const [pdf, setPdf] = useState(''), [pdfName, setPdfName] = useState('')
  function onFile(f?: File) {
    if (!f) return; setErr('')
    if (f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')) {
      if (f.size > 3_000_000) { setErr('PDF too large (max 3 MB). Try a smaller file or paste the text.'); return }
      const r = new FileReader(); r.onload = () => { setPdf(String(r.result).split(',')[1] ?? ''); setPdfName(f.name) }; r.readAsDataURL(f); return
    }
    if (f.size > 200_000) { setErr('Text file too large (max 200 KB).'); return }
    const r = new FileReader(); r.onload = () => { setText(String(r.result)); setPdf(''); setPdfName('') }; r.readAsText(f)
  }
  async function analyze() {
    setBusy(true); setErr(''); setRes(null); setDone(false); setProg('')
    const r = await post('/api/syllabus/analyze', { name: name || undefined, text: pdf ? undefined : text, pdf: pdf || undefined }); const j = await r.json().catch(() => ({})); setBusy(false)
    if (!r.ok) { setErr(j.error ?? 'Could not read the syllabus'); return }
    setRes(j)
  }
  async function generate() {
    if (!res) return; setBusy(true); setErr(''); let added = 0
    const top = [...res.topics].sort((a, b) => b.weight - a.weight).slice(0, 6)
    for (let i = 0; i < top.length; i++) {
      setProg(`Writing questions ${i + 1}/${top.length}: ${top[i].name}...`)
      const r = await post('/api/questions/generate', { subjectId: res.subjectId, topicId: top[i].id }); const j = await r.json().catch(() => ({}))
      if (r.ok) added += j.added; else if (r.status === 503 || r.status === 429) { setErr(j.error); break }
    }
    setBusy(false); setProg(`Added ${added} AI questions for your most important topics.`); setDone(added > 0)
  }
  return (
    <main className="mx-auto max-w-3xl space-y-5 p-4 sm:p-6">
      <div><h1 className="text-3xl font-extrabold">My <span className="bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">subjects</span></h1>
        <p className="text-sm opacity-60">Paste or upload your syllabus. PrepBrain finds the topics, ranks their importance, and writes practice questions from it.</p></div>
      <div className="glass space-y-3 p-5">
        <input value={name} onChange={e => setName(e.target.value)} maxLength={60} placeholder="Subject name (optional, AI will detect it)" className="w-full rounded-xl border border-white/10 bg-white/5 p-3 outline-none focus:border-violet-400" />
        <textarea value={text} onChange={e => setText(e.target.value)} rows={8} placeholder={'Paste your syllabus here, one topic per line.\nExample:\nUnit 1: Thermodynamics (20 marks)\nUnit 2: Kinematics (15 marks)'} className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm outline-none focus:border-violet-400" />
        <div className="flex flex-wrap items-center gap-3"><label className="flex cursor-pointer items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm hover:bg-white/15"><Upload size={16} />Upload PDF / .txt / .md<input type="file" accept=".txt,.md,.pdf,text/plain,application/pdf" className="hidden" onChange={e => onFile(e.target.files?.[0])} /></label>
          <button onClick={analyze} disabled={busy || (text.trim().length < 40 && !pdf)} className="flex items-center gap-2 rounded-xl bg-violet-500 px-5 py-2 text-sm font-semibold disabled:opacity-40"><FileText size={16} />{busy && !res ? 'Reading syllabus...' : 'Analyze syllabus'}</button></div>
        {err && <p className="rounded-lg bg-red-500/10 p-2 text-sm text-red-300">{err}</p>}
        {pdfName && <p className="text-sm text-cyan-200">PDF attached: {pdfName} <button onClick={() => { setPdf(''); setPdfName('') }} className="ml-2 underline">remove</button></p>}
        <p className="text-xs opacity-50">Your syllabus (text or PDF) is sent to Gemini to extract topics. Do not include private information.</p>
      </div>
      {res && <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="glass space-y-4 p-5">
        <div className="flex items-center justify-between"><h2 className="text-xl font-bold">{res.subject}</h2><span className={`rounded-full px-2 py-1 text-xs ${res.ai ? 'bg-cyan-400/20 text-cyan-200' : 'bg-amber-400/20 text-amber-200'}`}>{res.ai ? 'AI-extracted' : 'Basic parse (no AI)'}</span></div>
        <ul className="space-y-2">{[...res.topics].sort((a, b) => b.weight - a.weight).map(t => <li key={t.id} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm"><span>{t.name}</span>
          <span className="flex items-center gap-2 text-xs opacity-70">importance<span className="flex gap-0.5">{[1, 2, 3, 4, 5].map(d => <span key={d} className={`h-2 w-2 rounded-full ${d <= t.weight ? 'bg-cyan-300' : 'bg-white/15'}`} />)}</span></span></li>)}</ul>
        <button onClick={generate} disabled={busy || done} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 p-3 font-semibold disabled:opacity-50"><Sparkles size={18} />{busy ? 'Working...' : 'Generate AI questions for the top topics'}</button>
        {prog && <p className="text-sm opacity-80">{prog}</p>}
        {done && <a href="/quiz" className="block rounded-xl bg-white/10 p-3 text-center font-semibold hover:bg-white/15">Start an assessment</a>}
        <p className="text-xs opacity-50">AI questions can contain mistakes. Spot-check them, they are labelled "AI-generated".</p>
      </motion.div>}
      {existing.length > 0 && <div className="glass p-5"><h2 className="mb-3 font-semibold">Your subjects</h2><ul className="space-y-2">{existing.map(s => <li key={s.id} className="flex justify-between rounded-xl bg-white/5 px-3 py-2 text-sm"><span>{s.name}</span><span className="opacity-60">{s.topics} topics · {s.questions} questions</span></li>)}</ul></div>}
    </main>
  )
}
