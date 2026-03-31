# Snow Plow Services

A full-stack monorepo for a fictional snow plow business — built as a hands-on Azure cloud infrastructure portfolio project targeting the AZ-204 exam.

**Live site:** [snowplow-one.vercel.app](https://snowplow-one.vercel.app)

---

## Project Structure

```
snowplow/
├── apps/
│   ├── admin/        # Internal admin dashboard
│   ├── client/       # Customer-facing website (Next.js)
│   └── crew/         # Crew-facing job management app
├── .github/
│   └── workflows/    # CI/CD pipelines
├── docker-compose.yml
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

This is a **pnpm monorepo** managed with [Turborepo](https://turbo.build/). Each app under `apps/` is an independent Next.js application with its own Dockerfile.

---

## Tech Stack

| Layer            | Technology                     |
| ---------------- | ------------------------------ |
| Frontend         | Next.js, TypeScript            |
| Monorepo         | pnpm workspaces, Turborepo     |
| Containerization | Docker, Docker Compose         |
| CI/CD            | GitHub Actions                 |
| Hosting          | Azure Static Web Apps / Vercel |
| Cloud Platform   | Microsoft Azure                |
| Code Quality     | Prettier, Husky                |

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
pnpm --filter admin dev
pnpm --filter client dev
pnpm --filter crew dev
```

Default ports:

| App    | URL                   |
| ------ | --------------------- |
| client | http://localhost:3000 |
| admin  | http://localhost:3001 |
| crew   | http://localhost:3002 |

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

## CI/CD

GitHub Actions workflows live in `.github/workflows/`. On push to `main`, the pipeline runs lint, type checks, and deploys to the configured Azure or Vercel environment.

Refer to [CONTRIBUTING.md](./CONTRIBUTING.md) for branch naming, commit conventions, and PR guidelines.

---

## Azure Infrastructure

This project is built across 5 progressive phases, each mapping to AZ-204 exam domains:

| Phase | Focus                      | Azure Services                         |
| ----- | -------------------------- | -------------------------------------- |
| 1     | Frontend & Static Hosting  | Static Web Apps, Blob Storage          |
| 2     | Networking & Custom Domain | DNS, Front Door, CDN, SSL/TLS          |
| 3     | Serverless Backend         | Azure Functions, Cosmos DB, Key Vault  |
| 4     | Auth & API Management      | Entra ID (B2C), Managed Identity, APIM |
| 5     | Events & Observability     | Event Grid, Service Bus, App Insights  |

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).
