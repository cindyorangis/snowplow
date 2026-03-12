# ================================
# Stage 1 — Base
# ================================
FROM node:22-alpine AS base

WORKDIR /app
RUN apk add --no-cache libc6-compat
RUN corepack enable

# ================================
# Stage 2: Install dependencies
# ================================
FROM base AS deps

# Copy root workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy workspace manifests
COPY apps/web/package.json apps/web/package.json
COPY packages/*/package.json packages/*/

# Install deps
RUN pnpm install --frozen-lockfile

# ================================
# Stage 3 — Build
# ================================
FROM deps AS builder

WORKDIR /app

# copy repo but keep installed deps
COPY . .

# restore deps layer explicitly
COPY --from=deps /app/node_modules ./node_modules

RUN pnpm turbo run build --filter=@snowpro/web

# ================================
# Stage 4 — Runtime
# ================================
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built Next.js standalone output
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./.next/static
COPY --from=builder /app/apps/web/public ./public

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]