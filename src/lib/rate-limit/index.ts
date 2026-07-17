import "server-only";

import { RateLimitError } from "@/lib/errors";

/**
 * Minimal in-memory sliding-window rate limiter.
 *
 * Suitable for the single-process local/VPS setup. Phase 7 revisits this
 * (shared store) if the app is ever deployed multi-instance.
 */

const buckets = new Map<string, number[]>();

const MAX_TRACKED_KEYS = 10_000;

interface RateLimitOptions {
  /** Unique key, e.g. "login:user@example.com". */
  readonly key: string;
  /** Max attempts allowed within the window. */
  readonly limit: number;
  readonly windowMs: number;
}

export function enforceRateLimit({ key, limit, windowMs }: RateLimitOptions): void {
  const now = Date.now();
  const cutoff = now - windowMs;

  const timestamps = (buckets.get(key) ?? []).filter((t) => t > cutoff);
  if (timestamps.length >= limit) {
    // Message is an i18n key — action adapters surface it to forms.
    throw new RateLimitError("errors.rateLimited");
  }
  timestamps.push(now);
  buckets.set(key, timestamps);

  // Bounded memory: drop the oldest keys if the map grows too large.
  if (buckets.size > MAX_TRACKED_KEYS) {
    const oldest = buckets.keys().next().value;
    if (oldest !== undefined) buckets.delete(oldest);
  }
}
