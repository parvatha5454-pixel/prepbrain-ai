import { NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { makeToken } from '@/lib/auth'
const body = z.object({ email: z.string().email(), password: z.string().min(6).max(100) })
export async function POST(req: Request) {
  const p = body.safeParse(await req.json().catch(() => null))
  if (!p.success) return NextResponse.json({ error: 'Enter a valid email and password (min 6 chars).' }, { status: 400 })
  const u = await db.user.findUnique({ where: { email: p.data.email.toLowerCase() } })
  if (!u || !(await bcrypt.compare(p.data.password, u.passwordHash))) return NextResponse.json({ error: 'Wrong email or password.' }, { status: 401 })
  const res = NextResponse.json({ ok: true })
  res.cookies.set('pb_session', makeToken(u.id), { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 7 })
  return res
}
