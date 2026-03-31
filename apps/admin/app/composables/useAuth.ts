import { ref, onMounted } from 'vue'
import {
  getSupabaseClient,
  getUserRole,
  type Role,
} from '@snowpro/lib/supabase'

const supabase = getSupabaseClient(
  import.meta.env.NUXT_PUBLIC_SUPABASE_URL,
  import.meta.env.NUXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
)

export function useAuth() {
  const role = ref<Role | null>(null)
  const ready = ref(false)

  onMounted(async () => {
    role.value = await getUserRole()
    ready.value = true
  })

  return { role, ready }
}
