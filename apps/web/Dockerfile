# Production image for the public web app (Vite build -> nginx)
# Build from the repo root: docker build -f apps/web/Dockerfile .
FROM oven/bun:1 AS build
WORKDIR /app

COPY package.json bun.lock ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY apps/admin/package.json apps/admin/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN bun install --frozen-lockfile

COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

# Browser-facing API base URL baked into the bundle.
# Empty (default) = same origin: nginx below proxies /api to the api service.
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

RUN bun run --cwd apps/web build

FROM nginx:1.27-alpine
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
