<script setup lang="ts">
const email = ref('')
const password = ref('')
const error = ref<string | null>(null)
const loading = ref(false)
const supabase = useSupabaseClient()
const router = useRouter()

async function handleLogin() {
  error.value = null
  loading.value = true

  const { error: authError } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })

  if (authError) {
    error.value = authError.message
    loading.value = false
    return
  }

  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single()

  loading.value = false

  if (data?.role === 'admin') {
    router.push('/')
  } else {
    await supabase.auth.signOut()
    error.value = 'Access denied. Admin accounts only.'
  }
}
</script>

<template>
  <div>
    <h1>SnowPro Admin</h1>
    <p v-if="error" role="alert">{{ error }}</p>
    <input v-model="email" type="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Password" />
    <button :disabled="loading" @click="handleLogin">
      {{ loading ? 'Signing in…' : 'Sign in' }}
    </button>
  </div>
</template>
