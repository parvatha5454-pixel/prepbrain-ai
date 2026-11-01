'use client'
import { motion } from 'framer-motion'
import { Brain, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react'
const pts = [[Brain, 'A learner model that remembers you'], [TrendingUp, 'Questions that adapt to your level'], [Sparkles, 'A tutor that knows your weak spots'], [ShieldCheck, 'Your data stays in your own account']] as const
export default function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-violet-700/40 via-[#0b1026] to-cyan-600/20 p-12 lg:flex">
        <motion.div className="absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-violet-500/30 blur-3xl" animate={{ y: [0, 30, 0] }} transition={{ duration: 8, repeat: Infinity }} />
        <motion.div className="absolute -right-10 bottom-10 h-60 w-60 rounded-full bg-cyan-400/20 blur-3xl" animate={{ y: [0, -30, 0] }} transition={{ duration: 9, repeat: Infinity }} />
        <a href="/" className="relative flex items-center gap-2 font-bold"><div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400"><Brain size={20} /></div>PrepBrain AI</a>
        <div className="relative space-y-6"><h2 className="text-4xl font-extrabold leading-tight">Your Intelligence.<br />Your Learning.<br /><span className="bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">Your Growth.</span></h2>
          <ul className="space-y-3">{pts.map(([I, t], i) => <motion.li key={t} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.12 }} className="flex items-center gap-3 text-sm text-violet-100/80"><I size={18} className="text-cyan-300" />{t}</motion.li>)}</ul></div>
        <p className="relative text-xs opacity-50">It remembers how you learn and decides what you should learn next.</p>
      </div>
      <div className="grid place-items-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm space-y-5">
          <a href="/" className="flex items-center gap-2 font-bold lg:hidden"><div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400"><Brain size={16} /></div>PrepBrain AI</a>
          <div><h1 className="text-3xl font-extrabold">{title}</h1><p className="mt-1 text-sm opacity-60">{subtitle}</p></div>
          {children}
        </motion.div>
      </div>
    </main>
  )
}
