# Architecture

## Layered Design

Three strict layers. Dependencies point downward only.

1. **Presentation** — pages, layouts, components, forms. No business logic, no direct DB access.
2. **Business (services)** — all business rules: pricing, stock, checkout, coupons, permissions. No React, no HTTP concerns.
3. **Data (repositories)** — the only layer that touches Prisma. Returns typed domain objects, strips sensitive fields.

API routes and Server Actions are thin adapters: validate input (Zod) → call a service → shape the response.

## Folder Structure

```
src/
├── app/                    # Next.js App Router (presentation + routing only)
│   ├── [locale]/           # bn / en locale segment
│   │   ├── (storefront)/   # customer-facing route group
│   │   └── account/        # customer account pages
│   ├── admin/              # admin dashboard routes
│   └── api/                # thin API route handlers
├── features/               # feature modules (vertical slices)
│   ├── auth/
│   ├── cart/
│   ├── catalog/            # products, categories, search
│   ├── checkout/
│   ├── orders/
│   ├── payments/           # gateway abstraction: COD, bKash, Nagad, Rocket, SSLCommerz
│   ├── reviews/
│   ├── wishlist/
│   ├── coupons/
│   ├── media/              # upload, compression, media manager
│   ├── notifications/
│   └── admin/              # admin-only services (analytics, settings, roles, audit)
│       Each feature contains: components/ actions/ services/ repositories/ schemas/ types.ts
├── components/             # shared UI (shadcn/ui base + composed components)
├── lib/                    # shared infrastructure
│   ├── db.ts               # Prisma client singleton
│   ├── auth/               # session management, password hashing, guards
│   ├── i18n/               # next-intl config, locale helpers
│   ├── email/              # email transport abstraction
│   ├── storage/            # file storage abstraction (local now, S3-compatible later)
│   ├── cache/              # caching helpers
│   ├── rate-limit/         # rate limiting
│   ├── logger/             # structured logging
│   ├── errors/             # AppError classes + error mapping
│   └── utils/              # generic utilities (money, dates, slugs)
├── config/                 # typed app config, env validation (Zod), constants
├── messages/               # i18n translation files (bn.json, en.json)
└── middleware.ts           # locale routing, session touch, security headers
prisma/
├── schema.prisma
├── migrations/
└── seed.ts
tests/
├── unit/
├── integration/
└── e2e/
```

## Key Decisions and Why

- **Feature modules (vertical slices)** — everything about "cart" lives in one place; features can be understood, tested, and changed in isolation.
- **Repository layer** — isolates Prisma. Enables the SQLite → PostgreSQL swap, sensitive-field stripping in one place, and clean mocking in tests.
- **Service layer** — business rules are framework-free plain TypeScript: unit-testable without Next.js or a browser.
- **Payment gateway abstraction** — one `PaymentProvider` interface; COD is the first implementation, bKash/Nagad/Rocket/SSLCommerz plug in later without touching checkout logic.
- **Storage abstraction** — `saveFile/getUrl/delete` interface; local disk today, S3-compatible (R2) later as a config change.
- **Email abstraction** — console/file transport in dev (no SMTP needed locally), SMTP in production.
- **No DI container** — module-level composition is enough at this scale; interfaces + factory functions where swapping matters (payments, storage, email). YAGNI.

## Cross-Cutting Concerns

- **Validation** — Zod schemas live in `features/*/schemas/`, shared between client forms (React Hook Form resolver) and server (actions/routes). Single source of truth.
- **Error handling** — typed `AppError` hierarchy (ValidationError, AuthError, NotFoundError, ConflictError). Services throw; a single mapper converts to HTTP responses / form errors. Never leak stack traces to clients.
- **Logging** — structured logger (pino). Request-level logging in middleware/adapters; business events logged in services; admin actions to audit_logs.
- **Caching** — Next.js data cache + `revalidateTag` for catalog pages; per-request memoization via React `cache()`. No Redis until real scale demands it.
- **Config** — all env vars validated with Zod at boot in `config/env.ts`. App fails fast on missing config. No `process.env` access outside this file.
- **Middleware** — locale detection/routing (next-intl), security headers, session cookie handling. Kept minimal; authorization happens in services, not middleware.
