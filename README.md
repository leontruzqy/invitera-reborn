# Invitera

A wedding invitation platform: customers order an invitation, you build and publish it, guests open a personal link, RSVP, and leave wishes.

Bun workspace monorepo:

| Package | Stack | Purpose |
| --- | --- | --- |
| `apps/web` | Vue 3 + Vite + Tailwind | Public invitation site — renders `/:slug` with a dynamic template |
| `apps/admin` | Vue 3 + Vite + Tailwind | Internal dashboard — customers, orders, invitations, RSVPs, wish moderation |
| `apps/api` | Bun + Elysia | REST API serving both apps |
| `packages/db` | Drizzle ORM + libsql | Schema, client, migrations, seed (SQLite in dev, Turso in prod) |
| `packages/shared` | TypeScript | Shared types, constants, validators |

## Prerequisites

- [Bun](https://bun.sh) ≥ 1.2 (repo developed against 1.3)
- Docker + Docker Compose (for the containerized workflows)
- A [Turso](https://turso.tech) database (production only)

## Quick start (host, no Docker)

```bash
bun install
bun db:migrate        # creates packages/db/dev.db (SQLite)
bun db:seed           # admin user + sample customer/order/invitation
bun dev               # api :3000, web :5173, admin :5174
```

- Web: http://localhost:5173 — sample invitation at [`/rani-raka`](http://localhost:5173/rani-raka)
- Admin: http://localhost:5174 — login `admin@invitera.local` / `admin12345`
- API: http://localhost:3000/health

Personalized guest link (pre-fills the RSVP form): `http://localhost:5173/rani-raka?guest=budi-santoso-x7f2`

## Quick start (Docker dev)

```bash
docker compose -f docker-compose.dev.yml up --build
```

Same URLs as above. The dev database is a local SQLite file inside the `sqlite_data` volume (`/data/dev.db`) — Turso is not used in dev. Migrations and the seed run automatically when the `api` service starts.

Source folders are bind-mounted, so the API hot-reloads and Vite HMR works. After changing any `package.json`, re-run with `--build`.

## Scripts (run from the repo root)

| Script | What it does |
| --- | --- |
| `bun dev` | Run api + web + admin concurrently |
| `bun dev:web` / `bun dev:admin` / `bun dev:api` | Run one app |
| `bun db:generate` | Generate SQL migrations from `packages/db/src/schema.ts` (drizzle-kit) |
| `bun db:migrate` | Apply migrations to `DATABASE_URL` |
| `bun db:seed` | Seed admin user + sample data (idempotent) |
| `bun run build` | Production build of web + admin |
| `bun start` | Run the API in production mode |

## Environment variables

Copy `.env.example` to `.env`. Compose reads it automatically; host scripts read it via your shell or Vite (`VITE_*`).

| Variable | Used by | Notes |
| --- | --- | --- |
| `DATABASE_URL` | api, db scripts | Empty → `packages/db/dev.db`. Docker dev → `file:/data/dev.db` (set by compose). Prod → `libsql://…` (Turso) |
| `TURSO_AUTH_TOKEN` | api, db scripts | Turso auth token (production) |
| `JWT_SECRET` | api | Long random string; required in production |
| `CORS_ORIGINS` | api | Comma-separated allowed origins; empty = allow any |
| `PORT` | api | Default `3000` |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` / `SEED_ADMIN_NAME` | seed | Defaults: `admin@invitera.local` / `admin12345` |
| `VITE_API_URL` | web, admin (build/dev time) | Browser-facing API URL. Empty = same origin (prod nginx proxies `/api`) |
| `VITE_WEB_URL` | admin (build/dev time) | Public web URL so the admin can link to invitations |
| `WEB_PORT` / `ADMIN_PORT` | prod compose | Host ports, default `8080` / `8081` |
| `PUBLIC_WEB_URL` | prod compose | Baked into the admin image as `VITE_WEB_URL` |

## Database

Schema lives in `packages/db/src/schema.ts` (tables: `users`, `customers`, `orders`, `invitations`, `guests`, `rsvps`, `wishes`, `media_assets`). After editing it:

```bash
bun db:generate   # writes SQL to packages/db/migrations/
bun db:migrate    # applies it
```

The same migrations run against SQLite (dev) and Turso (prod) — both speak libsql.

### Turso setup (production)

```bash
turso db create invitera
turso db show invitera --url      # -> DATABASE_URL
turso db tokens create invitera   # -> TURSO_AUTH_TOKEN
```

Then migrate/seed against it, either from your machine:

```bash
DATABASE_URL=libsql://… TURSO_AUTH_TOKEN=… bun db:migrate
DATABASE_URL=libsql://… TURSO_AUTH_TOKEN=… bun db:seed
```

or through the prod compose service (uses `.env`):

```bash
docker compose -f docker-compose.prod.yml run --rm api bun run db:migrate
docker compose -f docker-compose.prod.yml run --rm api bun run db:seed
```

## Production deployment

```bash
cp .env.example .env    # set DATABASE_URL, TURSO_AUTH_TOKEN, JWT_SECRET (+ PUBLIC_WEB_URL)
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml run --rm api bun run db:migrate
docker compose -f docker-compose.prod.yml run --rm api bun run db:seed   # first deploy only
```

How it is wired:

- `api`: Bun runs the Elysia server directly (no transpile step needed). Not published on the host.
- `web` / `admin`: multi-stage builds — Bun + Vite build, then `nginx:alpine` serves `dist/` with an SPA fallback and proxies `/api/*` (and `/health`) to `api:3000`. Browser traffic is therefore same-origin and no CORS configuration is needed.
- Put your TLS-terminating reverse proxy (Caddy, Traefik, nginx) in front of ports `${WEB_PORT}` and `${ADMIN_PORT}`, e.g. `inv.example.com` → web, `admin.example.com` → admin. Set `PUBLIC_WEB_URL=https://inv.example.com` before building so the admin links to live pages.
- To call the API from elsewhere instead, publish port 3000 on the `api` service, set `CORS_ORIGINS`, and build the frontends with `VITE_API_URL=https://api.example.com`.

## API

Public:

| Route | Description |
| --- | --- |
| `GET /health` | Liveness probe |
| `GET /api/invitations/:slug` | Published invitation + media + approved wishes. `?guest=<unique_slug>` adds the matched guest |
| `POST /api/invitations/:slug/rsvp` | `{ guestName, attendanceStatus, paxCount?, message?, guestSlug? }` |
| `POST /api/invitations/:slug/wishes` | `{ guestName, message }` — stored as `pending` until moderated |

Admin (Bearer JWT from login, 7-day expiry; all routes below require `Authorization: Bearer <token>`):

| Route | Description |
| --- | --- |
| `POST /api/admin/login` | `{ email, password }` → `{ token, user }` |
| `GET /api/admin/me` | Current user |
| `GET /api/admin/stats` | Dashboard counters |
| `GET/POST /api/admin/customers`, `GET/PATCH/DELETE /api/admin/customers/:id` | Customer CRUD (delete cascades to orders/invitations) |
| `GET/POST /api/admin/orders`, `GET/PATCH/DELETE /api/admin/orders/:id` | Order CRUD (delete detaches invitations) |
| `GET/POST /api/admin/invitations`, `GET/PATCH/DELETE /api/admin/invitations/:id` | Invitation CRUD (unique slug, template key, publish toggle, `themeConfigJson`) |
| `GET /api/admin/invitations/:id/rsvps` | `{ items, summary }` |
| `GET /api/admin/invitations/:id/wishes` | All wishes for moderation |
| `PATCH /api/admin/wishes/:id/status` | `{ status: pending \| approved \| rejected }` |

Passwords are hashed with Bun's built-in bcrypt (`Bun.password`). Draft (`is_published = false`) invitations return 404 publicly.

## Invitation templates

`template_key` selects a Vue component at runtime via the registry in `apps/web/src/templates/registry.ts`:

`modern-minimal` · `floral-elegant` · `javanese-classic` · `islamic-clean` · `luxury-dark`

Each template receives the invitation as a prop and is rendered with `<component :is="SelectedTemplate" :invitation="invitation" />`. Animations use Vue `<Transition>` + plain CSS only.

`theme_config_json` tweaks a template without code, e.g. `{"accent": "#be123c", "coverImageUrl": "https://…"}`.

To add a template: create `apps/web/src/templates/MyTemplate.vue`, add its key to `TEMPLATE_KEYS` in `packages/shared/src/constants.ts`, register it in `registry.ts`, and generate + apply a migration (the key is a column enum).
