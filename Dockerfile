# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
# libc6-compat: some native deps (bcrypt-style hashing used by better-auth, etc.)
# expect glibc-ish shims that alpine's musl libc doesn't ship by default.
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
WORKDIR /app

# ---------- deps: install node_modules, cached separately from source ----------
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ---------- builder: generate Prisma client + build Next.js standalone output ----------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# prisma.config.ts reads DATABASE_URL via env() at generate-time; `prisma generate`
# never connects to the database, but the variable must be present or it throws.
# Override with --build-arg DATABASE_URL=... if any page queries the DB during
# `next build` (static generation) instead of rendering dynamically.
ARG DATABASE_URL="postgresql://stockuser:stockpass@localhost:5432/stockdb?schema=public"
ENV DATABASE_URL=$DATABASE_URL

# `pnpm exec`/`pnpm run` fail here with "packages field missing or empty" because
# pnpm-workspace.yaml (used for allowBuilds) has no `packages:` list, which makes
# pnpm treat this as a broken workspace — call the binaries directly instead.
RUN ./node_modules/.bin/prisma generate
RUN ./node_modules/.bin/next build

# ---------- runner: minimal production image ----------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# `output: standalone` traces the runtime node_modules subset the server
# actually needs and copies it here together with server.js — .next/static
# and public/ are deliberately excluded from that trace and must be added by hand.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma's generated client lives at lib/generated/prisma (custom `output` in
# schema.prisma, per CLAUDE.md) instead of node_modules/.prisma/client, and its
# engine/wasm files are loaded dynamically, so output file tracing can miss
# them — copy the whole generated folder explicitly as a safety net.
COPY --from=builder --chown=nextjs:nodejs /app/lib/generated/prisma ./lib/generated/prisma

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
