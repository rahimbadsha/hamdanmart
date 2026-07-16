# Deployment Strategy

## Current Stage: Local-First

No VPS or cloud account yet. The app is built to run fully locally:

- SQLite database (single file, zero setup)
- Local filesystem image storage (`/public/uploads` or equivalent, behind a storage abstraction)
- `.env` for local configuration
- `pnpm dev` for development, `pnpm build && pnpm start` for a production-mode local run

## Sharing the Demo Online (no server needed)

Show the local build to the team via a secure tunnel:

- **Cloudflare Tunnel** (recommended): free, stable URL, `cloudflared tunnel --url http://localhost:3000`
- **ngrok** (alternative): quick one-off links

Run `pnpm build && pnpm start` first so the team sees production performance, not dev mode.

## Production (decided later)

Two supported paths — the architecture keeps both open:

### Path A: VPS (DigitalOcean / Hetzner / local BD host)

- Node runs 24/7 → SQLite works, local image storage works
- Can start on SQLite, move to PostgreSQL when traffic grows
- Nginx reverse proxy + HTTPS (Let's Encrypt)
- Simplest path from the local-first setup

### Path B: Vercel / serverless

- Requires hosted PostgreSQL (e.g. Neon) — SQLite does not work on serverless
- Requires object storage for images (S3-compatible, e.g. Cloudflare R2)
- The storage abstraction and Prisma make this a config change, not a rewrite

## Migration: SQLite → PostgreSQL

- Prisma schema stays PostgreSQL-compatible from day one (no SQLite-only features)
- Switch `provider` in the datasource, update `DATABASE_URL`, regenerate migrations
- Export/import data via a migration script
- Business logic and repositories unchanged

## Production Requirements (either path)

- HTTPS everywhere
- Secure environment variables (never committed)
- Automated database backups (daily minimum)
- Uploaded media included in backups
- Error logging and monitoring
- HSTS + security headers enabled (see SECURITY.md)
- CDN-ready image URLs (abstraction returns full URLs, so a CDN can be put in front later)
