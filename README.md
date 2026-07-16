# HamdanMart

Modern bilingual (বাংলা + English) ecommerce platform for Bangladesh — rebuilt from scratch with Next.js, TypeScript, Prisma, and Tailwind CSS.

> **Status:** planning/documentation stage. Code milestones begin with Phase 1 (see [ROADMAP.md](ROADMAP.md)).

## Features (planned)

- Storefront: search with autocomplete, filters, cart, wishlist, reviews, order tracking
- Checkout: guest + registered, Cash on Delivery, bKash / Nagad / Rocket / SSLCommerz-ready
- Admin dashboard: products, orders, inventory, coupons, media manager, analytics, roles & permissions, audit logs
- Bilingual UI (bn/en), BDT currency, mobile-first

## Tech Stack

Next.js (App Router) · TypeScript strict · Tailwind CSS · shadcn/ui · Prisma · SQLite (dev) → PostgreSQL-ready · Zod · React Hook Form · next-intl

## Prerequisites

- Node.js 20 LTS+
- pnpm

## Getting Started

```bash
pnpm install
cp .env.example .env
pnpm prisma migrate dev     # creates SQLite DB + runs migrations
pnpm prisma db seed         # sample data + admin user
pnpm dev                    # http://localhost:3000
```

Production-mode local run:

```bash
pnpm build && pnpm start
```

Share a demo with the team (no server needed):

```bash
cloudflared tunnel --url http://localhost:3000
```

## Scripts

| Script | Purpose |
|--------|---------|
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm start` | Run production build |
| `pnpm lint` | ESLint |
| `pnpm test` | Unit + integration tests (Vitest) |
| `pnpm test:e2e` | E2E tests (Playwright) |

## Documentation

| Doc | Contents |
|-----|----------|
| [PROJECT.md](PROJECT.md) | Business requirements and goals |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Layers, folder structure, decisions |
| [ROADMAP.md](ROADMAP.md) | Phased development plan |
| [DATABASE.md](DATABASE.md) | Schema design and rules |
| [SECURITY.md](SECURITY.md) | Threat model and required measures |
| [UI_GUIDELINES.md](UI_GUIDELINES.md) | Design system and UX rules |
| [TESTING.md](TESTING.md) | Test strategy |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Local-first setup and production paths |
