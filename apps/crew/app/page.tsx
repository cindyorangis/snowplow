'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

type AppState = 'loading' | 'ready' | 'unauthorized' | 'error'
type JobAction = 'started' | 'completed'
type FieldMode = 'compact' | 'full'
type JobStatus = 'assigned' | 'started' | 'completed' | 'cancelled'

type Coordinate = {
  lat: number
  lng: number
}

type DispatchJob = {
  assignmentId: string
  jobId: string
  quoteRequestId: string | null
  createdAt: string
  propertyType: string | null
  address: string | null
  city: string | null
  province: string | null
  priority: number
  status: JobStatus
  routeOrder: number | null
  assignedAt: string
  shiftDate: string | null
}

type CrewJobAction = {
  id: string
  job_id: string | null
  quote_request_id: string | null
  action: JobAction
  note: string | null
  created_at: string
  created_by: string | null
}

type DashboardData = {
  fullName: string | null
  queue: DispatchJob[]
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
const ASSIGNMENTS_TABLE = 'job_assignments'
const JOBS_TABLE = 'jobs'
const DISPATCH_SETUP_PATH = 'apps/crew/CREW_DISPATCH_SETUP.sql'

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

function statusLabel(
  status: JobStatus
): 'Pending' | 'In progress' | 'Completed' | 'Cancelled' {
  if (status === 'started') return 'In progress'
  if (status === 'completed') return 'Completed'
  if (status === 'cancelled') return 'Cancelled'
  return 'Pending'
}

function fallbackQueue(): DispatchJob[] {
  return [
    {
      assignmentId: 'demo-assignment-1',
      jobId: 'demo-job-1',
      quoteRequestId: null,
      createdAt: new Date().toISOString(),
      propertyType: 'residential',
      address: '142 Elm St',
      city: 'Toronto',
      province: 'ON',
      priority: 2,
      status: 'assigned',
      routeOrder: 1,
      assignedAt: new Date().toISOString(),
      shiftDate: null,
    },
    {
      assignmentId: 'demo-assignment-2',
      jobId: 'demo-job-2',
      quoteRequestId: null,
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      propertyType: 'commercial',
      address: '89 Maple Ave',
      city: 'Mississauga',
      province: 'ON',
      priority: 1,
      status: 'assigned',
      routeOrder: 2,
      assignedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      shiftDate: null,
    },
  ]
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

      let queue: DispatchJob[] = []
      let actions: CrewJobAction[] = []

      const assignmentsResult = await supabase
        .from(ASSIGNMENTS_TABLE)
        .select(
          `
            id,
            job_id,
            route_order,
            shift_date,
            assigned_at,
            jobs (
              id,
              quote_request_id,
              created_at,
              property_type,
              address,
              city,
              province,
              status,
              priority
            )
          `
        )
        .eq('crew_user_id', session.user.id)
        .eq('active', true)
        .order('route_order', { ascending: true, nullsFirst: false })
        .order('assigned_at', { ascending: true })

      if (assignmentsResult.error) {
        setWarningMessage(
          `Assigned jobs are unavailable. Run ${DISPATCH_SETUP_PATH} in Supabase and assign jobs to this crew member.`
        )
        queue = fallbackQueue()
      } else {
        const normalized = (assignmentsResult.data ?? [])
          .map((row) => {
            const relatedJob = Array.isArray(row.jobs) ? row.jobs[0] : row.jobs
            if (!relatedJob) return null

            return {
              assignmentId: row.id,
              jobId: relatedJob.id,
              quoteRequestId: relatedJob.quote_request_id,
              createdAt: relatedJob.created_at,
              propertyType: relatedJob.property_type,
              address: relatedJob.address,
              city: relatedJob.city,
              province: relatedJob.province,
              priority: Number(relatedJob.priority ?? 2),
              status: (relatedJob.status ?? 'assigned') as JobStatus,
              routeOrder: row.route_order,
              assignedAt: row.assigned_at,
              shiftDate: row.shift_date,
            } satisfies DispatchJob
          })
          .filter((item): item is DispatchJob => item !== null)

        queue = normalized
      }

      if (queue.length > 0) {
        const jobIds = queue.map((job) => job.jobId)
        const actionsResult = await supabase
          .from(ACTIONS_TABLE)
          .select(
            'id, job_id, quote_request_id, action, note, created_at, created_by'
          )
          .in('job_id', jobIds)
          .order('created_at', { ascending: false })
          .limit(300)

        if (actionsResult.error) {
          setWarningMessage(
            `Assigned jobs loaded, but action history is unavailable. Run ${DISPATCH_SETUP_PATH} in Supabase.`
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
      if (!action.job_id) continue
      const existing = map.get(action.job_id) ?? []
      existing.push(action)
      map.set(action.job_id, existing)
    }
    return map
  }, [data.actions])

  const routeAnchor = crewLocation ?? DEFAULT_DEPOT

  const routeOrderedQueue = useMemo(() => {
    const withMetadata = data.queue.map((item) => {
      const itemActions = actionsByJob.get(item.jobId) ?? []
      const target = cityCoordinate(item.city)
      const distance = target ? distanceKm(routeAnchor, target) : 999
      const priorityScore = item.priority * 0.35
      const statusScore =
        item.status === 'started' ? 0 : item.status === 'assigned' ? 1 : 3
      const distanceScore = distance * 0.06
      const routeOrderScore =
        typeof item.routeOrder === 'number' ? item.routeOrder * 0.0001 : 0
      const score =
        routeOrderScore + statusScore + priorityScore + distanceScore

      return {
        item,
        itemActions,
        distance,
        score,
      }
    })

    return withMetadata.sort((a, b) => a.score - b.score)
  }, [actionsByJob, data.queue, routeAnchor])

  const commercialCount = useMemo(
    () =>
      data.queue.filter((item) => item.propertyType === 'commercial').length,
    [data.queue]
  )

  async function handleJobAction(job: DispatchJob, action: JobAction) {
    setActionMessage(null)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
    if (!supabaseUrl || !supabaseKey || !sessionUserId) {
      setActionMessage(
        'Unable to save action right now. Please reload and try again.'
      )
      return
    }

    const note = noteByJobId[job.jobId]?.trim() ?? ''
    const nextStatus: JobStatus = action === 'started' ? 'started' : 'completed'
    const supabase = getSupabaseClient(supabaseUrl, supabaseKey)
    const actionKey = `${job.jobId}:${action}`
    setSavingActionKey(actionKey)

    const { error: statusError } = await supabase
      .from(JOBS_TABLE)
      .update({ status: nextStatus, updated_at: new Date().toISOString() })
      .eq('id', job.jobId)

    if (statusError) {
      setSavingActionKey(null)
      setActionMessage(
        `Failed to update job status. Ensure ${DISPATCH_SETUP_PATH} is applied and this crew is assigned to the job.`
      )
      return
    }

    const { data: insertedAction, error: actionError } = await supabase
      .from(ACTIONS_TABLE)
      .insert({
        job_id: job.jobId,
        quote_request_id: job.quoteRequestId,
        action,
        note: note.length > 0 ? note : null,
        created_by: sessionUserId,
      })
      .select(
        'id, job_id, quote_request_id, action, note, created_at, created_by'
      )
      .single()

    setSavingActionKey(null)

    if (actionError) {
      setActionMessage(
        `Status updated, but action log failed to write. Ensure ${DISPATCH_SETUP_PATH} is applied.`
      )
      setData((previous) => ({
        ...previous,
        queue: previous.queue.map((item) =>
          item.jobId === job.jobId ? { ...item, status: nextStatus } : item
        ),
      }))
      return
    }

    setData((previous) => ({
      ...previous,
      queue: previous.queue.map((item) =>
        item.jobId === job.jobId ? { ...item, status: nextStatus } : item
      ),
      actions: [insertedAction as CrewJobAction, ...previous.actions],
    }))
    setNoteByJobId((previous) => ({ ...previous, [job.jobId]: '' }))
    setActionMessage(
      action === 'started'
        ? `Job ${job.jobId.slice(0, 8)} started at ${formatDate(
            (insertedAction as CrewJobAction).created_at
          )}.`
        : `Job ${job.jobId.slice(0, 8)} completed at ${formatDate(
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
            Assigned
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
            Assigned route
          </h2>

          {routeOrderedQueue.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">
              No active assignments yet. Ask dispatch to assign jobs in
              `job_assignments`.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {routeOrderedQueue.map(({ item, itemActions, distance }) => {
                const startActionKey = `${item.jobId}:started`
                const completeActionKey = `${item.jobId}:completed`
                const isSaving =
                  savingActionKey === startActionKey ||
                  savingActionKey === completeActionKey
                const latest = itemActions[0]
                const displayStatus = statusLabel(item.status)

                return (
                  <li
                    key={item.assignmentId}
                    className={fieldMode === 'compact' ? 'py-3' : 'py-4'}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-900">
                        {(item.propertyType ?? 'property').toUpperCase()} -{' '}
                        {[item.address, item.city, item.province]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                      <div className="flex items-center gap-2">
                        {typeof item.routeOrder === 'number' && (
                          <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700">
                            Stop {item.routeOrder}
                          </span>
                        )}
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                          {distance >= 999
                            ? 'Unknown km'
                            : `${distance.toFixed(1)} km`}
                        </span>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            displayStatus === 'Completed'
                              ? 'bg-emerald-100 text-emerald-700'
                              : displayStatus === 'In progress'
                                ? 'bg-sky-100 text-sky-700'
                                : displayStatus === 'Cancelled'
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {displayStatus}
                        </span>
                      </div>
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      Job {item.jobId.slice(0, 8)} - Assigned{' '}
                      {formatDate(item.assignedAt)}
                    </p>

                    <div className={fieldMode === 'compact' ? 'mt-2' : 'mt-3'}>
                      <textarea
                        rows={fieldMode === 'compact' ? 1 : 2}
                        value={noteByJobId[item.jobId] ?? ''}
                        onChange={(event) =>
                          setNoteByJobId((previous) => ({
                            ...previous,
                            [item.jobId]: event.target.value,
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
                          item.status === 'started' ||
                          item.status === 'completed'
                        }
                        onClick={() => handleJobAction(item, 'started')}
                        className="rounded-md bg-sky-700 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {savingActionKey === startActionKey
                          ? 'Starting...'
                          : 'Start'}
                      </button>
                      <button
                        type="button"
                        disabled={isSaving || item.status !== 'started'}
                        onClick={() => handleJobAction(item, 'completed')}
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
              })}
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
                {data.actions.slice(0, 10).map((action) => (
                  <li
                    key={action.id}
                    className="rounded-md bg-slate-50 p-3 text-sm"
                  >
                    <p className="font-semibold text-slate-800">
                      {action.action === 'started' ? 'Started' : 'Completed'}{' '}
                      job {(action.job_id ?? 'unknown').slice(0, 8)}
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
