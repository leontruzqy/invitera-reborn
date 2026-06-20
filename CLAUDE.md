# Invitera Reborn

Wedding invitation platform. Customers order invitations, admins build and publish them, guests open personalized links to RSVP and leave wishes.

## Monorepo layout

Bun workspace monorepo (`bun.lock` at root).

| Path | Stack | Purpose |
|------|-------|---------|
| `apps/web` | Vue 3 + Vite + Tailwind | Public invitation site — `/:slug` |
| `apps/admin` | Vue 3 + Vite + Tailwind | Internal dashboard |
| `apps/api` | Bun + Elysia | REST API for both apps |
| `packages/db` | Drizzle ORM + libsql | Schema, migrations, seed |
| `packages/shared` | TypeScript | Shared types, constants, validators |

## Dev setup (no Docker)

```bash
bun install
bun db:migrate    # creates packages/db/dev.db
bun db:seed       # seeds admin + sample invitation
bun dev           # api :3000, web :5173, admin :5174
```

- Web: http://localhost:5173 (sample: `/rani-raka`)
- Admin: http://localhost:5174 — `admin@invitera.local` / `admin12345`
- API: http://localhost:3000/health

## Dev setup (Docker)

```bash
docker compose -f docker-compose.dev.yml up --build
```

SQLite lives in the `sqlite_data` volume. Source folders are bind-mounted; API hot-reloads, Vite HMR works. Re-run with `--build` after any `package.json` change.

## Scripts

| Script | What it does |
|--------|-------------|
| `bun dev` | All three apps concurrently |
| `bun dev:web / dev:admin / dev:api` | Single app |
| `bun db:generate` | Generate SQL migrations from schema |
| `bun db:migrate` | Apply migrations to `DATABASE_URL` |
| `bun db:seed` | Seed admin + sample data (idempotent) |
| `bun run build` | Production build (web + admin) |
| `bun start` | Run API in production mode |

## Environment variables

Copy `.env.example` → `.env`. Key vars:

| Variable | Notes |
|----------|-------|
| `DATABASE_URL` | Empty → `packages/db/dev.db`. Docker dev → `file:/data/dev.db`. Prod → `libsql://…` (Turso) |
| `TURSO_AUTH_TOKEN` | Turso auth (prod only) |
| `JWT_SECRET` | Required in prod; long random string |
| `CORS_ORIGINS` | Comma-separated allowed origins; empty = allow any |
| `VITE_API_URL` | Browser-facing API URL (empty = same origin via nginx proxy in prod) |
| `VITE_WEB_URL` | Public web URL for admin app links |
| `WEB_PORT / ADMIN_PORT` | Prod compose host ports (default 8080/8081) |

## Database

Schema: `packages/db/src/schema.ts`  
Tables: `users`, `customers`, `orders`, `invitations`, `guests`, `rsvps`, `wishes`, `media_assets`, `invitation_events`, `love_story_events`, `gift_accounts`

`invitations` carries the rich couple/content columns (short names, parents, taglines, opening greeting, Quran verse, closing message, hashtag, rsvp deadline). `media_assets.slot` (`cover`/`hero`/`bride`/`groom`/`gallery`) designates where an image is used. `invitation_events` (Akad/Resepsi), `love_story_events`, and `gift_accounts` are ordered child rows edited from the admin invitation page.

After editing the schema:
```bash
bun db:generate   # writes SQL to packages/db/migrations/
bun db:migrate    # applies it
```

Same migrations run against SQLite (dev) and Turso (prod) — both speak libsql.

## API routes

**Public:**

| Route | Description |
|-------|-------------|
| `GET /health` | Liveness probe |
| `GET /api/invitations/:slug` | Published invitation + wishes. `?guest=<slug>` pre-fills RSVP |
| `POST /api/invitations/:slug/rsvp` | `{ guestName, attendanceStatus, paxCount?, message?, guestSlug? }` |
| `POST /api/invitations/:slug/wishes` | `{ guestName, message }` — stored as `pending` until moderated |

**Admin** (Bearer JWT, 7-day expiry):

| Route | Description |
|-------|-------------|
| `POST /api/admin/login` | `{ email, password }` → `{ token, user }` |
| `GET /api/admin/me` | Current user |
| `GET /api/admin/stats` | Dashboard counters |
| `GET/POST /api/admin/customers`, `GET/PATCH/DELETE /api/admin/customers/:id` | Customer CRUD |
| `GET/POST /api/admin/orders`, `GET/PATCH/DELETE /api/admin/orders/:id` | Order CRUD |
| `GET/POST /api/admin/invitations`, `GET/PATCH/DELETE /api/admin/invitations/:id` | Invitation CRUD |
| `GET /api/admin/invitations/:id/rsvps` | `{ items, summary }` |
| `GET /api/admin/invitations/:id/wishes` | All wishes for moderation |
| `GET/POST` + `PATCH/DELETE …/:childId` on `…/invitations/:id/{events,story,gifts,media}` | Nested CRUD for schedule events, love story, gift accounts, media assets |
| `PATCH /api/admin/wishes/:id/status` | `{ status: pending \| approved \| rejected }` |

Passwords hashed with `Bun.password` (bcrypt). Draft invitations (`is_published = false`) return 404 publicly.

## Invitation templates

Template key selects a Vue component via `apps/web/src/templates/registry.ts`.

The single canonical template is `rani-raka` — an Indonesian Islamic, peacock-romantic invitation. Its sections live in `apps/web/src/templates/rani-raka/` (`art/`, `sections/`, `rani-raka.css`, `useReveal.ts`); `RaniRaka.vue` assembles them and the amplop cover is `apps/web/src/components/CoverOverlay.vue`.

Rendered as: `<component :is="SelectedTemplate" :invitation="invitation" :opened="opened" />` (the `opened` prop drives the hero gate animation once the cover is opened).

`theme_config_json` tweaks the template without code:
`{"palette": ["#0d2b4e","#1f6fa8","#2fa39a","#cda434"], "heroStyle": "gate", "motion": true, "birds": 7}` (also `accent`, `coverImageUrl`). Palette presets and hero styles are in `packages/shared/src/constants.ts` (`PALETTE_PRESETS`, `HERO_STYLES`).

**To add a template:**
1. Create `apps/web/src/templates/MyTemplate.vue`
2. Add the key to `TEMPLATE_KEYS` in `packages/shared/src/constants.ts`
3. Register in `apps/web/src/templates/registry.ts`
4. Run `bun db:generate && bun db:migrate` (key is a column enum)

## Production deployment

```bash
cp .env.example .env   # set DATABASE_URL, TURSO_AUTH_TOKEN, JWT_SECRET, PUBLIC_WEB_URL
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml run --rm api bun run db:migrate
docker compose -f docker-compose.prod.yml run --rm api bun run db:seed   # first deploy only
```

Web/admin are multi-stage builds (Vite → nginx). Nginx proxies `/api/*` to `api:3000` so frontend traffic is same-origin (no CORS needed). Put a TLS-terminating reverse proxy (Caddy/Traefik/nginx) in front of `WEB_PORT` and `ADMIN_PORT`.
