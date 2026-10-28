# ShopStack — white-label e-commerce + POS

Single-tenant per installation. One codebase, many client installs. Differences live in settings, not in forked code.

## 1. Design decisions

- **Single-tenant per installation.** No `store_id` on tables and no domain-based store resolution. Each install has exactly one store, held in `store_settings`.
- **Keep branches.** A retailer may have many physical shops. Each branch has its own stock and POS terminals.
- **Everything branded is configuration,** editable from the admin: name, logos, colors, fonts, contacts, footer, invoice text, payment keys, homepage sections, menus.
- **Themes are code, settings are data.** Ship 3 themes in code. The admin picks one and adjusts design tokens (colors, fonts, radius, button and card style) with a live preview.
- **Never fork per client.** Client differences live in settings, not in modified code.
- **Storage abstraction.** One storage interface with three drivers: local disk, MinIO (self-hosted S3) and S3/R2.

## 2. Stack

| Layer | Choice |
|---|---|
| Monorepo | pnpm workspaces + Turborepo, TypeScript throughout |
| Storefront | Next.js (App Router, ISR), Tailwind |
| Admin + POS | Separate Next.js app, shadcn/ui, TanStack Table |
| API | Express, Zod validation, JWT (access + refresh), RBAC |
| Database | MySQL + Prisma, migrations in the repo |
| Cache/queue | Redis + BullMQ (emails, SMS, image processing, stock sync) |
| Search | MySQL FULLTEXT first, Meilisearch later |
| Packaging | Docker Compose (api, storefront, admin, MySQL, Redis, MinIO, Caddy) |

```
apps/
  storefront/   admin/   api/
packages/
  db/ (schema, migrations, seed)   shared/ (types, zod schemas)
  ui/ (shared components)          themes/ (classic, modern, bold)
  config/ (eslint, tsconfig)       storage/ (local, minio, s3)
deploy/  (docker-compose, caddy, backup scripts, installer)
docs/
```

## 3. Phases

Timings assume one full-time developer.

| Phase | Scope | Est. |
|---|---|---|
| 0. Discovery | Audit source catalog data, finalize requirements, wireframes and 3 theme designs | 1–2 wks |
| 1. Foundation | Monorepo, Docker, DB schema, auth + roles, settings, storage driver, CI | 1–2 wks |
| 2. Catalog + admin core | Categories (tree), brands, products, variants, spec fields, media, branding and theme settings, menus | 2–3 wks |
| 3. Storefront | 3 themes, homepage sections, category pages with filters, product page, search, cart, wishlist, compare, accounts, SEO | 3–4 wks |
| 4. Orders + payments | Checkout, COD, bKash/Nagad, order management, emails/SMS, invoices | 2 wks |
| 5. Inventory + POS | Stock per branch, serial numbers, suppliers, purchases, POS (barcode, split payments, dues, returns, warranty), receipts, reports | 3–4 wks |
| 6. Migration + hardening | Catalog import, 301 redirects, performance, security review, tests | 2 wks |
| 7. Packaging + handover | Installer, setup wizard, docs, backups, update process, license | 1–2 wks |

Total: about 16–22 weeks.

## 4. Release milestones

1. **v0.5, storefront + admin** (phases 1–4). The online store can replace WordPress.
2. **v0.8, POS + inventory** (phase 5). The shop counter moves onto it.
3. **v1.0, handover-ready** (phases 6–7). It can be installed for additional clients.

Use the first production install as the pilot so real problems show up before the template goes to anyone else.

## 5. Handover and installation plan

- **One-command install:** `docker compose up` with a `.env` file (domain, DB passwords, secrets, storage driver). Caddy handles HTTPS automatically.
- **First-run setup wizard:** create the owner account, enter store name and logo, pick a theme, set currency and language, load optional demo data.
- **Migrations:** run automatically on update.
- **Versioning:** tagged semantic versions, changelog, documented upgrade path per release.
- **Backups:** scheduled MySQL dump and uploads backup script, with restore instructions.
- **Secrets:** nothing hardcoded. Each client brings their own payment merchant accounts, SMS provider and email credentials.
- **Documentation:** install guide, admin user guide, POS cashier guide, developer guide.

## 6. Business and legal points (have a lawyer review)

- Ownership and licensing: who owns the source, and what each client may do with it.
- Open-source dependencies: confirm licenses allow commercial handover (most MIT/Apache ones do).
- Support and maintenance terms after installation.
- Optional license key that ties an install to a client domain.

## 7. Main risks

| Risk | Mitigation |
|---|---|
| Scope is very large | Release in three milestones, with one production install as the pilot |
| Per-client code drift | Settings-driven design, no client forks |
| Stock errors between POS and web | InnoDB transactions with row locking, and a stock ledger instead of an editable quantity |
| Lost SEO on migration | Keep URL patterns, 301 redirects, sitemap, same meta data |
| Unreliable shop internet | POS that queues sales offline and syncs when the connection returns (maybe v1.1) |
| Payment gateway delays | Start merchant account applications (bKash, Nagad) early |

## 8. Current status

Working MVP is running: auth + RBAC, catalog, storefront, COD checkout, orders, stock ledger, and POS. Remaining polish includes live bKash/Nagad drivers, email/SMS, WooCommerce import, installer wizard, and distinct theme layouts.
