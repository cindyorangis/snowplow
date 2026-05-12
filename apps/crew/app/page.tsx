'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

type AppState = 'loading' | 'ready' | 'unauthorized' | 'error'
type JobAction = 'started' | 'completed'
type FieldMode = 'compact' | 'full'

type Coordinate = {
  lat: number
  lng: number
}

type DispatchItem = {
  id: string
  created_at: string
  property_type: string | null
  address: string | null
  city: string | null
  province: string | null
}

type CrewJobAction = {
  id: string
  quote_request_id: string
  action: JobAction
  note: string | null
  created_at: string
  created_by: string | null
}

type DashboardData = {
  fullName: string | null
  queue: DispatchItem[]
  actions: CrewJobAction[]
}

const LOGIN_URL =
  process.env.NEXT_PUBLIC_MARKETING_LOGIN_URL ??
  'https://snowplow.services/login'
const DISPATCH_PHONE =
  process.env.NEXT_PUBLIC_DISPATCH_PHONE ?? '+1 (416) 555-0199'
const OPS_EMAIL =
  process.env.NEXT_PUBLIC_OPERATIONS_EMAIL ?? 'ops@snowplow.services'
const ACTIONS_TABLE = 'crew_job_actions'

const DEFAULT_DEPOT: Coordinate = {
  lat: Number(process.env.NEXT_PUBLIC_DEPOT_LAT ?? 43.6532),
  lng: Number(process.env.NEXT_PUBLIC_DEPOT_LNG ?? -79.3832),
}

const CITY_COORDS: Record<string, Coordinate> = {
  toronto: { lat: 43.6532, lng: -79.3832 },
  'north york': { lat: 43.7615, lng: -79.4111 },
  scarborough: { lat: 43.7731, lng: -79.2578 },
  etobicoke: { lat: 43.6205, lng: -79.5132 },
  'east york': { lat: 43.6896, lng: -79.3274 },
  york: { lat: 43.6899, lng: -79.4532 },
  mississauga: { lat: 43.589, lng: -79.6441 },
  brampton: { lat: 43.7315, lng: -79.7624 },
  vaughan: { lat: 43.8369, lng: -79.4983 },
  markham: { lat: 43.8561, lng: -79.337 },
}

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

function statusFromAction(
  action: JobAction | null
): 'Pending' | 'In progress' | 'Completed' {
  if (!action) return 'Pending'
  if (action === 'completed') return 'Completed'
  return 'In progress'
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180
}

function distanceKm(from: Coordinate, to: Coordinate): number {
  const earthRadius = 6371
  const dLat = toRadians(to.lat - from.lat)
  const dLng = toRadians(to.lng - from.lng)
  const lat1 = toRadians(from.lat)
  const lat2 = toRadians(to.lat)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return earthRadius * c
}

function cityCoordinate(city: string | null): Coordinate | null {
  if (!city) return null
  return CITY_COORDS[city.toLowerCase()] ?? null
}

export default function CrewDashboardPage() {
  const [appState, setAppState] = useState<AppState>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [warningMessage, setWarningMessage] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [isOnShift, setIsOnShift] = useState(true)
  const [sessionUserId, setSessionUserId] = useState<string | null>(null)
  const [savingActionKey, setSavingActionKey] = useState<string | null>(null)
  const [noteByJobId, setNoteByJobId] = useState<Record<string, string>>({})
  const [fieldMode, setFieldMode] = useState<FieldMode>(() =>
    typeof window !== 'undefined' && window.innerWidth < 768
      ? 'compact'
      : 'full'
  )
  const [crewLocation, setCrewLocation] = useState<Coordinate | null>(
    DEFAULT_DEPOT
  )
  const [locationSource, setLocationSource] = useState<'gps' | 'depot'>('depot')
  const [data, setData] = useState<DashboardData>({
    fullName: null,
    queue: [],
    actions: [],
  })

  useEffect(() => {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCrewLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setLocationSource('gps')
      },
      () => {
        setCrewLocation(DEFAULT_DEPOT)
        setLocationSource('depot')
      },
      { maximumAge: 300000, timeout: 6000, enableHighAccuracy: false }
    )
  }, [])

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
      setSessionUserId(session.user.id)

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
      let actions: CrewJobAction[] = []

      const queueResult = await supabase
        .from('quote_requests')
        .select('id, created_at, property_type, address, city, province')
        .order('created_at', { ascending: false })
        .limit(20)

      if (queueResult.error) {
        setWarningMessage(
          'Live dispatch data is unavailable, showing fallback queue.'
        )
        queue = fallbackQueue()
      } else {
        queue = (queueResult.data as DispatchItem[]) ?? []
      }

      if (queue.length > 0) {
        const queueIds = queue.map((job) => job.id)
        const actionsResult = await supabase
          .from(ACTIONS_TABLE)
          .select('id, quote_request_id, action, note, created_at, created_by')
          .in('quote_request_id', queueIds)
          .order('created_at', { ascending: false })
          .limit(200)

        if (actionsResult.error) {
          setWarningMessage(
            'Dispatch queue loaded, but action history is unavailable. Run apps/crew/CREW_JOB_ACTIONS_SETUP.sql in Supabase.'
          )
        } else {
          actions = (actionsResult.data as CrewJobAction[]) ?? []
        }
      }

      setData({
        fullName: profileResult.data.full_name,
        queue,
        actions,
      })
      setAppState('ready')
    }

    bootstrap()
  }, [])

  const firstName = useMemo(() => {
    if (!data.fullName) return 'Crew'
    return data.fullName.split(' ')[0] || 'Crew'
  }, [data.fullName])

  const actionsByJob = useMemo(() => {
    const map = new Map<string, CrewJobAction[]>()
    for (const action of data.actions) {
      const existing = map.get(action.quote_request_id) ?? []
      existing.push(action)
      map.set(action.quote_request_id, existing)
    }
    return map
  }, [data.actions])

  const routeAnchor = crewLocation ?? DEFAULT_DEPOT

  const routeOrderedQueue = useMemo(() => {
    const withMetadata = data.queue.map((item) => {
      const itemActions = actionsByJob.get(item.id) ?? []
      const latestAction = itemActions[0]?.action ?? null
      const status = statusFromAction(latestAction)
      const target = cityCoordinate(item.city)
      const distance = target ? distanceKm(routeAnchor, target) : 999
      const statusScore =
        status === 'In progress' ? 0 : status === 'Pending' ? 1 : 3
      const commercialBoost = item.property_type === 'commercial' ? -0.35 : 0
      const ageScore = new Date(item.created_at).getTime() / 10000000000000
      const score = statusScore + distance * 0.06 + commercialBoost + ageScore
      return {
        item,
        itemActions,
        status,
        distance,
        score,
      }
    })

    return withMetadata.sort((a, b) => a.score - b.score)
  }, [actionsByJob, data.queue, routeAnchor])

  const commercialCount = useMemo(
    () =>
      data.queue.filter((item) => item.property_type === 'commercial').length,
    [data.queue]
  )

  async function handleJobAction(quoteRequestId: string, action: JobAction) {
    setActionMessage(null)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
    if (!supabaseUrl || !supabaseKey || !sessionUserId) {
      setActionMessage(
        'Unable to save action right now. Please reload and try again.'
      )
      return
    }

    const note = noteByJobId[quoteRequestId]?.trim() ?? ''
    const supabase = getSupabaseClient(supabaseUrl, supabaseKey)
    const actionKey = `${quoteRequestId}:${action}`
    setSavingActionKey(actionKey)

    const { data: insertedAction, error } = await supabase
      .from(ACTIONS_TABLE)
      .insert({
        quote_request_id: quoteRequestId,
        action,
        note: note.length > 0 ? note : null,
        created_by: sessionUserId,
      })
      .select('id, quote_request_id, action, note, created_at, created_by')
      .single()

    setSavingActionKey(null)

    if (error) {
      setActionMessage(
        'Failed to save action. Make sure apps/crew/CREW_JOB_ACTIONS_SETUP.sql is applied in Supabase.'
      )
      return
    }

    setData((previous) => ({
      ...previous,
      actions: [insertedAction as CrewJobAction, ...previous.actions],
    }))
    setNoteByJobId((previous) => ({ ...previous, [quoteRequestId]: '' }))
    setActionMessage(
      action === 'started'
        ? `Job ${quoteRequestId.slice(0, 8)} started at ${formatDate(
            (insertedAction as CrewJobAction).created_at
          )}.`
        : `Job ${quoteRequestId.slice(0, 8)} completed at ${formatDate(
            (insertedAction as CrewJobAction).created_at
          )}.`
    )
  }

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
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
              Snow Plow Crew Console
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
              Good shift, {firstName}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Location-aware route ordering is active (
              {locationSource.toUpperCase()} anchor).
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                setFieldMode((mode) =>
                  mode === 'compact' ? 'full' : 'compact'
                )
              }
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {fieldMode === 'compact' ? 'Full mode' : 'Compact mode'}
            </button>
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
        </div>
      </header>

      {warningMessage && (
        <section className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {warningMessage}
        </section>
      )}

      {actionMessage && (
        <section className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          {actionMessage}
        </section>
      )}

      <section className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Queue
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {data.queue.length}
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Commercial
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {commercialCount}
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Dispatch
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {DISPATCH_PHONE}
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Shift
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {isOnShift ? 'Active' : 'Standby'}
          </p>
        </article>
      </section>

      <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-3 sm:p-5">
          <h2 className="text-base font-semibold text-slate-900">
            Route order
          </h2>

          {routeOrderedQueue.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">
              Queue is clear right now. Check back when a snowfall event starts.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {routeOrderedQueue.map(
                ({ item, itemActions, status, distance }) => {
                  const startActionKey = `${item.id}:started`
                  const completeActionKey = `${item.id}:completed`
                  const isSaving =
                    savingActionKey === startActionKey ||
                    savingActionKey === completeActionKey
                  const latest = itemActions[0]

                  return (
                    <li
                      key={item.id}
                      className={fieldMode === 'compact' ? 'py-3' : 'py-4'}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium text-slate-900">
                          {(item.property_type ?? 'property').toUpperCase()} -{' '}
                          {[item.address, item.city, item.province]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                            {distance >= 999
                              ? 'Unknown km'
                              : `${distance.toFixed(1)} km`}
                          </span>
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-700'
                                : status === 'In progress'
                                  ? 'bg-sky-100 text-sky-700'
                                  : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {status}
                          </span>
                        </div>
                      </div>

                      <p className="mt-1 text-xs text-slate-500">
                        Added {formatDate(item.created_at)} - Ref{' '}
                        {item.id.slice(0, 8)}
                      </p>

                      <div
                        className={fieldMode === 'compact' ? 'mt-2' : 'mt-3'}
                      >
                        <textarea
                          rows={fieldMode === 'compact' ? 1 : 2}
                          value={noteByJobId[item.id] ?? ''}
                          onChange={(event) =>
                            setNoteByJobId((previous) => ({
                              ...previous,
                              [item.id]: event.target.value,
                            }))
                          }
                          placeholder="Add field note..."
                          className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
                        />
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={
                            isSaving ||
                            status === 'In progress' ||
                            status === 'Completed'
                          }
                          onClick={() => handleJobAction(item.id, 'started')}
                          className="rounded-md bg-sky-700 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {savingActionKey === startActionKey
                            ? 'Starting...'
                            : 'Start'}
                        </button>
                        <button
                          type="button"
                          disabled={isSaving || status !== 'In progress'}
                          onClick={() => handleJobAction(item.id, 'completed')}
                          className="rounded-md bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {savingActionKey === completeActionKey
                            ? 'Completing...'
                            : 'Complete'}
                        </button>
                      </div>

                      {latest && fieldMode === 'full' && (
                        <div className="mt-2 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600">
                          <p className="font-semibold text-slate-700">
                            {latest.action === 'started'
                              ? 'Started'
                              : 'Completed'}{' '}
                            at {formatDate(latest.created_at)}
                          </p>
                          {latest.note && <p className="mt-1">{latest.note}</p>}
                        </div>
                      )}
                    </li>
                  )
                }
              )}
            </ul>
          )}
        </article>

        {fieldMode === 'full' && (
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <h2 className="text-base font-semibold text-slate-900">
              Action timeline
            </h2>
            {data.actions.length === 0 ? (
              <p className="mt-4 text-sm text-slate-600">
                No job actions logged yet. Start a job to begin tracking
                timestamps.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {data.actions.slice(0, 8).map((action) => (
                  <li
                    key={action.id}
                    className="rounded-md bg-slate-50 p-3 text-sm"
                  >
                    <p className="font-semibold text-slate-800">
                      {action.action === 'started' ? 'Started' : 'Completed'}{' '}
                      job {action.quote_request_id.slice(0, 8)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatDate(action.created_at)}
                    </p>
                    {action.note && (
                      <p className="mt-2 text-slate-600">{action.note}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </article>
        )}
      </section>
    </main>
  )
}
