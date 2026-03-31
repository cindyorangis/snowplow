import { ref, onMounted } from 'vue'
import { supabase, getUserRole, type Role } from '@snowpro/lib/supabase'

export function useAuth() {
  const role = ref<Role | null>(null)
  const ready = ref(false)

  onMounted(async () => {
    role.value = await getUserRole()
    ready.value = true
  })

  return { role, ready }
}
