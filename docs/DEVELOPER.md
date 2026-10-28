# Developer guide

## Monorepo

pnpm workspaces + Turborepo. Package names use the `@shopstack/` scope.

```
pnpm --filter @shopstack/api dev
pnpm --filter @shopstack/db exec prisma migrate dev
```

## Database changes

1. Edit `packages/db/prisma/schema.prisma`.
2. Run `pnpm db:migrate -- --name describe_the_change`.
3. Commit the generated files under `packages/db/prisma/migrations/`.
4. Never hand-write SQL against a client install. Migrations run on update.

Stock writes must go through a ledger service (to be implemented in phase 5). Do not `UPDATE stock_balances SET on_hand = …` from random endpoints.

## Settings vs themes

- Change colors / fonts / logos via `store_settings` and the admin branding screen.
- Change layout / component structure in `packages/themes` and the storefront app.
- If a client asks for a one-off layout change, add a setting or a homepage section type. Do not copy the app.

## Storage

`packages/storage` exposes `StorageDriver`. Choose the driver with `STORAGE_DRIVER=local|minio|s3`. Object keys in `media_assets` stay the same when a client later moves from disk to MinIO.

## Auth

Access JWT (short) + refresh JWT (long, hashed in `refresh_tokens`). RBAC permissions are string slugs such as `catalog.write` and `pos.sell`. Check them in the API, not only in the admin UI.

## Local services

`docker-compose.dev.yml` runs MySQL 8, Redis, and MinIO. Apps run on the host via `pnpm dev` so hot reload works.

Production shape is `docker-compose.yml` (api, storefront, admin, Caddy). That file is a stub until phase 7.
