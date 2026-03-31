<script setup lang="ts">
const router = useRouter()
</script>

<template>
  <div>
    <h1>Access Denied</h1>
    <p>You don't have permission to view this page.</p>
    <button @click="router.push('/login')">Back to login</button>
  </div>
</template>
