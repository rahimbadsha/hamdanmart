# Security Requirements

Security is a first-class requirement. Every milestone must pass this checklist before approval.

## Protect Against

- SQL Injection
- XSS
- CSRF
- Clickjacking
- SSRF
- Open Redirect
- IDOR
- Mass Assignment
- Authentication bypass
- Authorization bypass
- Brute Force
- Session Fixation
- Session Hijacking
- Spam Orders
- Fake Accounts
- Bot Attacks
- File Upload Attacks

## Required Measures

### Input and Output

- Zod validation on every input (forms, API routes, server actions)
- Whitelist fields explicitly — never spread client objects into database writes (prevents mass assignment)
- Output encoding; never render untrusted HTML
- Image validation: real content-type check (magic bytes), not extension only
- File size limits on all uploads
- Uploaded files renamed to generated IDs; never trust client filenames
- Redirect targets validated against an allowlist (prevents open redirect)

### Authentication and Sessions

- argon2 password hashing
- Database-backed sessions, HTTP-only, Secure, SameSite=Lax cookies
- Session ID regenerated on login (prevents session fixation)
- Account lockout after repeated failed logins (e.g. 5 attempts → temporary lock)
- Failed login tracking
- Password reset tokens: single-use, hashed in DB, short expiry
- Email verification required before sensitive actions

### Authorization

- Every resource access checks ownership or permission server-side (prevents IDOR)
- Admin routes protected by role + permission checks, enforced in the service layer — not only in UI
- Never rely on hidden UI as access control

### Abuse Prevention

- Rate limiting on login, registration, password reset, checkout, reviews, and search
- Spam prevention on guest checkout (rate limits + validation + optional phone verification later)
- Honeypot fields on public forms

### Headers and Transport

- Content-Security-Policy
- X-Frame-Options: DENY (prevents clickjacking)
- X-Content-Type-Options: nosniff
- Referrer-Policy
- HSTS in production (HTTPS only)

### Secrets and Data

- All secrets in environment variables; `.env` gitignored, `.env.example` documents keys
- No secrets in client bundles — server-only modules for anything sensitive
- Never log passwords, tokens, or payment data
- Sensitive fields never returned by APIs (repository layer strips them)

### Auditing

- Audit logging for all admin actions (who, what, when, before/after where useful)
- Order and payment state changes logged in order_status_history
