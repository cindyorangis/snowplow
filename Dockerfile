FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

# ================================
# Stage 1: Install dependencies
# ================================
FROM base AS deps

# sharp (if you add it later) and other native modules need this
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy workspace config files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy only the package.json files needed (not all source code)
COPY apps/web/package.json ./apps/web/
COPY packages/ ./packages/

RUN pnpm install --frozen-lockfile

# ================================
# Stage 2: Build
# ================================
FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules

# Copy source
COPY . .

RUN pnpm --filter @snowpro/web build

# ================================
# Stage 3: Production runner
# ================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# standalone output mirrors full monorepo structure
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]