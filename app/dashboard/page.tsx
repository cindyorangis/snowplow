import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await auth()

  if (!session) redirect('/login')
  if (session.user.role !== 'admin') redirect('/unauthorized')

  return <div>Welcome {session.user.name}</div>
}
