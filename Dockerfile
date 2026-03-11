# ================================
# Stage 1: Install dependencies
# ================================
FROM node:20-alpine AS deps

# sharp (if you add it later) and other native modules need this
RUN apk add --no-cache libc6-compat

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

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
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules

# Copy source
COPY . .

RUN pnpm --filter @snowpro/web build

# ================================
# Stage 3: Production runner
# ================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]