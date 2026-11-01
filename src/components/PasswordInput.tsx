'use client'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
export default function PasswordInput({ value, onChange, placeholder, minLength }: { value: string; onChange: (v: string) => void; placeholder: string; minLength?: number }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input className="w-full rounded-xl border border-white/10 bg-white/5 p-3 pr-11 outline-none focus:border-violet-400" type={show ? 'text' : 'password'} placeholder={placeholder}
        value={value} onChange={e => onChange(e.target.value)} required minLength={minLength} />
      <button type="button" onClick={() => setShow(s => !s)} aria-label={show ? 'Hide password' : 'Show password'}
        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100">
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )
}
