'use client'
import { useState } from 'react'
import Link from 'next/link'
import AuthShell from '@/components/AuthShell'
import PasswordInput from '@/components/PasswordInput'
export default function Login() {
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [err, setErr] = useState(''), [busy, setBusy] = useState(false)
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(''); setBusy(true)
    const r = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
    if (r.ok) { window.location.href = '/dashboard'; return }
    setErr((await r.json()).error ?? 'Login failed'); setBusy(false)
  }
  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue your learning journey.">
      <form onSubmit={submit} className="space-y-4">
        <input className="w-full rounded-xl border border-white/10 bg-white/5 p-3 outline-none focus:border-violet-400" placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <PasswordInput value={password} onChange={setPassword} placeholder="Password" minLength={6} />
        {err && <p className="rounded-lg bg-red-500/10 p-2 text-sm text-red-300">{err}</p>}
        <button disabled={busy} className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 p-3 font-semibold disabled:opacity-50">{busy ? 'Signing in...' : 'Sign in'}</button>
        <button type="button" onClick={() => { setEmail('demo@prepbrain.ai'); setPassword('demo1234') }} className="w-full rounded-xl border border-white/15 p-3 text-sm hover:bg-white/5">Use demo account (demonstration data)</button>
      </form>
      <p className="text-center text-sm opacity-80">New here? <Link href="/register" className="text-cyan-300 underline">Create account</Link></p>
    </AuthShell>
  )
}
