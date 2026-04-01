# Snow Plow Services

Supabase Auth — Implementation Reference (apps/web + apps/admin)

## Overview

Snow Plow Services uses Supabase for authentication and user role management across its monorepo. All users — admins, clients, and crew — log in through a single login page hosted on the marketing site (apps/web, built with Next.js). After a successful login, the app reads the user's role from the Supabase database and redirects them to the appropriate app.

This document covers the database schema, how auth is wired in code, what was built and debugged during the initial implementation session, and what remains to be done.

## How Authentication Works

### The Login Flow

The flow from the user's perspective:

1. User visits snowplow.services/login
2. User enters their email and password
3. The app calls supabase.auth.signInWithPassword() — Supabase validates credentials and returns a JWT session
4. The app queries the profiles table using the authenticated user's UUID to fetch their role
5. The user is redirected to the app that matches their role

| Role   | Redirects To            | Status      |
| ------ | ----------------------- | ----------- |
| admin  | admin.snowplow.services | ✓ Working   |
| client | app.snowplow.services   | In progress |
| crew   | crew.snowplow.services  | In progress |

### Session Protection in the Admin App

Every page in the admin app (apps/admin, built with Nuxt) is protected by a route middleware. On every navigation, the middleware:

- Calls supabase.auth.getSession() to check for a valid session
- If no session exists, redirects to snowplow.services/login
- If a session exists but the user's role is not admin, also redirects to login
- Only users with role = 'admin' are allowed through

This means even if someone navigates directly to admin.snowplow.services, they will be bounced unless they have an active admin session.

---

## Database Schema

### The `profiles` Table

Supabase provides a built-in auth.users table that stores email, password hashes, and session data. However, it cannot be extended directly. SnowPlow adds a public.profiles table that stores the application-level role for each user.

|            |                                                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------------------------------- |
| Table      | public.profiles                                                                                                           |
| id         | uuid — primary key, references auth.users(id). When an auth user is deleted, their profile row is also deleted (CASCADE). |
| role       | text — one of: admin, client, crew. Enforced by a CHECK constraint.                                                       |
| full_name  | text — optional display name.                                                                                             |
| created_at | timestamptz — defaults to the current timestamp.                                                                          |

### Auto-Profile Creation Trigger

When a new user signs up via Supabase Auth, a PostgreSQL trigger automatically inserts a row into public.profiles with a default role of 'client'. This ensures every auth user always has a corresponding profile row.

```
Function: public.handle_new_user()
Trigger:  on_auth_user_created — fires AFTER INSERT on auth.users
```

To promote a user to admin after account creation, run the following in the Supabase SQL editor:

```
UPDATE public.profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'user@example.com');
```

### Row Level Security (RLS)

RLS is enabled on the profiles table. The following policies are in place:

- Users can read their own profile row (auth.uid() = id)
- Only admins can update profile rows

This means the Supabase anon key cannot be used to read other users' roles — each user can only see their own profile.

---

## Code Structure

### Shared Package: packages/lib

The Supabase client and shared types live in a shared internal package (@snowplow/lib) so all apps in the monorepo can import them without duplicating setup code.

| File                         | Purpose                                                       |
| ---------------------------- | ------------------------------------------------------------- |
| packages/lib/src/supabase.ts | Exports getSupabaseClient(), getUserRole(), and the Role type |
| packages/lib/package.json    | name: @snowplow/lib, type: module, exports ./supabase         |

The Supabase client is lazily initialized — it is not created at import time. It is only created when getSupabaseClient() is first called with a URL and key. This prevents build errors during server-side rendering when environment variables are not yet available.

### App Files

| File                                  | Purpose                                                                                 |
| ------------------------------------- | --------------------------------------------------------------------------------------- |
| apps/web/app/(auth)/login/page.tsx    | Login form. Calls getSupabaseClient() inside the submit handler, reads role, redirects. |
| apps/admin/app/middleware/auth.ts     | Nuxt route middleware. Validates session and role on every page load.                   |
| apps/admin/app/composables/useAuth.ts | Vue composable that exposes role and ready state to components.                         |
| apps/admin/app/pages/index.vue        | Admin dashboard. Uses useAuth() to confirm role before rendering.                       |
| apps/admin/app/pages/no-access.vue    | Shown when a non-admin reaches the admin app.                                           |

### Environment Variables

Each app reads its own environment file. The variable names differ because Next.js and Nuxt use different prefixes to expose variables to the browser.

|                     |                                                                           |
| ------------------- | ------------------------------------------------------------------------- |
| apps/web/.env.local | NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY |
| apps/admin/.env     | NUXT_PUBLIC_SUPABASE_URL and NUXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY |

On Vercel, these are set per-project under Settings > Environment Variables. The packages/lib directory does not have its own .env file — it relies on the consuming app to pass values in at runtime.

---

### What Was Built

Session 1 — April 2026
The following was designed, debugged, and shipped in a single working session:

- Supabase project created
- profiles table dropped and recreated with correct uuid foreign key to auth.users
- Auto-profile trigger created via SQL editor
- RLS policies applied
- First admin user created and role manually set
- @snowplow/lib shared package initialized with pnpm workspace linking
- getSupabaseClient() implemented with lazy initialization to fix SSR build errors
- Login page (apps/web) wired to Supabase auth with role-based redirect
- Nuxt route middleware (apps/admin) implemented to protect all admin routes
- Login confirmed working end-to-end on snowplow.services
- Admin subdomain DNS configuration started (admin.snowplow.services)

---

## What Remains

### Immediate Next Steps

- Confirm admin.snowplow.services DNS propagates and admin app loads correctly
- Add NUXT*PUBLIC*\* env vars to admin Vercel project
- Add redirect URLs for admin subdomain in Supabase Auth settings
- Test full round-trip: login on web → redirect to admin → session persists

### Upcoming Work

- Build apps/client (Nuxt) — service requests, job status for customers
- Build apps/crew (Nuxt) — job assignments and schedule view for crew members
- Stripe integration — card-on-file at client registration using SetupIntent
- Admin dashboard UI — job management, user management tables
- React Native app (Expo) — mobile app for crew, connects to same Supabase backend
- AWS IaC with Terraform — S3 for file uploads, Lambda for background jobs, SNS for crew notifications, Route 53 for DNS management

## Notes

This project doubles as a portfolio piece demonstrating full-stack development, cloud infrastructure, DevOps practices, and monorepo architecture. The GitHub repository is public at github.com/cindyorangis/snowplow.

The Supabase free tier is sufficient for development and early production. Supabase handles auth token refresh automatically — the session persists across page loads without manual intervention.
