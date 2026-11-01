'use client'
import { useState } from 'react'
import Link from 'next/link'
import AuthShell from '@/components/AuthShell'
import PasswordInput from '@/components/PasswordInput'
export default function Register() {
  const [name, setName] = useState(''), [email, setEmail] = useState(''), [password, setPassword] = useState(''), [confirm, setConfirm] = useState('')
  const [err, setErr] = useState(''), [busy, setBusy] = useState(false)
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr('')
    if (password !== confirm) { setErr('Passwords do not match.'); return }
    setBusy(true)
    const r = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) })
    if (r.ok) { window.location.href = '/dashboard'; return }
    setErr((await r.json()).error ?? 'Registration failed'); setBusy(false)
  }
  const mismatch = confirm.length > 0 && password !== confirm
  return (
    <AuthShell title="Create your account" subtitle="Start building your personal learner model.">
      <form onSubmit={submit} className="space-y-4">
        <input className="w-full rounded-xl border border-white/10 bg-white/5 p-3 outline-none focus:border-violet-400" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} required minLength={2} />
        <input className="w-full rounded-xl border border-white/10 bg-white/5 p-3 outline-none focus:border-violet-400" placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <PasswordInput value={password} onChange={setPassword} placeholder="Password (min 8 chars)" minLength={8} />
        <PasswordInput value={confirm} onChange={setConfirm} placeholder="Confirm password" minLength={8} />
        {mismatch && <p className="text-xs text-amber-300">Passwords do not match yet.</p>}
        {err && <p className="rounded-lg bg-red-500/10 p-2 text-sm text-red-300">{err}</p>}
        <button disabled={busy || mismatch} className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 p-3 font-semibold disabled:opacity-50">{busy ? 'Creating...' : 'Create account'}</button>
      </form>
      <p className="text-center text-sm opacity-80">Already have an account? <Link href="/login" className="text-cyan-300 underline">Sign in</Link></p>
    </AuthShell>
  )
}
