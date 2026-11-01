'use client'
import { motion } from 'framer-motion'
import { ArrowRight, BarChart3, Brain, CalendarCheck, MessageSquare, Repeat, Target } from 'lucide-react'
const fade = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } }
const features = [
  { icon: Brain, t: 'Persistent learner model', d: 'Mastery per topic is stored in a database and survives logout, login and refresh.' },
  { icon: Target, t: 'Adaptive quiz engine', d: 'Difficulty rises, holds or drops from your recent answers. Never random.' },
  { icon: MessageSquare, t: 'Tutor that knows you', d: 'Four explanation modes that use your weak topics and repeated mistakes.' },
  { icon: Repeat, t: 'Mistake detection', d: 'Repeated misconceptions are tracked by pattern, not just counted as wrong.' },
  { icon: CalendarCheck, t: 'Smart study planner', d: 'Weakest, most-repeated and least-revised topics come first.' },
  { icon: BarChart3, t: 'Real analytics', d: 'Every chart and insight is computed from your stored learning history.' },
]
const steps = [
  ['Assess', 'Answer a short quiz. Each answer is graded and saved.'],
  ['Remember', 'Your mastery, mistakes and difficulty level are updated in your learner model.'],
  ['Decide', 'Rules pick your next best action and rebuild your study plan.'],
  ['Improve', 'Practice, ask the tutor, and watch the model change as you improve.'],
]
const sample: [string, number][] = [['Variables', 92], ['Lists', 78], ['Loops', 45], ['Functions', 32]]
export default function Landing({ loggedIn }: { loggedIn: boolean }) {
  const cta = loggedIn ? { href: '/dashboard', label: 'Go to dashboard' } : { href: '/register', label: 'Get started free' }
  return (
    <div className="relative overflow-hidden">
      <motion.div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-violet-600/30 blur-3xl" animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 8, repeat: Infinity }} />
      <motion.div className="pointer-events-none absolute top-40 -right-40 h-[360px] w-[360px] rounded-full bg-cyan-500/20 blur-3xl" animate={{ y: [0, 40, 0] }} transition={{ duration: 10, repeat: Infinity }} />
      <nav className="relative mx-auto flex max-w-5xl items-center justify-between p-6">
        <span className="text-lg font-bold bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">PrepBrain AI</span>
        <div className="flex items-center gap-3 text-sm">
          <a href="#features" className="hidden opacity-80 hover:opacity-100 sm:block">Features</a>
          <a href="#how" className="hidden opacity-80 hover:opacity-100 sm:block">How it works</a>
          {!loggedIn && <a href="/login" className="opacity-80 hover:opacity-100">Sign in</a>}
          <a href={cta.href} className="rounded-lg bg-violet-500 px-4 py-2 font-semibold hover:bg-violet-400">{loggedIn ? 'Dashboard' : 'Get started'}</a>
        </div>
      </nav>
      <header className="relative mx-auto max-w-3xl px-6 pb-24 pt-16 text-center">
        <motion.p {...fade} className="mb-4 inline-block rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-violet-200">Adaptive exam-prep tutor with a learner model</motion.p>
        <motion.h1 {...fade} className="text-4xl font-extrabold leading-tight sm:text-6xl">It remembers <span className="bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent">how you learn.</span></motion.h1>
        <motion.p {...fade} className="mx-auto mt-5 max-w-xl text-lg text-violet-100/80">PrepBrain AI tracks where you struggle, adapts every question to you, and decides what you should learn next.</motion.p>
        <motion.div {...fade} className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={cta.href} className="flex items-center gap-2 rounded-xl bg-violet-500 px-6 py-3 font-semibold hover:bg-violet-400">{cta.label} <ArrowRight size={18} /></a>
          {!loggedIn && <a href="/login" className="rounded-xl border border-white/15 bg-white/5 px-6 py-3 font-semibold hover:bg-white/10">Try the demo account</a>}
        </motion.div>
      </header>
      <section id="features" className="relative mx-auto max-w-5xl px-6 py-16">
        <motion.h2 {...fade} className="mb-8 text-center text-3xl font-bold">Built around a learner model</motion.h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{features.map(({ icon: I, t, d }, i) =>
          <motion.div key={t} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }} whileHover={{ y: -4 }}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur"><I className="mb-3 text-cyan-300" /><h3 className="font-semibold">{t}</h3><p className="mt-1 text-sm opacity-70">{d}</p></motion.div>)}</div>
      </section>
      <section id="how" className="relative mx-auto max-w-4xl px-6 py-16">
        <motion.h2 {...fade} className="mb-8 text-center text-3xl font-bold">How it works</motion.h2>
        <div className="grid gap-4 sm:grid-cols-4">{steps.map(([t, d], i) =>
          <motion.div key={t} {...fade} transition={{ delay: i * 0.1 }} className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="mb-2 text-sm text-violet-300">Step {i + 1}</div><h3 className="font-semibold">{t}</h3><p className="mt-1 text-sm opacity-70">{d}</p></motion.div>)}</div>
      </section>
      <section className="relative mx-auto max-w-2xl px-6 py-16">
        <motion.div {...fade} className="rounded-2xl border border-violet-400/30 bg-violet-500/10 p-6">
          <h2 className="text-xl font-bold">See a learner model</h2>
          <p className="mb-4 text-sm opacity-70">Sample illustration, the same demonstration data as the demo account. It spots Functions as the weakest topic and recommends targeted practice.</p>
          <div className="space-y-3">{sample.map(([n, v], i) => <div key={n}><div className="flex justify-between text-sm"><span>{n}</span><span>{v}%</span></div>
            <div className="h-2 rounded bg-white/10"><motion.div className="h-2 rounded bg-gradient-to-r from-violet-400 to-cyan-300" initial={{ width: 0 }} whileInView={{ width: `${v}%` }} viewport={{ once: true }} transition={{ duration: 1, delay: i * 0.15 }} /></div></div>)}</div>
          <p className="mt-4 text-sm">Next best action: <b>Practice Functions</b></p>
        </motion.div>
      </section>
      <section className="relative px-6 py-20 text-center">
        <motion.h2 {...fade} className="text-3xl font-bold">Learn smarter, not just longer.</motion.h2>
        <motion.a {...fade} href={cta.href} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-500 px-8 py-3 font-semibold hover:bg-violet-400">{cta.label} <ArrowRight size={18} /></motion.a>
      </section>
      <footer className="relative pb-8 text-center text-xs opacity-50">PrepBrain AI · Your Intelligence. Your Learning. Your Growth.</footer>
    </div>
  )
}
