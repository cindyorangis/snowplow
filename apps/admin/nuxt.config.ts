// https://nuxt.com/docs/api/configuration/nuxt-config

import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['./assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  routeRules: {
    '/**': { appMiddleware: ['auth'] },
  },

  runtimeConfig: {
    supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NUXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
  },

  app: {
    head: {
      meta: [
        {
          name: 'supabase-url',
          content: process.env.NUXT_PUBLIC_SUPABASE_URL,
        },
      ],
    },
  },
})
