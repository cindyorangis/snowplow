import { getSupabaseClient } from '@snowplow/lib/supabase'

export default defineNuxtPlugin(async () => {
  const supabase = getSupabaseClient(
    import.meta.env.NUXT_PUBLIC_SUPABASE_URL,
    import.meta.env.NUXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
  )

  const params = new URLSearchParams(window.location.search)
  const accessToken = params.get('access_token')
  const refreshToken = params.get('refresh_token')

  if (accessToken && refreshToken) {
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    // Clean tokens from the URL
    const url = new URL(window.location.href)
    url.searchParams.delete('access_token')
    url.searchParams.delete('refresh_token')
    window.history.replaceState({}, '', url.toString())
  }
})
