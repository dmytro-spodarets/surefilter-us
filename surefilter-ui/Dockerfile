# syntax=docker/dockerfile:1.7

# Use Debian slim to ensure Prisma (OpenSSL) compatibility and small size
FROM node:20-bookworm-slim AS base
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
# System packages kept minimal; OpenSSL required by Prisma at runtime
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Install deps (cached separately) and generate Prisma Client
FROM base AS deps
ENV NODE_ENV=development

# Install JS dependencies using lockfile for reproducibility
COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm npm ci

# Generate Prisma Client early to leverage Docker layer cache
COPY prisma ./prisma
RUN npx prisma generate

# Build Next.js app
FROM deps AS build
# Copy app sources
COPY . .
# Build with Next.js
ENV NODE_ENV=production
RUN --mount=type=cache,target=/app/.next/cache npm run build

# Prune dev dependencies for production runtime
RUN npm prune --omit=dev

# Production image
FROM base AS runner
# Non-root user for better security
RUN groupadd -g 1001 nodejs && useradd -u 1001 -g nodejs -m nextjs
USER nextjs

# Copy standalone build and static assets
COPY --chown=nextjs:nodejs --from=build /app/public ./public
COPY --chown=nextjs:nodejs --from=build /app/.next/standalone ./
COPY --chown=nextjs:nodejs --from=build /app/.next/static ./.next/static
# Optional: Prisma schema (useful for external migrate jobs or tooling)
COPY --chown=nextjs:nodejs --from=build /app/prisma ./prisma
## Ensure generated Prisma client exists in runtime (since output is src/generated/prisma)
COPY --chown=nextjs:nodejs --from=build /app/src/generated/prisma ./src/generated/prisma

# Environment
ENV PORT=3000
EXPOSE 3000

# Optional basic healthcheck hitting the root path
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', r=>{process.exit(r.statusCode===200?0:1)}).on('error',()=>process.exit(1))"

# Start the Next.js server (standalone)
CMD ["node", "server.js"]
