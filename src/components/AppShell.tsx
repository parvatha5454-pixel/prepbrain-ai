'use client'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import FloatingTutor from './FloatingTutor'
import { BarChart3, Brain, CalendarCheck, ChevronsLeft, ChevronsRight, FileDown, FileText, LayoutDashboard, LogOut, Menu, MessageSquare, Target, X } from 'lucide-react'
const nav = [['/dashboard', 'Dashboard', LayoutDashboard], ['/syllabus', 'My Subjects', FileText], ['/quiz', 'Assessment', Target], ['/tutor', 'AI Tutor', MessageSquare], ['/analytics', 'Analytics', BarChart3], ['/planner', 'Planner', CalendarCheck], ['/report', 'Report', FileDown]] as const
export default function AppShell({ name, children }: { name: string; children: React.ReactNode }) {
  const path = usePathname(), [collapsed, setCollapsed] = useState(false), [open, setOpen] = useState(false)
  const links = (showLabels: boolean) => nav.map(([href, label, Icon]) => {
    const active = path === href
    return <a key={href} href={href} title={label} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${active ? 'bg-violet-500/20 text-white ring-1 ring-violet-400/40' : 'text-violet-100/70 hover:bg-white/10'}`}>
      <Icon size={18} className={active ? 'text-cyan-300' : ''} />{showLabels && <span>{label}</span>}</a>
  })
  const logout = (labels: boolean) => <form action="/api/auth/logout" method="post"><button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-violet-100/70 hover:bg-white/10"><LogOut size={18} />{labels && 'Logout'}</button></form>
  return (
    <div className="flex min-h-screen">
      <motion.aside animate={{ width: collapsed ? 76 : 232 }} className="glass sticky top-0 m-3 hidden h-[calc(100vh-1.5rem)] shrink-0 flex-col justify-between overflow-hidden p-3 md:flex">
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-1"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400"><Brain size={20} /></div>
            {!collapsed && <span className="font-bold">PrepBrain AI</span>}</div>
          <nav className="space-y-1">{links(!collapsed)}</nav>
        </div>
        <div className="space-y-1">
          {!collapsed && <div className="truncate px-3 pb-2 text-xs opacity-60">{name}</div>}
          {logout(!collapsed)}
          <button onClick={() => setCollapsed(c => !c)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-violet-100/70 hover:bg-white/10">{collapsed ? <ChevronsRight size={18} /> : <><ChevronsLeft size={18} />Collapse</>}</button>
        </div>
      </motion.aside>
      <div className="min-w-0 flex-1">
        <div className="glass m-3 flex items-center justify-between p-3 md:hidden">
          <div className="flex items-center gap-2"><div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400"><Brain size={16} /></div><b>PrepBrain AI</b></div>
          <button onClick={() => setOpen(o => !o)} aria-label="Menu">{open ? <X /> : <Menu />}</button>
        </div>
        {open && <div className="glass mx-3 space-y-1 p-3 md:hidden">{links(true)}{logout(true)}</div>}
        <motion.div key={path} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>{children}</motion.div>
      </div>
      <FloatingTutor />
    </div>
  )
}
