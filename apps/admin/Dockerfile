# Production image for the admin dashboard (Vite build -> nginx)
# Build from the repo root: docker build -f apps/admin/Dockerfile .
# bun must be >= 1.3 — 1.2.4 miscompiles Vue templates, breaking `vite build`.
FROM oven/bun:1.3.14 AS build
WORKDIR /app

COPY package.json bun.lock ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY apps/admin/package.json apps/admin/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN bun install --frozen-lockfile

COPY packages/shared ./packages/shared
COPY apps/admin ./apps/admin

# Browser-facing API base URL baked into the bundle.
# Empty (default) = same origin: nginx below proxies /api to the api service.
ARG VITE_API_URL=""
# Public web app URL so the admin can link to live invitations.
ARG VITE_WEB_URL=""
ENV VITE_API_URL=$VITE_API_URL VITE_WEB_URL=$VITE_WEB_URL

RUN bun run --cwd apps/admin build

FROM nginx:1.27-alpine
COPY apps/admin/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/admin/dist /usr/share/nginx/html
EXPOSE 80
