'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient, getUserRole } from '@snowpro/lib/supabase'

const ROLE_REDIRECTS = {
  admin: 'https://admin.snowpro.com',
  client: 'https://app.snowpro.com',
  crew: 'https://crew.snowpro.com',
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = getSupabaseClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    const role = await getUserRole()

    if (!role || !ROLE_REDIRECTS[role]) {
      setError('Account not configured. Contact support.')
      setLoading(false)
      return
    }

    window.location.href = ROLE_REDIRECTS[role]
  }

  return (
    <main>
      <form onSubmit={handleLogin}>
        <h1>Sign in to SnowPro</h1>
        {error && <p role="alert">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  )
}
