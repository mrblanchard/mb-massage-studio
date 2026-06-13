# syntax=docker/dockerfile:1

FROM node:22-alpine AS base

# ---- Dependencies -----------------------------------------------------
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- Build --------------------------------------------------------------
# `next build` needs these at build time:
# - DATABASE_URL / R2_PUBLIC_URL: /sitemap.xml and /robots.txt are prerendered
#   (DB query), and `images.remotePatterns` (derived from R2_PUBLIC_URL) is
#   baked into the standalone server config.
# - AUTH_SECRET: read by the Auth.js config during the build's page-data pass.
# - NEXT_PUBLIC_*: inlined into the client bundle, can't be changed at runtime.
# In Coolify, mark these as "Build Variables" using the same values as the
# runtime environment variables. For a local build, pass them with
# `--build-arg` (see TEMPLATE-SETUP.md).
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG DATABASE_URL
ARG AUTH_SECRET
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_CF_ANALYTICS_TOKEN
ARG R2_PUBLIC_URL
ENV DATABASE_URL=${DATABASE_URL} \
  AUTH_SECRET=${AUTH_SECRET} \
  NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL} \
  NEXT_PUBLIC_CF_ANALYTICS_TOKEN=${NEXT_PUBLIC_CF_ANALYTICS_TOKEN} \
  R2_PUBLIC_URL=${R2_PUBLIC_URL}

RUN npm run build

# ---- Runtime --------------------------------------------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Standalone output - only the files needed to run `node server.js`.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
