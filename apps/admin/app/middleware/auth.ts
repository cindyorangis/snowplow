import { getSupabaseClient } from '@snowplow/lib/supabase'

export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return

  const supabase = getSupabaseClient(
    import.meta.env.NUXT_PUBLIC_SUPABASE_URL,
    import.meta.env.NUXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return navigateTo('https://snowplow.services/login', { external: true })
  }

  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (data?.role !== 'admin') {
    return navigateTo('https://snowplow.services/login', { external: true })
  }
})
