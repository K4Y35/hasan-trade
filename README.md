# ShopStack

White-label e-commerce, admin, and POS. Each client gets a separate install. Branding, theme tokens, menus, and homepage sections are data. Themes are code. Do not fork this repo per client.

## Apps

| Path | Role |
|---|---|
| `apps/storefront` | Next.js storefront (App Router, ISR) |
| `apps/admin` | Next.js admin + POS |
| `apps/api` | Express API (Zod, JWT, RBAC) |

## Packages

| Path | Role |
|---|---|
| `packages/db` | Prisma schema, migrations, seed |
| `packages/shared` | Shared types and Zod schemas |
| `packages/storage` | Local / MinIO / S3 drivers |
| `packages/themes` | `classic`, `modern`, `bold` tokens |
| `packages/config` | Shared TypeScript config |

## Prerequisites

- Node.js 22+
- pnpm 9+
- MySQL 8+ (or Docker via `docker-compose.dev.yml`)

## Quick start

```bash
corepack enable
pnpm install
pnpm setup
# Local MySQL: create database shopstack and user shopstack, then:
pnpm db:generate
pnpm db:migrate:deploy
pnpm db:seed
pnpm dev
```

Use `127.0.0.1` in `DATABASE_URL` on MySQL 9 (not `localhost`) so Prisma can authenticate.

| App | URL |
|---|---|
| Storefront | http://localhost:3000 |
| Admin / POS | http://localhost:3001 |
| API | http://localhost:4000 |
| MinIO console | http://localhost:9001 |

Default owner after seed: `owner@example.com` / `ChangeMe!123` (override with `SEED_OWNER_PASSWORD`).

## Scripts

| Script | What it does |
|---|---|
| `pnpm dev` | Run api, storefront, and admin |
| `pnpm build` | Build all workspaces |
| `pnpm typecheck` | Typecheck all workspaces |
| `pnpm db:migrate` | Apply Prisma migrations |
| `pnpm db:seed` | Seed roles, settings, demo catalog |
| `pnpm db:studio` | Open Prisma Studio |

## Docs

- [Project plan](docs/PROJECT_PLAN.md)
- [Schema](docs/SCHEMA.md)
- [Developer notes](docs/DEVELOPER.md)

## License

Proprietary until the handover terms in `docs/PROJECT_PLAN.md` are settled.
