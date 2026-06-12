# Production image for the Invitera API (Bun + Elysia)
# Build from the repo root: docker build -f apps/api/Dockerfile .
FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies from manifests only, for layer caching
COPY package.json bun.lock ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY apps/admin/package.json apps/admin/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN bun install --frozen-lockfile --production

# App source (API runs TypeScript directly under Bun)
COPY packages ./packages
COPY apps/api ./apps/api

ENV NODE_ENV=production
EXPOSE 3000

CMD ["bun", "run", "--cwd", "apps/api", "start"]
