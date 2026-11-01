import { getUserId } from '@/lib/auth'
import Landing from '@/components/Landing'
export const dynamic = 'force-dynamic'
export default async function Home() {
  return <Landing loggedIn={!!(await getUserId())} />
}
