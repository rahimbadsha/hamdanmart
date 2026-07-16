# Testing Strategy

## Tools

- **Vitest** — unit and integration tests
- **Playwright** — end-to-end tests
- **Zod** — schema tests double as validation tests

## Test Pyramid

### Unit Tests (most)

Target: business logic in services and utilities.

- Pricing calculations (totals, discounts, shipping)
- Coupon validity rules (expiry, usage limits, minimum order)
- Stock rules (availability, decrement, oversell prevention)
- Money utilities (integer poisha math, ৳ formatting)
- Permission checks (role → permission resolution)
- Validation schemas (accept good input, reject bad input)

No mocking of what is being tested; mock repositories only.

### Integration Tests

Target: services + repositories against a real test database (fresh SQLite file per run).

- Checkout transaction: order created + stock decremented + payment recorded atomically; rollback on failure
- Cart merge on login (guest cart → user cart)
- Auth flows: register, verify email, login, lockout, password reset
- Coupon usage tracking (limits enforced under concurrent use)
- Soft delete behavior (deleted products excluded from queries)

### E2E Tests (fewest, highest value)

Target: real user flows in the browser via Playwright.

- Full checkout: browse → add to cart → guest checkout → COD order placed → confirmation
- Registered checkout with saved address
- Search → filter → product page → wishlist
- Admin: login → create product → appears on storefront
- Locale switch: bn ↔ en renders correctly

### Security Tests

- IDOR: user A cannot fetch user B's orders/addresses (direct API calls)
- Authorization: non-admin blocked from every admin route and action
- Rate limits trigger on login/registration abuse
- Mass assignment: extra fields in request bodies are ignored
- Uploaded file validation rejects disguised non-images

## Rules

- Every bug fix gets a regression test.
- Checkout flow tests are mandatory and block merging if red.
- Tests run in lint-staged/CI before any milestone is approved.
- No test hits external services — email uses the console transport, payments use the COD/fake provider.
