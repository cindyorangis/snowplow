# Snow Plow Services

A full-stack monorepo for a snow removal service business — built as a portfolio project demonstrating cloud infrastructure, DevOps practices, and modern full-stack development.

**Live site:** [snowplow-one.vercel.app](https://snowplow-one.vercel.app)

---

## Project Structure

```
snowpro/
├── apps/
│   ├── web/          # Marketing site + shared login (Next.js)
│   ├── admin/        # Internal admin dashboard (Nuxt/Vue)
│   ├── client/       # Customer-facing app (Nuxt/Vue) — in progress
│   └── crew/         # Crew job management app (Nuxt/Vue) — in progress
├── packages/
│   └── lib/          # Shared Supabase client, types, and utilities
├── .github/
│   └── workflows/    # CI/CD pipelines
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

This is a **pnpm monorepo** managed with [Turborepo](https://turbo.build/). Apps are deployed independently to Vercel. Shared code lives in `packages/lib` and is consumed by all apps via workspace linking.

---

## Tech Stack

| Layer                      | Technology                                     |
| -------------------------- | ---------------------------------------------- |
| Marketing site             | Next.js, TypeScript                            |
| Admin / Client / Crew apps | Nuxt 3, Vue, TypeScript                        |
| Shared package             | `@snowpro/lib` — Supabase client, shared types |
| Auth & Database            | Supabase (PostgreSQL + Auth)                   |
| Payments                   | Stripe (planned)                               |
| Monorepo                   | pnpm workspaces, Turborepo                     |
| CI/CD                      | GitHub Actions                                 |
| Hosting                    | Vercel (per-app deployments)                   |
| Code Quality               | Prettier, Husky                                |

---

## How Auth Works

Authentication is handled by Supabase. All users log in through a single login page on the marketing site (`apps/web`). After login, the app reads the user's role from the `profiles` table and redirects them to the correct app:

| Role     | Redirects to            |
| -------- | ----------------------- |
| `admin`  | admin.snowplow.services |
| `client` | app.snowplow.services   |
| `crew`   | crew.snowplow.services  |

Each app (admin, client, crew) protects its routes with Nuxt middleware that validates the session and role on every page load. Unauthenticated or unauthorized users are bounced back to the marketing site login.

---

## Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v18+
- [pnpm](https://pnpm.io/installation) v8+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for Docker workflow)

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/cindyorangis/snowplow.git
cd snowplow
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Each app has its own `.env` file. Copy the example files and fill in your values:

```bash
cp apps/admin/.env.example apps/admin/.env.local
cp apps/client/.env.example apps/client/.env.local
cp apps/crew/.env.example apps/crew/.env.local
```

---

## Running Locally

### Option A — npm dev (all apps via Turborepo)

Run all apps in parallel with hot reload:

```bash
pnpm dev
```

Or run a single app:

```bash
pnpm --filter @snowplow/web dev
pnpm --filter @snowplow/admin dev
pnpm --filter @snowplow/client dev
pnpm --filter @snowplow/crew dev
```

Default ports:

| App    | URL                   |
| ------ | --------------------- |
| web    | http://localhost:3000 |
| admin  | http://localhost:3001 |
| client | http://localhost:3002 |
| crew   | http://localhost:3003 |

---

## Other Commands

```bash
# Build all apps
pnpm build

# Lint all apps
pnpm lint

# Format with Prettier
pnpm format

# Type check
pnpm typecheck
```

---

### Option B — Docker

Build and run the web (client) app using Docker Compose:

```bash
docker compose up --build
```

The client app will be available at **http://localhost:3000**.

To run in detached mode (background):

```bash
docker compose up --build -d
```

To stop containers:

```bash
docker compose down
```

#### Build a specific app image manually

Each app has its own Dockerfile located at `apps/<app>/Dockerfile`. To build one directly:

```bash
# Build from monorepo root so workspace files are available
docker build -f apps/admin/Dockerfile -t snowplow-admin .
docker run -p 3001:3001 snowplow-admin
```

> **Note:** Always build from the monorepo root (`-f apps/<app>/Dockerfile .`), not from inside the app directory. The Dockerfiles are written to reference workspace-level files.

---

## Supabase Setup

The database schema lives in Supabase. On first setup, run the following in the Supabase SQL editor:

```sql
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  role text not null check (role in ('admin', 'client', 'crew')),
  full_name text,
  created_at timestamptz default now()
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'client');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;

create policy "users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);
```

New users default to the `client` role. To assign an admin:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'you@example.com');
```

---

## Roadmap

- [x] Monorepo setup (pnpm + Turborepo)
- [x] CI/CD via GitHub Actions
- [x] Supabase auth with role-based routing
- [x] Marketing site login page (Next.js)
- [x] Admin app with session-protected routes (Nuxt)
- [ ] Admin dashboard UI — job and user management
- [ ] Client app — service requests, job status
- [ ] Crew app — job assignments, schedule view
- [ ] Stripe — card-on-file at registration, billing
- [ ] Terraform — infrastructure as code for cloud resources

---

## CI/CD

GitHub Actions workflows live in `.github/workflows/`. On push to `main`, the pipeline runs lint, type checks, and deploys to the configured Azure or Vercel environment.

Refer to [CONTRIBUTING.md](./CONTRIBUTING.md) for branch naming, commit conventions, and PR guidelines.

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).
