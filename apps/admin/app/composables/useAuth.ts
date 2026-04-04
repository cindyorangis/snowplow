import { ref, onMounted } from 'vue'
import { getUserRole, type Role } from '@snowplow/lib/supabase'

export function useAuth() {
  const role = ref<Role | null>(null)
  const ready = ref(false)

  onMounted(async () => {
    if (import.meta.env.DEV) {
      role.value = 'admin'
      ready.value = true
      return
    }

    const url = import.meta.env.NUXT_PUBLIC_SUPABASE_URL
    const key = import.meta.env.NUXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

    role.value = await getUserRole(url, key)
    ready.value = true
  })

  return { role, ready }
}
