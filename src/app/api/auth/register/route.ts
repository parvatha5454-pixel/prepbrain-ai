import { NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { makeToken } from '@/lib/auth'
const body = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60),
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
})
export async function POST(req: Request) {
  const p = body.safeParse(await req.json().catch(() => null))
  if (!p.success) return NextResponse.json({ error: p.error.issues[0].message }, { status: 400 })
  const email = p.data.email.toLowerCase()
  if (await db.user.findUnique({ where: { email } })) return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 })
  const u = await db.user.create({ data: { email, name: p.data.name, passwordHash: await bcrypt.hash(p.data.password, 10), profile: { create: {} } } })
  const res = NextResponse.json({ ok: true })
  res.cookies.set('pb_session', makeToken(u.id), { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 7 })
  return res
}
