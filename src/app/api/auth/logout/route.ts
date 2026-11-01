import { NextResponse } from 'next/server'
export async function POST(req: Request) {
  const res = NextResponse.redirect(new URL('/login', req.url), 303)
  res.cookies.delete('pb_session')
  return res
}
