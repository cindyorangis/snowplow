<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import {
  Dialog,
  DialogPanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'
import {
  Bars3Icon,
  BellIcon,
  Cog6ToothIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import {
  TruckIcon,
  UsersIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/vue/24/outline'
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/vue/20/solid'

const { role, ready } = useAuth()
const sidebarOpen = ref(false)

const navigation = [
  {
    name: 'Dashboard',
    href: '#',
    icon: ClipboardDocumentListIcon,
    current: true,
  },
  { name: 'Jobs', href: '#', icon: TruckIcon, current: false },
  { name: 'Crew', href: '#', icon: WrenchScrewdriverIcon, current: false },
  { name: 'Clients', href: '#', icon: UsersIcon, current: false },
  { name: 'Schedule', href: '#', icon: CalendarDaysIcon, current: false },
  { name: 'Billing', href: '#', icon: CurrencyDollarIcon, current: false },
]

const userNavigation = [
  { name: 'Your profile', href: '#' },
  { name: 'Sign out', href: '#' },
]

const stats = [
  {
    name: 'Active jobs today',
    value: '8',
    change: '+2 since yesterday',
    positive: true,
  },
  { name: 'Crew on shift', value: '5', change: '2 available', positive: true },
  { name: 'Clients this month', value: '24', change: '+4 new', positive: true },
  {
    name: 'Revenue (MTD)',
    value: '$4,200',
    change: 'Stripe pending',
    positive: false,
  },
]

const recentJobs = [
  {
    id: 'JOB-001',
    client: 'Sarah Mitchell',
    address: '142 Elm St, Toronto',
    status: 'In progress',
    crew: 'Marco R.',
  },
  {
    id: 'JOB-002',
    client: 'David Park',
    address: '89 Maple Ave, Mississauga',
    status: 'Completed',
    crew: 'Lena K.',
  },
  {
    id: 'JOB-003',
    client: 'Priya Sharma',
    address: '310 Oak Blvd, Brampton',
    status: 'Pending',
    crew: 'Unassigned',
  },
  {
    id: 'JOB-004',
    client: 'James Nguyen',
    address: '55 Cedar Rd, Etobicoke',
    status: 'In progress',
    crew: 'Marco R.',
  },
  {
    id: 'JOB-005',
    client: 'Anna Kowalski',
    address: '78 Pine Cres, Vaughan',
    status: 'Pending',
    crew: 'Unassigned',
  },
]

const crewStatus = [
  { name: 'Marco R.', status: 'On job', job: 'JOB-001' },
  { name: 'Lena K.', status: 'Available', job: null },
  { name: 'Tyler M.', status: 'On job', job: 'JOB-004' },
  { name: 'Aisha B.', status: 'Off shift', job: null },
  { name: 'Carlos V.', status: 'Available', job: null },
]

function statusColor(status: string) {
  if (status === 'In progress')
    return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
  if (status === 'Completed')
    return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
  if (status === 'Pending')
    return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
  return ''
}

function crewStatusColor(status: string) {
  if (status === 'On job')
    return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
  if (status === 'Available')
    return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
  if (status === 'Off shift')
    return 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
  return ''
}
</script>

<template>
  <div
    v-if="!ready"
    class="flex min-h-screen items-center justify-center text-gray-500 dark:text-gray-400"
  >
    Loading…
  </div>

  <div v-else-if="role === 'admin'">
    <!-- Mobile sidebar -->
    <TransitionRoot as="template" :show="sidebarOpen">
      <Dialog class="relative z-50 lg:hidden" @close="sidebarOpen = false">
        <TransitionChild
          as="template"
          enter="transition-opacity ease-linear duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-gray-900/80" />
        </TransitionChild>
        <div class="fixed inset-0 flex">
          <TransitionChild
            as="template"
            enter="transition ease-in-out duration-300 transform"
            enter-from="-translate-x-full"
            enter-to="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leave-from="translate-x-0"
            leave-to="-translate-x-full"
          >
            <DialogPanel class="relative mr-16 flex w-full max-w-xs flex-1">
              <div
                class="absolute top-0 left-full flex w-16 justify-center pt-5"
              >
                <button
                  type="button"
                  class="-m-2.5 p-2.5"
                  @click="sidebarOpen = false"
                >
                  <span class="sr-only">Close sidebar</span>
                  <XMarkIcon class="size-6 text-white" aria-hidden="true" />
                </button>
              </div>
              <div
                class="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4"
              >
                <div class="flex h-16 shrink-0 items-center gap-x-2">
                  <TruckIcon class="size-7 text-indigo-400" />
                  <span class="text-white font-semibold text-lg">SnowPro</span>
                </div>
                <nav class="flex flex-1 flex-col">
                  <ul role="list" class="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" class="-mx-2 space-y-1">
                        <li v-for="item in navigation" :key="item.name">
                          <a
                            :href="item.href"
                            :class="[
                              item.current
                                ? 'bg-gray-800 text-white'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                              'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
                            ]"
                          >
                            <component
                              :is="item.icon"
                              class="size-6 shrink-0"
                              aria-hidden="true"
                            />
                            {{ item.name }}
                          </a>
                        </li>
                      </ul>
                    </li>
                    <li class="mt-auto">
                      <a
                        href="#"
                        class="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-400 hover:bg-gray-800 hover:text-white"
                      >
                        <Cog6ToothIcon
                          class="size-6 shrink-0"
                          aria-hidden="true"
                        />
                        Settings
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Desktop sidebar -->
    <div
      class="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col"
    >
      <div
        class="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4"
      >
        <div class="flex h-16 shrink-0 items-center gap-x-2">
          <TruckIcon class="size-7 text-indigo-400" />
          <span class="text-white font-semibold text-lg">SnowPro</span>
          <span class="ml-1 text-xs text-gray-500 font-medium">Admin</span>
        </div>
        <nav class="flex flex-1 flex-col">
          <ul role="list" class="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" class="-mx-2 space-y-1">
                <li v-for="item in navigation" :key="item.name">
                  <a
                    :href="item.href"
                    :class="[
                      item.current
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                      'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
                    ]"
                  >
                    <component
                      :is="item.icon"
                      :class="[
                        item.current
                          ? 'text-white'
                          : 'text-gray-400 group-hover:text-white',
                        'size-6 shrink-0',
                      ]"
                      aria-hidden="true"
                    />
                    {{ item.name }}
                  </a>
                </li>
              </ul>
            </li>
            <li class="mt-auto">
              <a
                href="#"
                class="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-400 hover:bg-gray-800 hover:text-white"
              >
                <Cog6ToothIcon class="size-6 shrink-0" aria-hidden="true" />
                Settings
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- Main content -->
    <div class="lg:pl-72">
      <!-- Top bar -->
      <div
        class="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-xs sm:gap-x-6 sm:px-6 lg:px-8 dark:border-white/10 dark:bg-gray-900"
      >
        <button
          type="button"
          class="-m-2.5 p-2.5 text-gray-700 lg:hidden dark:text-gray-400"
          @click="sidebarOpen = true"
        >
          <span class="sr-only">Open sidebar</span>
          <Bars3Icon class="size-6" aria-hidden="true" />
        </button>
        <div
          class="h-6 w-px bg-gray-200 lg:hidden dark:bg-white/10"
          aria-hidden="true"
        />
        <div class="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          <form class="grid flex-1 grid-cols-1" action="#" method="GET">
            <input
              name="search"
              aria-label="Search"
              class="col-start-1 row-start-1 block size-full bg-white pl-8 text-base text-gray-900 outline-hidden placeholder:text-gray-400 sm:text-sm/6 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500"
              placeholder="Search jobs, clients, crew…"
            />
            <MagnifyingGlassIcon
              class="pointer-events-none col-start-1 row-start-1 size-5 self-center text-gray-400"
              aria-hidden="true"
            />
          </form>
          <div class="flex items-center gap-x-4 lg:gap-x-6">
            <button
              type="button"
              class="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 dark:hover:text-white"
            >
              <span class="sr-only">View notifications</span>
              <BellIcon class="size-6" aria-hidden="true" />
            </button>
            <div
              class="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200 dark:lg:bg-white/10"
              aria-hidden="true"
            />
            <Menu as="div" class="relative">
              <MenuButton class="relative flex items-center gap-x-3">
                <span class="sr-only">Open user menu</span>
                <span
                  class="inline-flex size-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white"
                  >A</span
                >
                <span class="hidden lg:flex lg:items-center">
                  <span
                    class="text-sm/6 font-semibold text-gray-900 dark:text-white"
                    >Admin</span
                  >
                  <ChevronDownIcon
                    class="ml-2 size-5 text-gray-400"
                    aria-hidden="true"
                  />
                </span>
              </MenuButton>
              <transition
                enter-active-class="transition ease-out duration-100"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform scale-100"
                leave-active-class="transition ease-in duration-75"
                leave-from-class="transform scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <MenuItems
                  class="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 dark:bg-gray-800 dark:ring-white/10"
                >
                  <MenuItem
                    v-for="item in userNavigation"
                    :key="item.name"
                    v-slot="{ active }"
                  >
                    <a
                      :href="item.href"
                      :class="[
                        active ? 'bg-gray-50 dark:bg-white/5' : '',
                        'block px-3 py-1 text-sm/6 text-gray-900 dark:text-white',
                      ]"
                      >{{ item.name }}</a
                    >
                  </MenuItem>
                </MenuItems>
              </transition>
            </Menu>
          </div>
        </div>
      </div>

      <!-- Page content -->
      <main class="py-8">
        <div class="px-4 sm:px-6 lg:px-8 space-y-8">
          <!-- Page heading -->
          <div>
            <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Overview of today's operations
            </p>
          </div>

          <!-- Stat cards -->
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div
              v-for="stat in stats"
              :key="stat.name"
              class="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-gray-900"
            >
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                {{ stat.name }}
              </p>
              <p
                class="mt-2 text-3xl font-semibold text-gray-900 dark:text-white"
              >
                {{ stat.value }}
              </p>
              <p
                :class="[
                  stat.positive
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-400',
                  'mt-1 text-xs',
                ]"
              >
                {{ stat.change }}
              </p>
            </div>
          </div>

          <!-- Jobs + Crew -->
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <!-- Recent jobs table -->
            <div
              class="lg:col-span-2 rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-gray-900"
            >
              <div
                class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10"
              >
                <h2 class="text-sm font-semibold text-gray-900 dark:text-white">
                  Recent jobs
                </h2>
                <a
                  href="#"
                  class="text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                  >View all</a
                >
              </div>
              <div class="overflow-x-auto">
                <table
                  class="min-w-full divide-y divide-gray-200 dark:divide-white/10"
                >
                  <thead>
                    <tr>
                      <th
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Job
                      </th>
                      <th
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Client
                      </th>
                      <th
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell"
                      >
                        Address
                      </th>
                      <th
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell"
                      >
                        Crew
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100 dark:divide-white/5">
                    <tr
                      v-for="job in recentJobs"
                      :key="job.id"
                      class="hover:bg-gray-50 dark:hover:bg-white/5"
                    >
                      <td class="px-6 py-4 text-xs font-mono text-gray-400">
                        {{ job.id }}
                      </td>
                      <td
                        class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap"
                      >
                        {{ job.client }}
                      </td>
                      <td
                        class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell"
                      >
                        {{ job.address }}
                      </td>
                      <td class="px-6 py-4">
                        <span
                          :class="[
                            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                            statusColor(job.status),
                          ]"
                          >{{ job.status }}</span
                        >
                      </td>
                      <td
                        class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell"
                      >
                        {{ job.crew }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Crew status -->
            <div
              class="rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-gray-900"
            >
              <div
                class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10"
              >
                <h2 class="text-sm font-semibold text-gray-900 dark:text-white">
                  Crew status
                </h2>
                <a
                  href="#"
                  class="text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                  >Manage</a
                >
              </div>
              <ul class="divide-y divide-gray-100 dark:divide-white/5">
                <li
                  v-for="member in crewStatus"
                  :key="member.name"
                  class="flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-white/5"
                >
                  <div class="flex items-center gap-x-3">
                    <span
                      class="inline-flex size-8 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                    >
                      {{ member.name.charAt(0) }}
                    </span>
                    <div>
                      <p
                        class="text-sm font-medium text-gray-900 dark:text-white"
                      >
                        {{ member.name }}
                      </p>
                      <p v-if="member.job" class="text-xs text-gray-400">
                        {{ member.job }}
                      </p>
                    </div>
                  </div>
                  <span
                    :class="[
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                      crewStatusColor(member.status),
                    ]"
                    >{{ member.status }}</span
                  >
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
