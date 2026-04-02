import { ref, onMounted } from 'vue'
import {
  getSupabaseClient,
  getUserRole,
  type Role,
} from '@snowplow/lib/supabase'

export function useAuth() {
  const role = ref<Role | null>(null)
  const ready = ref(false)

  onMounted(async () => {
    if (import.meta.env.DEV) {
      role.value = 'admin'
      ready.value = true
      return
    }

    const supabase = getSupabaseClient(
      import.meta.env.NUXT_PUBLIC_SUPABASE_URL,
      import.meta.env.NUXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
    )

    role.value = await getUserRole(
      import.meta.env.NUXT_PUBLIC_SUPABASE_URL,
      import.meta.env.NUXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
    )
    ready.value = true
  })

  return { role, ready }
}
