# Database Design

## Database

Use Prisma with SQLite for development.
Schema must be PostgreSQL compatible — no SQLite-only features in the Prisma schema.

## Main Tables

### Users and Auth

- users
- addresses
- sessions
- password_reset_tokens
- email_verification_tokens
- admin_users
- roles
- permissions
- role_permissions

### Catalog

- products
- categories
- product_variants
- product_images
- inventory
- media (media manager files)

### Shopping

- carts (guest carts keyed by session token, user carts by user id; merged on login)
- cart_items
- wishlists
- wishlist_items
- coupons
- coupon_usages

### Orders and Payments

- orders
- order_items
- order_status_history (powers order tracking)
- payments
- refunds
- invoices
- shipping_methods

### Content and System

- reviews
- notifications
- settings
- audit_logs

## Bilingual Content

Fixed two-language design: bilingual columns on content tables (e.g. `name_en`, `name_bn`, `description_en`, `description_bn`).

- Simple, indexable, no extra joins.
- If more languages are ever needed, migrate to separate translation tables — isolate reads behind the repository layer so this swap does not touch business logic.

## Database Rules

- Use cuid for IDs.
- Use createdAt / updatedAt timestamps on every table.
- Use soft delete (deletedAt) where appropriate: products, categories, users, reviews.
- Use foreign keys everywhere.
- Add indexes: slugs, foreign keys, order status, user email, product search fields.
- Unique constraints: user email, product slug, category slug, coupon code, order number.
- Avoid duplicated data.
- Store money as integer (poisha / smallest unit) — never float.
- Snapshot pricing on order_items (price at purchase time), so later price changes never alter old orders.
- Use transactions for checkout: stock decrement + order creation + payment record must be atomic.
- Guest cart: cart row with nullable userId + sessionToken; merge into user cart on login.
