FROM node:24-alpine AS base

RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable pnpm && pnpm run build

FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 3003

COPY --from=builder /app/.next/ ./

EXPOSE 3003

CMD ["node", "server/index.js"]