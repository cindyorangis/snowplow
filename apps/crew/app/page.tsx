'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

type AppState = 'loading' | 'ready' | 'unauthorized' | 'error'

type DispatchItem = {
  id: string
  created_at: string
  property_type: string | null
  address: string | null
  city: string | null
  province: string | null
}

type DashboardData = {
  fullName: string | null
  queue: DispatchItem[]
}

const LOGIN_URL =
  process.env.NEXT_PUBLIC_MARKETING_LOGIN_URL ??
  'https://snowplow.services/login'
const DISPATCH_PHONE =
  process.env.NEXT_PUBLIC_DISPATCH_PHONE ?? '+1 (416) 555-0199'
const OPS_EMAIL =
  process.env.NEXT_PUBLIC_OPERATIONS_EMAIL ?? 'ops@snowplow.services'

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
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function fallbackQueue(): DispatchItem[] {
  return [
    {
      id: 'DEMO-001',
      created_at: new Date().toISOString(),
      property_type: 'residential',
      address: '142 Elm St',
      city: 'Toronto',
      province: 'ON',
    },
    {
      id: 'DEMO-002',
      created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      property_type: 'commercial',
      address: '89 Maple Ave',
      city: 'Mississauga',
      province: 'ON',
    },
  ]
}

export default function CrewDashboardPage() {
  const [appState, setAppState] = useState<AppState>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [warningMessage, setWarningMessage] = useState<string | null>(null)
  const [isOnShift, setIsOnShift] = useState(true)
  const [data, setData] = useState<DashboardData>({
    fullName: null,
    queue: [],
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
          'Crew app configuration is missing. Please contact operations.'
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
        setErrorMessage('We could not load your crew profile right now.')
        setAppState('error')
        return
      }

      if (profileResult.data.role !== 'crew') {
        setAppState('unauthorized')
        return
      }

      let queue: DispatchItem[] = []
      const queueResult = await supabase
        .from('quote_requests')
        .select('id, created_at, property_type, address, city, province')
        .order('created_at', { ascending: false })
        .limit(8)

      if (queueResult.error) {
        setWarningMessage(
          'Live dispatch data is unavailable, showing fallback queue for now.'
        )
        queue = fallbackQueue()
      } else {
        queue = (queueResult.data as DispatchItem[]) ?? []
      }

      setData({
        fullName: profileResult.data.full_name,
        queue,
      })
      setAppState('ready')
    }

    bootstrap()
  }, [])

  const firstName = useMemo(() => {
    if (!data.fullName) return 'Crew'
    return data.fullName.split(' ')[0] || 'Crew'
  }, [data.fullName])

  const commercialCount = useMemo(
    () =>
      data.queue.filter((item) => item.property_type === 'commercial').length,
    [data.queue]
  )

  if (appState === 'loading') {
    return (
      <main className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-12">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm text-slate-500">Loading crew console...</p>
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
            This account is not assigned to the crew console.
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
            Unable to open console
          </h1>
          <p className="mt-2 text-sm text-red-800">
            {errorMessage ?? 'Please try again in a moment.'}
          </p>
          <a
            href={`mailto:${OPS_EMAIL}`}
            className="mt-6 inline-flex rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
          >
            Contact operations
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-8 sm:py-10">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
              Snow Plow Crew Console
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">
              Good shift, {firstName}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Dispatch view for route priorities, property queue, and crew
              readiness.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsOnShift((previous) => !previous)}
            className={`rounded-md px-4 py-2 text-sm font-semibold text-white ${
              isOnShift
                ? 'bg-emerald-600 hover:bg-emerald-500'
                : 'bg-slate-700 hover:bg-slate-600'
            }`}
          >
            {isOnShift ? 'On Shift' : 'Off Shift'}
          </button>
        </div>
      </header>

      {warningMessage && (
        <section className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {warningMessage}
        </section>
      )}

      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Queue size
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {data.queue.length}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Total pending dispatch items.
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Commercial stops
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {commercialCount}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            High-priority lot and dock clearings.
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Dispatch line
          </p>
          <p className="mt-2 text-xl font-semibold text-slate-900">
            {DISPATCH_PHONE}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Use for gate codes and route escalations.
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Shift status
          </p>
          <p className="mt-2 text-xl font-semibold text-slate-900">
            {isOnShift ? 'Active' : 'Standby'}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Toggle status before and after dispatch runs.
          </p>
        </article>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">
              Dispatch queue
            </h2>
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              newest first
            </span>
          </div>

          {data.queue.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">
              Queue is clear right now. Check back when a snowfall event starts.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100">
              {data.queue.map((item) => (
                <li key={item.id} className="py-3">
                  <p className="text-sm font-medium text-slate-900">
                    {(item.property_type ?? 'property').toUpperCase()} -{' '}
                    {[item.address, item.city, item.province]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Added {formatDate(item.created_at)} - Ref{' '}
                    {item.id.slice(0, 8)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-base font-semibold text-slate-900">
            Field checklist
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            <li className="rounded-md bg-slate-50 px-3 py-2">
              Confirm fuel level and plow hydraulics before route start.
            </li>
            <li className="rounded-md bg-slate-50 px-3 py-2">
              Review gate/access notes for commercial stops.
            </li>
            <li className="rounded-md bg-slate-50 px-3 py-2">
              Capture after-service photo for disputed or blocked driveways.
            </li>
            <li className="rounded-md bg-slate-50 px-3 py-2">
              Report route blockers to dispatch immediately.
            </li>
          </ul>
          <a
            href={`mailto:${OPS_EMAIL}`}
            className="mt-5 inline-flex rounded-md border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Email operations
          </a>
        </article>
      </section>
    </main>
  )
}
