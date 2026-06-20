# Black OSINT

An OSINT (Open Source Intelligence) research tool for investigating domains, IPs, usernames, emails, phones, and public social posts.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite (artifacts/osint-app)
- API: Express 5 (artifacts/api-server)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/db/src/schema/searches.ts` — searches table schema
- `lib/db/src/schema/targets.ts` — targets table schema
- `artifacts/osint-app/src/` — React frontend (pages: dashboard, searches, targets, target-detail, posts)
- `artifacts/api-server/src/routes/searches.ts` — search CRUD + OSINT result builder
- `artifacts/api-server/src/routes/targets.ts` — saved targets CRUD
- `artifacts/api-server/src/routes/posts.ts` — public posts search and trending

## Architecture decisions

- OSINT results are generated server-side (simulated) to keep the app functional without external API keys. Real integrations (Shodan, WHOIS APIs, etc.) can be swapped in per-route.
- All DB `Date` fields are serialized to ISO strings before Zod parsing (Drizzle returns JS Date objects but OpenAPI spec expects strings).
- Entity-shaped Zod schema names used throughout to avoid Orval TS2308 collisions.
- Routes are split by domain (searches, targets, posts) under `artifacts/api-server/src/routes/`.

## Product

- **Dashboard** — search bar for instant OSINT queries, stats overview, recent operations, trending signals
- **Search History** — filterable list of past queries with type badges and delete actions
- **Saved Targets** — card registry for ongoing investigations, with notes and tags
- **Target Dossier** — single target view with inline notes editing
- **Public Posts** — cross-platform post scanner (Twitter, Reddit, Mastodon) by keyword

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- DB `createdAt` fields must be serialized via `.toISOString()` before Zod parsing
- Always re-run codegen after changing `lib/api-spec/openapi.yaml`
- Use entity-shaped names for request body schemas in OpenAPI (not operation-shaped like `CreateSearchBody`)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
