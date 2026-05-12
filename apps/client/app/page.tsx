'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

type AppState = 'loading' | 'ready' | 'unauthorized' | 'error'

type QuoteRequest = {
  id: string
  created_at: string
  property_type: string | null
  address: string | null
  city: string | null
  province: string | null
}

type DashboardData = {
  fullName: string | null
  email: string | null
  requests: QuoteRequest[]
}

const LOGIN_URL =
  process.env.NEXT_PUBLIC_MARKETING_LOGIN_URL ??
  'https://snowplow.services/login'
const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'support@snowplow.services'

let supabaseClient: SupabaseClient | null = null

function getSupabaseClient(url: string, key: string): SupabaseClient {
  if (supabaseClient) return supabaseClient
  supabaseClient = createClient(url, key)
  return supabaseClient
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return 'Recently'
  return new Intl.DateTimeFormat('en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function planFromRequestCount(requestCount: number): string {
  if (requestCount >= 3) return 'Seasonal plan candidate'
  if (requestCount >= 1) return 'Per-push service'
  return 'No active plan'
}

export default function ClientDashboardPage() {
  const [appState, setAppState] = useState<AppState>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [warningMessage, setWarningMessage] = useState<string | null>(null)
  const [data, setData] = useState<DashboardData>({
    fullName: null,
    email: null,
    requests: [],
  })

  useEffect(() => {
    async function bootstrap() {
      setErrorMessage(null)
      setWarningMessage(null)

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey =
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

      if (!supabaseUrl || !supabaseKey) {
        setErrorMessage(
          'Client app configuration is missing. Please contact support.'
        )
        setAppState('error')
        return
      }

      const supabase = getSupabaseClient(supabaseUrl, supabaseKey)
      const params = new URLSearchParams(window.location.search)
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')

      if (accessToken && refreshToken) {
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        const cleanUrl = new URL(window.location.href)
        cleanUrl.searchParams.delete('access_token')
        cleanUrl.searchParams.delete('refresh_token')
        window.history.replaceState({}, '', cleanUrl.toString())
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        window.location.href = LOGIN_URL
        return
      }

      const profileResult = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', session.user.id)
        .single()

      if (profileResult.error) {
        setErrorMessage(
          'We could not load your profile right now. Please try again.'
        )
        setAppState('error')
        return
      }

      if (profileResult.data.role !== 'client') {
        setAppState('unauthorized')
        return
      }

      let requests: QuoteRequest[] = []
      const requestResult = await supabase
        .from('quote_requests')
        .select('id, created_at, property_type, address, city, province')
        .eq('email', session.user.email)
        .order('created_at', { ascending: false })
        .limit(5)

      if (requestResult.error) {
        setWarningMessage(
          'Your account is ready, but we could not load service requests yet.'
        )
      } else {
        requests = (requestResult.data as QuoteRequest[]) ?? []
      }

      setData({
        fullName: profileResult.data.full_name,
        email: session.user.email ?? null,
        requests,
      })
      setAppState('ready')
    }

    bootstrap()
  }, [])

  const firstName = useMemo(() => {
    if (!data.fullName) return 'there'
    return data.fullName.split(' ')[0] || 'there'
  }, [data.fullName])

  const nextVisitWindow = useMemo(() => {
    if (data.requests.length === 0) return 'No visit scheduled yet'
    return 'Next snowfall event (overnight to early morning)'
  }, [data.requests.length])

  if (appState === 'loading') {
    return (
      <main className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-12">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm text-slate-500">
            Loading your client dashboard...
          </p>
        </div>
      </main>
    )
  }

  if (appState === 'unauthorized') {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-12">
        <div className="w-full rounded-2xl border border-amber-200 bg-amber-50 p-8">
          <h1 className="text-xl font-semibold text-amber-900">
            Access limited
          </h1>
          <p className="mt-2 text-sm text-amber-800">
            This account is not assigned to the client portal.
          </p>
          <a
            href={LOGIN_URL}
            className="mt-6 inline-flex rounded-md bg-amber-700 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
          >
            Back to login
          </a>
        </div>
      </main>
    )
  }

  if (appState === 'error') {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-12">
        <div className="w-full rounded-2xl border border-red-200 bg-red-50 p-8">
          <h1 className="text-xl font-semibold text-red-900">
            Something went wrong
          </h1>
          <p className="mt-2 text-sm text-red-800">
            {errorMessage ?? 'Please try again in a moment.'}
          </p>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="mt-6 inline-flex rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
          >
            Contact support
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-8 sm:py-10">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
          Snow Plow Client Portal
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          Welcome back, {firstName}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Use this dashboard to track service activity, quote requests, and
          billing.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="https://snowplow.services/quote"
            className="rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600"
          >
            Request service
          </a>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Contact support
          </a>
        </div>
      </header>

      {warningMessage && (
        <section className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {warningMessage}
        </section>
      )}

      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Service plan
          </p>
          <p className="mt-2 text-xl font-semibold text-slate-900">
            {planFromRequestCount(data.requests.length)}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Based on your current service request activity.
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Next visit window
          </p>
          <p className="mt-2 text-xl font-semibold text-slate-900">
            {nextVisitWindow}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            We automatically dispatch when snowfall reaches service threshold.
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Account email
          </p>
          <p className="mt-2 text-xl font-semibold text-slate-900">
            {data.email ?? 'Not available'}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Need to update it? Contact support.
          </p>
        </article>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">
              Recent requests
            </h2>
            <a
              href="https://snowplow.services/quote"
              className="text-sm font-medium text-sky-700"
            >
              New request
            </a>
          </div>

          {data.requests.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">
              No requests yet. Start by requesting your first quote.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100">
              {data.requests.map((request) => (
                <li key={request.id} className="py-3">
                  <p className="text-sm font-medium text-slate-900">
                    {(request.property_type ?? 'Property').toUpperCase()} -{' '}
                    {[request.address, request.city, request.province]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Submitted {formatDate(request.created_at)} - Ref{' '}
                    {request.id.slice(0, 8)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-base font-semibold text-slate-900">
            Billing snapshot
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-slate-600">Outstanding balance</dt>
              <dd className="font-semibold text-slate-900">$0.00</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-600">Last payment</dt>
              <dd className="font-semibold text-slate-900">
                Not available yet
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-600">Auto-pay</dt>
              <dd className="font-semibold text-slate-900">Coming soon</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-slate-500">
            Stripe integration is in progress. You can still request services
            now.
          </p>
        </article>
      </section>
    </main>
  )
}
