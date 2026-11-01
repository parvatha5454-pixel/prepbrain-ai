import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'
const secret = () => {
  const s = process.env.AUTH_SECRET
  if (s) return s
  if (process.env.NODE_ENV === 'production') throw new Error('AUTH_SECRET must be set in production')
  return 'dev-secret'
}
const sig = (id: string) => createHmac('sha256', secret()).update(id).digest('hex')
export const makeToken = (id: string) => `${id}.${sig(id)}`
export async function getUserId(): Promise<string | null> {
  const t = (await cookies()).get('pb_session')?.value
  if (!t) return null
  const [id, s] = t.split('.')
  if (!id || !s) return null
  const a = Buffer.from(s), b = Buffer.from(sig(id))
  return a.length === b.length && timingSafeEqual(a, b) ? id : null
}
