# Development Roadmap

Each phase ends with review and approval before the next phase starts.

## Phase 1 - Foundation

- Project setup (pnpm, Next.js, TypeScript strict)
- Tailwind setup
- shadcn/ui setup
- Prisma + SQLite setup
- i18n setup (next-intl, bn + en)
- Base architecture (folders, layers — see ARCHITECTURE.md)
- Shared utilities
- Error handling system
- Validation system (Zod)
- Logging setup
- ESLint, Prettier, Husky, lint-staged, EditorConfig
- Environment variable handling + .env.example

## Phase 2 - Database

- Full schema design (see DATABASE.md)
- Migrations
- Seed data (sample products, categories, admin user)
- Repository layer

## Phase 3 - Authentication

- Customer auth (email + password)
- Email verification
- Forgot password (token-based reset)
- Admin auth
- Roles and permissions
- Session management (database-backed, HTTP-only cookies)
- Account lockout after failed attempts
- Email abstraction layer (console transport in dev)

## Phase 4 - Storefront

- Homepage
- Product listing
- Product details (gallery, zoom, stock indicator, breadcrumb)
- Search with autocomplete
- Filters and sorting
- Cart (guest + logged-in, merge on login)
- Wishlist
- Related products
- Recently viewed
- SEO-friendly URLs

## Phase 5 - Checkout and Orders

- Address management
- Shipping methods and cost
- Payment methods (COD first; gateway abstraction for bKash/Nagad/Rocket/SSLCommerz)
- Coupon application
- Order placement (transactional, stock-safe)
- Order tracking (status history)
- Order cancellation
- Invoice generation

## Phase 6 - Admin Dashboard

- Dashboard overview + analytics
- Products (with variants)
- Categories
- Orders (status management, refunds)
- Customers
- Coupons
- Inventory
- Reviews (moderation)
- Media manager (upload, compression, WebP)
- Notifications
- Shipping settings
- Payment settings
- Reports (export)
- Store settings
- Roles and permissions
- Audit logs

## Phase 7 - Security and Testing

- Rate limiting
- Spam and bot prevention
- Security headers (CSP, X-Frame-Options, HSTS)
- Full validation pass
- Unit tests
- Integration tests
- E2E tests (checkout flow)
- Security tests

## Phase 8 - Performance, SEO, Accessibility

- Lighthouse 95+ pass
- Core Web Vitals optimization
- Image optimization audit
- Sitemap, robots.txt, canonical URLs
- Structured data (schema.org), Open Graph, Twitter Cards
- Dynamic metadata
- WCAG AA audit

## Phase 9 - Data Migration and Launch

- WordPress/WooCommerce export analysis
- Import scripts: categories, products, images, customers, orders
- Data verification pass
- Online demo for the team (Cloudflare Tunnel / ngrok)
- Production hosting decision
- SQLite → PostgreSQL migration (if required by hosting)
- Deployment (see DEPLOYMENT.md)
- Backups + monitoring
