import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export type Role = 'admin' | 'client' | 'crew'

let _client: SupabaseClient | null = null

export function getSupabaseClient(url?: string, key?: string): SupabaseClient {
  if (_client) return _client
  if (!url || !key) throw new Error('Supabase url and key are required')
  _client = createClient(url, key)
  return _client
}

export async function getUserRole(
  url?: string,
  key?: string
): Promise<Role | null> {
  const supabase = getSupabaseClient(url, key)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return (data?.role as Role) ?? null
}
