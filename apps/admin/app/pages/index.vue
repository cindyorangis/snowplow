<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { getSupabaseClient } from '@snowplow/lib/supabase'
import { useAuth } from '@/composables/useAuth'

type CrewMember = {
  id: string
  full_name: string | null
}

type JobRecord = {
  id: string
  status: 'assigned' | 'started' | 'completed' | 'cancelled'
  priority: number
  property_type: string | null
  address: string | null
  city: string | null
  province: string | null
  created_at: string
}

type AssignmentRecord = {
  id: string
  jobId: string
  crewUserId: string
  assignedAt: string
  routeOrder: number | null
}

type RouteLock = {
  shift_date: string
  locked: boolean
  locked_at: string
  locked_by: string | null
  note: string | null
}

const { role, ready } = useAuth()

const loading = ref(true)
const loadingError = ref<string | null>(null)
const actionMessage = ref<string | null>(null)
const actionError = ref<string | null>(null)

const savingPriorityJobId = ref<string | null>(null)
const savingAssignmentJobId = ref<string | null>(null)
const savingRouteOrderJobId = ref<string | null>(null)
const lockingShift = ref(false)

const selectedShiftDate = ref(new Date().toISOString().slice(0, 10))
const lockNote = ref('')

const jobs = ref<JobRecord[]>([])
const crewMembers = ref<CrewMember[]>([])
const activeAssignments = ref<AssignmentRecord[]>([])
const routeLock = ref<RouteLock | null>(null)

const priorityByJobId = ref<Record<string, string>>({})
const selectedCrewByJobId = ref<Record<string, string>>({})
const routeOrderByJobId = ref<Record<string, string>>({})

const adminUserId = ref<string | null>(null)
const supabase = ref<ReturnType<typeof getSupabaseClient> | null>(null)

const isShiftLocked = computed(() => routeLock.value?.locked === true)

const assignmentByJobId = computed(() => {
  const map = new Map<string, AssignmentRecord>()
  for (const assignment of activeAssignments.value) {
    map.set(assignment.jobId, assignment)
  }
  return map
})

const assignedCount = computed(() => activeAssignments.value.length)
const unassignedCount = computed(() => {
  const assignedJobIds = new Set(
    activeAssignments.value.map((assignment) => assignment.jobId)
  )
  return jobs.value.filter((job) => !assignedJobIds.has(job.id)).length
})

const startedCount = computed(
  () => jobs.value.filter((job) => job.status === 'started').length
)

const dispatchRows = computed(() => {
  return [...jobs.value]
    .map((job) => ({
      job,
      assignment: assignmentByJobId.value.get(job.id) ?? null,
    }))
    .sort((left, right) => {
      const leftAssigned = left.assignment ? 0 : 1
      const rightAssigned = right.assignment ? 0 : 1
      if (leftAssigned !== rightAssigned) return leftAssigned - rightAssigned

      const leftRoute = left.assignment?.routeOrder ?? 9999
      const rightRoute = right.assignment?.routeOrder ?? 9999
      if (leftRoute !== rightRoute) return leftRoute - rightRoute

      if (left.job.priority !== right.job.priority) {
        return left.job.priority - right.job.priority
      }

      return left.job.created_at.localeCompare(right.job.created_at)
    })
})

function statusLabel(status: JobRecord['status']) {
  if (status === 'assigned') return 'Pending'
  if (status === 'started') return 'In progress'
  if (status === 'completed') return 'Completed'
  return 'Cancelled'
}

function statusColor(status: JobRecord['status']) {
  if (status === 'started') return 'bg-sky-100 text-sky-700'
  if (status === 'completed') return 'bg-emerald-100 text-emerald-700'
  if (status === 'cancelled') return 'bg-rose-100 text-rose-700'
  return 'bg-slate-100 text-slate-600'
}

function jobLabel(job: JobRecord) {
  return [
    (job.property_type ?? 'property').toUpperCase(),
    [job.address, job.city, job.province].filter(Boolean).join(', '),
  ].join(' - ')
}

function crewName(crewUserId: string | null): string {
  if (!crewUserId) return 'Unassigned'
  const crew = crewMembers.value.find((member) => member.id === crewUserId)
  return crew?.full_name || crewUserId.slice(0, 8)
}

function hydrateFormState() {
  const nextPriority: Record<string, string> = {}
  const nextCrew: Record<string, string> = {}
  const nextRouteOrder: Record<string, string> = {}

  for (const job of jobs.value) {
    nextPriority[job.id] = String(job.priority)
    const assignment = assignmentByJobId.value.get(job.id)
    nextCrew[job.id] = assignment?.crewUserId ?? ''
    nextRouteOrder[job.id] =
      typeof assignment?.routeOrder === 'number'
        ? String(assignment.routeOrder)
        : ''
  }

  priorityByJobId.value = nextPriority
  selectedCrewByJobId.value = nextCrew
  routeOrderByJobId.value = nextRouteOrder
}

async function initializeSupabaseContext() {
  const url = import.meta.env.NUXT_PUBLIC_SUPABASE_URL
  const key = import.meta.env.NUXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables for admin app.')
  }

  const client = getSupabaseClient(url, key)
  supabase.value = client

  const {
    data: { session },
  } = await client.auth.getSession()
  adminUserId.value = session?.user?.id ?? null
}

async function loadCrewMembers() {
  if (!supabase.value) return

  const { data, error } = await supabase.value
    .from('profiles')
    .select('id, full_name')
    .eq('role', 'crew')
    .order('full_name', { ascending: true })

  if (error) throw error
  crewMembers.value = (data as CrewMember[]) ?? []
}

async function loadJobs() {
  if (!supabase.value) return

  const { data, error } = await supabase.value
    .from('jobs')
    .select(
      'id, status, priority, property_type, address, city, province, created_at'
    )
    .neq('status', 'cancelled')
    .order('priority', { ascending: true })
    .order('created_at', { ascending: true })
    .limit(300)

  if (error) throw error
  jobs.value = (data as JobRecord[]) ?? []
}

async function loadAssignmentsAndLocks() {
  if (!supabase.value) return

  const [assignmentsResult, lockResult] = await Promise.all([
    supabase.value
      .from('job_assignments')
      .select('id, job_id, crew_user_id, assigned_at, route_order')
      .eq('active', true)
      .eq('shift_date', selectedShiftDate.value)
      .order('route_order', { ascending: true, nullsFirst: false })
      .order('assigned_at', { ascending: true }),
    supabase.value
      .from('route_locks')
      .select('shift_date, locked, locked_at, locked_by, note')
      .eq('shift_date', selectedShiftDate.value)
      .maybeSingle(),
  ])

  if (assignmentsResult.error) throw assignmentsResult.error
  if (lockResult.error) throw lockResult.error

  activeAssignments.value = (
    (assignmentsResult.data ?? []) as Array<{
      id: string
      job_id: string
      crew_user_id: string
      assigned_at: string
      route_order: number | null
    }>
  ).map((item) => ({
    id: item.id,
    jobId: item.job_id,
    crewUserId: item.crew_user_id,
    assignedAt: item.assigned_at,
    routeOrder: item.route_order,
  }))

  routeLock.value = (lockResult.data as RouteLock | null) ?? null
  lockNote.value = routeLock.value?.note ?? ''
}

async function loadDispatcherData() {
  loading.value = true
  loadingError.value = null
  actionError.value = null

  try {
    await initializeSupabaseContext()
    await Promise.all([loadCrewMembers(), loadJobs()])
    await loadAssignmentsAndLocks()
    hydrateFormState()
  } catch (error) {
    loadingError.value = (error as Error).message
  } finally {
    loading.value = false
  }
}

async function savePriority(job: JobRecord) {
  if (!supabase.value) return
  if (isShiftLocked.value) {
    actionError.value = `Shift ${selectedShiftDate.value} is locked. Unlock to update priority.`
    return
  }

  const nextPriority = Number(priorityByJobId.value[job.id] ?? job.priority)
  if (!Number.isInteger(nextPriority) || nextPriority < 1 || nextPriority > 5) {
    actionError.value = 'Priority must be a whole number between 1 and 5.'
    return
  }

  actionError.value = null
  actionMessage.value = null
  savingPriorityJobId.value = job.id

  const { error } = await supabase.value
    .from('jobs')
    .update({ priority: nextPriority })
    .eq('id', job.id)

  savingPriorityJobId.value = null

  if (error) {
    actionError.value = error.message
    return
  }

  jobs.value = jobs.value.map((item) =>
    item.id === job.id ? { ...item, priority: nextPriority } : item
  )
  actionMessage.value = `Priority updated for job ${job.id.slice(0, 8)}.`
}

async function assignOrReassign(job: JobRecord) {
  if (!supabase.value) return
  if (isShiftLocked.value) {
    actionError.value = `Shift ${selectedShiftDate.value} is locked. Unlock to reassign jobs.`
    return
  }

  const nextCrewUserId = selectedCrewByJobId.value[job.id]
  if (!nextCrewUserId) {
    actionError.value = 'Select a crew member before assigning.'
    return
  }

  const routeOrderRaw = routeOrderByJobId.value[job.id]
  const nextRouteOrder =
    routeOrderRaw.trim().length > 0 ? Number(routeOrderRaw) : null

  if (
    nextRouteOrder !== null &&
    (!Number.isInteger(nextRouteOrder) || nextRouteOrder < 1)
  ) {
    actionError.value = 'Route order must be blank or a positive whole number.'
    return
  }

  const existing = assignmentByJobId.value.get(job.id) ?? null

  actionError.value = null
  actionMessage.value = null
  savingAssignmentJobId.value = job.id

  if (existing) {
    const { error: deactivateError } = await supabase.value
      .from('job_assignments')
      .update({ active: false })
      .eq('id', existing.id)

    if (deactivateError) {
      savingAssignmentJobId.value = null
      actionError.value = deactivateError.message
      return
    }
  }

  const { error: insertError } = await supabase.value
    .from('job_assignments')
    .insert({
      job_id: job.id,
      crew_user_id: nextCrewUserId,
      assigned_by: adminUserId.value,
      shift_date: selectedShiftDate.value,
      route_order: nextRouteOrder,
      active: true,
    })

  savingAssignmentJobId.value = null

  if (insertError) {
    actionError.value = insertError.message
    return
  }

  await loadAssignmentsAndLocks()
  hydrateFormState()
  actionMessage.value = existing
    ? `Reassigned job ${job.id.slice(0, 8)} to ${crewName(nextCrewUserId)}.`
    : `Assigned job ${job.id.slice(0, 8)} to ${crewName(nextCrewUserId)}.`
}

async function saveRouteOrder(job: JobRecord) {
  if (!supabase.value) return
  if (isShiftLocked.value) {
    actionError.value = `Shift ${selectedShiftDate.value} is locked. Unlock to edit route order.`
    return
  }

  const existing = assignmentByJobId.value.get(job.id)
  if (!existing) {
    actionError.value = 'Assign this job first before saving route order.'
    return
  }

  const routeOrderRaw = routeOrderByJobId.value[job.id]
  const nextRouteOrder =
    routeOrderRaw.trim().length > 0 ? Number(routeOrderRaw) : null

  if (
    nextRouteOrder !== null &&
    (!Number.isInteger(nextRouteOrder) || nextRouteOrder < 1)
  ) {
    actionError.value = 'Route order must be blank or a positive whole number.'
    return
  }

  actionError.value = null
  actionMessage.value = null
  savingRouteOrderJobId.value = job.id

  const { error } = await supabase.value
    .from('job_assignments')
    .update({ route_order: nextRouteOrder })
    .eq('id', existing.id)

  savingRouteOrderJobId.value = null

  if (error) {
    actionError.value = error.message
    return
  }

  await loadAssignmentsAndLocks()
  hydrateFormState()
  actionMessage.value = `Route order saved for job ${job.id.slice(0, 8)}.`
}

async function toggleRouteLock() {
  if (!supabase.value) return

  actionError.value = null
  actionMessage.value = null
  lockingShift.value = true

  const nextLocked = !isShiftLocked.value
  const payload = {
    shift_date: selectedShiftDate.value,
    locked: nextLocked,
    locked_at: new Date().toISOString(),
    locked_by: adminUserId.value,
    note: lockNote.value.trim().length > 0 ? lockNote.value.trim() : null,
  }

  const { error } = await supabase.value
    .from('route_locks')
    .upsert(payload, { onConflict: 'shift_date' })

  lockingShift.value = false

  if (error) {
    actionError.value = error.message
    return
  }

  await loadAssignmentsAndLocks()
  actionMessage.value = nextLocked
    ? `Shift ${selectedShiftDate.value} route locked.`
    : `Shift ${selectedShiftDate.value} route unlocked.`
}

watch(selectedShiftDate, async () => {
  if (!ready.value || role.value !== 'admin' || !supabase.value) return
  await loadAssignmentsAndLocks()
  hydrateFormState()
})

onMounted(async () => {
  await loadDispatcherData()
})
</script>

<template>
  <div
    v-if="!ready || loading"
    class="flex min-h-screen items-center justify-center text-gray-500 dark:text-gray-400"
  >
    Loading dispatch controls...
  </div>

  <div v-else-if="role !== 'admin'" class="mx-auto max-w-3xl px-6 py-16">
    <div class="rounded-xl border border-amber-200 bg-amber-50 p-6">
      <h1 class="text-xl font-semibold text-amber-900">
        Admin Access Required
      </h1>
      <p class="mt-2 text-sm text-amber-800">
        This page is only available to admin users.
      </p>
    </div>
  </div>

  <div v-else class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">
            Dispatch Controls
          </h1>
          <p class="mt-1 text-sm text-gray-600">
            Assign/reassign crew, update job priority, and lock route order for
            a shift.
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <label class="text-sm font-medium text-gray-700">
            Shift date
            <input
              v-model="selectedShiftDate"
              type="date"
              class="mt-1 block rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
            />
          </label>
          <button
            type="button"
            :disabled="lockingShift"
            @click="toggleRouteLock"
            :class="[
              'mt-6 rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-50',
              isShiftLocked
                ? 'bg-amber-700 hover:bg-amber-600'
                : 'bg-emerald-700 hover:bg-emerald-600',
            ]"
          >
            {{
              lockingShift
                ? 'Saving...'
                : isShiftLocked
                  ? 'Unlock Shift Route'
                  : 'Lock Shift Route'
            }}
          </button>
        </div>
      </div>

      <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p
            class="text-xs font-semibold uppercase tracking-wider text-gray-500"
          >
            Assigned
          </p>
          <p class="mt-1 text-2xl font-semibold text-gray-900">
            {{ assignedCount }}
          </p>
        </div>
        <div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p
            class="text-xs font-semibold uppercase tracking-wider text-gray-500"
          >
            Unassigned
          </p>
          <p class="mt-1 text-2xl font-semibold text-gray-900">
            {{ unassignedCount }}
          </p>
        </div>
        <div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p
            class="text-xs font-semibold uppercase tracking-wider text-gray-500"
          >
            In progress
          </p>
          <p class="mt-1 text-2xl font-semibold text-gray-900">
            {{ startedCount }}
          </p>
        </div>
        <div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p
            class="text-xs font-semibold uppercase tracking-wider text-gray-500"
          >
            Shift lock
          </p>
          <p
            :class="[
              'mt-1 text-sm font-semibold',
              isShiftLocked ? 'text-amber-700' : 'text-emerald-700',
            ]"
          >
            {{ isShiftLocked ? 'Locked' : 'Unlocked' }}
          </p>
        </div>
      </div>

      <div class="mt-4">
        <label class="block text-sm font-medium text-gray-700">
          Lock note (optional)
        </label>
        <input
          v-model="lockNote"
          type="text"
          placeholder="Reason for lock, weather note, or dispatch handoff..."
          class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
        />
      </div>

      <div
        v-if="loadingError"
        class="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
      >
        {{ loadingError }}
      </div>
      <div
        v-if="actionError"
        class="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
      >
        {{ actionError }}
      </div>
      <div
        v-if="actionMessage"
        class="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"
      >
        {{ actionMessage }}
      </div>
    </div>

    <div
      class="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-xs"
    >
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
            >
              Job
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
            >
              Status
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
            >
              Priority
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
            >
              Crew Assignment
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
            >
              Route Order
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="row in dispatchRows" :key="row.job.id" class="align-top">
            <td class="px-4 py-4">
              <p class="text-xs font-mono text-gray-500">
                {{ row.job.id.slice(0, 8) }}
              </p>
              <p class="mt-1 text-sm font-medium text-gray-900">
                {{ jobLabel(row.job) }}
              </p>
              <p v-if="row.assignment" class="mt-1 text-xs text-gray-500">
                Assigned to {{ crewName(row.assignment.crewUserId) }} on
                {{ new Date(row.assignment.assignedAt).toLocaleString() }}
              </p>
              <p v-else class="mt-1 text-xs text-amber-700">
                No active assignment
              </p>
            </td>
            <td class="px-4 py-4">
              <span
                :class="[
                  'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
                  statusColor(row.job.status),
                ]"
              >
                {{ statusLabel(row.job.status) }}
              </span>
            </td>
            <td class="px-4 py-4">
              <div class="flex items-center gap-2">
                <select
                  v-model="priorityByJobId[row.job.id]"
                  :disabled="isShiftLocked"
                  class="rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-900 disabled:bg-gray-100"
                >
                  <option value="1">1 (Highest)</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
                <button
                  type="button"
                  :disabled="
                    isShiftLocked || savingPriorityJobId === row.job.id
                  "
                  class="rounded-md bg-slate-700 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-600 disabled:opacity-50"
                  @click="savePriority(row.job)"
                >
                  {{
                    savingPriorityJobId === row.job.id ? 'Saving...' : 'Save'
                  }}
                </button>
              </div>
            </td>
            <td class="px-4 py-4">
              <div class="space-y-2">
                <select
                  v-model="selectedCrewByJobId[row.job.id]"
                  :disabled="isShiftLocked"
                  class="w-full rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-900 disabled:bg-gray-100"
                >
                  <option value="">Select crew member</option>
                  <option
                    v-for="crew in crewMembers"
                    :key="crew.id"
                    :value="crew.id"
                  >
                    {{ crew.full_name || crew.id.slice(0, 8) }}
                  </option>
                </select>
                <button
                  type="button"
                  :disabled="
                    isShiftLocked || savingAssignmentJobId === row.job.id
                  "
                  class="rounded-md bg-indigo-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-600 disabled:opacity-50"
                  @click="assignOrReassign(row.job)"
                >
                  {{
                    savingAssignmentJobId === row.job.id
                      ? 'Saving...'
                      : row.assignment
                        ? 'Reassign'
                        : 'Assign'
                  }}
                </button>
              </div>
            </td>
            <td class="px-4 py-4">
              <div class="space-y-2">
                <input
                  v-model="routeOrderByJobId[row.job.id]"
                  type="number"
                  min="1"
                  :disabled="isShiftLocked"
                  placeholder="e.g. 3"
                  class="w-24 rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-900 disabled:bg-gray-100"
                />
                <button
                  type="button"
                  :disabled="
                    isShiftLocked ||
                    !row.assignment ||
                    savingRouteOrderJobId === row.job.id
                  "
                  class="rounded-md bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-600 disabled:opacity-50"
                  @click="saveRouteOrder(row.job)"
                >
                  {{
                    savingRouteOrderJobId === row.job.id
                      ? 'Saving...'
                      : 'Save route'
                  }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
