# Build from monorepo root:
# docker build -f apps/web/Dockerfile -t snowplow-web .

FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# ================================
# Stage 1: Install + Build
# ================================
FROM base AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/ ./packages/

# Copy source first
COPY apps/web/ ./apps/web/

# Install (node_modules won't be overwritten since .dockerignore excludes them)
RUN pnpm install --frozen-lockfile --filter @snowplow/web...

# Build
WORKDIR /app/apps/web
RUN pnpm build

# ================================
# Stage 2: Production runner
# ================================
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]