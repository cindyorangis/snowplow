<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'
const { role, ready } = useAuth()
</script>

<template>
  <div v-if="!ready">Loading…</div>
  <div v-else-if="role === 'admin'">
    <h1>Admin Dashboard</h1>
    <!-- your admin UI here -->
  </div>
</template>
