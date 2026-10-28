# Database schema

Single-tenant MySQL schema. One installation = one store. Branches are the only multi-location construct.

The Prisma source of truth is `packages/db/prisma/schema.prisma`. This document explains the domain rules that later phases must follow.

## Core rules

1. **No `store_id`.** Store identity lives in the singleton `store_settings` row (`id = "default"`).
2. **Stock quantity is never edited.** Every change is an append-only `stock_ledger` row. `stock_balances` is the cached on-hand/reserved total, updated in the same InnoDB transaction with row locks.
3. **Money is `Decimal(12, 2)`.** Currency defaults to BDT. Do not use floats.
4. **Snapshots on sales.** Order and POS line items copy name, SKU, and unit price at the time of sale so later catalog edits do not rewrite history.
5. **Serial numbers are unique globally.** A serial belongs to one variant and at most one branch at a time.
6. **Soft-disable over hard-delete** for catalog, users, branches, and suppliers. Financial documents (orders, ledger, payments) are never deleted.

## Domain map

```
store_settings ── branding, theme tokens, tax, SEO, license
     │
     ├── branches ── pos_terminals ── pos_sessions ── pos_sales
     │                    │
     │                    └── stock_balances / stock_ledger / serial_numbers
     │
     ├── users (staff | customer) ── roles ── permissions
     │
     ├── catalog: brands, categories, products, variants, specs, media
     │
     ├── commerce: carts, wishlists, coupons, orders, payments
     │
     ├── inventory: suppliers, purchase_orders, stock_transfers
     │
     └── after-sale: warranties, warranty_claims, due_ledger, url_redirects
```

## Stock ledger

`stock_ledger.quantity` is signed: positive for inbound, negative for outbound. `balance_after` is the on-hand quantity of that variant at that branch immediately after the row is applied.

Allowed `StockMovementType` values:

| Type | Typical source |
|---|---|
| `PURCHASE` | Goods received from a purchase order |
| `SALE` | Web / phone order fulfilled |
| `POS_SALE` | Counter sale |
| `RETURN` | Customer or POS return back to stock |
| `ADJUSTMENT` | Count correction (requires reason + actor) |
| `TRANSFER_IN` / `TRANSFER_OUT` | Branch-to-branch transfer |
| `RESERVE` / `RELEASE` | Checkout hold and expiry / cancel |

Application code must:

1. `SELECT … FOR UPDATE` the `stock_balances` row.
2. Reject the write if `on_hand - reserved + quantity < 0` for outbound types.
3. Insert the ledger row.
4. Update `on_hand` / `reserved`.
5. Commit.

Never expose `stock_balances.on_hand` as an editable admin field.

## Auth and RBAC

Staff and customers share `users`, distinguished by `UserKind`. Staff receive one or more `roles`. Seeded system roles:

| Role | Intended use |
|---|---|
| `owner` | First account; all permissions |
| `admin` | Catalog, orders, settings |
| `manager` | Branch operations, reports |
| `cashier` | POS only |
| `inventory` | Purchases, transfers, serials |
| `support` | Orders and warranties, no stock writes |

JWT access + refresh tokens. Refresh tokens are stored hashed in `refresh_tokens` and can be revoked.

## POS

A cashier opens a `pos_session` on a `pos_terminal` (cash drawer float). Sales belong to that session. Split payments are multiple `pos_payments` rows whose amounts must equal `paid`. Any remainder is recorded as `due` and a `due_ledger` entry against the customer.

Returns reference the original sale and write compensating stock / serial / due rows.

## Warranties

Created when a serialized item is sold (web or POS). Period comes from `products.warranty_months` unless overridden. Claims are a child table so the warranty itself stays the source of coverage dates.

## Settings vs code

| In the database | In the repo |
|---|---|
| Store name, logos, contacts, footer, invoice copy | Theme layout React components |
| Color / font / radius tokens | Theme default tokens (`packages/themes`) |
| Homepage section payloads and sort order | Section renderers |
| Menu trees | Navigation components |
| Payment / SMS / email provider flags and public ids | Driver implementations |
| Chosen `theme_id` (`CLASSIC` / `MODERN` / `BOLD`) | Theme packages |

Secrets for bKash, Nagad, SMTP, and SMS gateways should be stored in environment variables. The admin UI writes non-secret flags and display names to `payment_providers` / `notification_providers`.

## Bangladesh-specific fields

- Addresses use `division`, `district`, `thana`, then `line1`.
- Default timezone `Asia/Dhaka`, currency `BDT`, symbol `৳`.
- Payment provider enum includes `BKASH`, `NAGAD`, and `COD`.
- `Language` is `EN` | `BN` for a later bilingual storefront.

## Migration from WooCommerce

`url_redirects` holds 301s from old permalinks. Product `slug` values should be imported unchanged so existing URLs keep working before any extra redirects are added.

## What this schema deliberately omits (later)

- Multi-store / `store_id`
- Meilisearch indexes
- Offline POS outbox (v1.1)
- Marketplace / multi-vendor
- EMI plans (add as a payment provider + schedule table if a client needs it)
