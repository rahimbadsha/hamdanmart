# HamdanMart Ecommerce Platform

## Goal

Rebuild https://hamdanmart.com/ from scratch as a modern, secure, high-performance ecommerce platform with a professional admin dashboard.

The old site is WordPress/WooCommerce. Its data (products, categories, customers, orders) will be migrated into the new platform before launch. Do NOT copy the old implementation — only the business functionality.

## Main Requirements

- Modern responsive frontend
- Bilingual UI: Bengali + English
- Fast product browsing
- Product search with autocomplete
- Filters and sorting
- Easy checkout
- Guest checkout
- Customer accounts
- Wishlist
- Cart (works for guests and logged-in users)
- Coupons
- Order tracking
- Order cancellation
- Inventory management
- Product management
- Category management
- Review system
- Invoice generation
- Related products
- Recently viewed products
- Stock indicators
- Admin dashboard
- Analytics dashboard
- Notification system
- Media manager
- Spam prevention
- Role-based admin access
- Audit logs

## Payment Methods

- Cash on Delivery (primary at launch)
- bKash
- Nagad
- Rocket
- SSLCommerz integration ready
- Payment gateway abstraction so new gateways plug in without changing business logic

## Target Users

- Customers in Bangladesh
- Mobile-first users (majority of traffic expected on mobile)
- Admin/store managers

## Locale and Currency

- Languages: Bengali (bn) and English (en)
- Currency: BDT (৳)
- Timezone: Asia/Dhaka

## Business Goals

- Easy product management
- Easy order management
- Secure checkout
- High conversion rate
- Low maintenance cost
- Future scalability
- Full data migration from the old WordPress/WooCommerce site

## Development Approach

- Built and run locally first (SQLite, local image storage — zero external services)
- Demo shared with the team online via a secure tunnel (Cloudflare Tunnel or ngrok) from the local machine
- Production hosting decided later; architecture keeps both VPS and cloud paths open (see DEPLOYMENT.md)
