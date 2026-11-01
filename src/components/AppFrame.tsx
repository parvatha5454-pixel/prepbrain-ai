import { getUserId } from '@/lib/auth'
import { db } from '@/lib/db'
import AppShell from './AppShell'
export default async function AppFrame({ children }: { children: React.ReactNode }) {
  const id = await getUserId()
  const u = id ? await db.user.findUnique({ where: { id }, select: { name: true } }) : null
  return <AppShell name={u?.name ?? 'Student'}>{children}</AppShell>
}
