import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { enforceRateLimit } from "../index";

describe("enforceRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests within limit", () => {
    expect(() =>
      enforceRateLimit({ key: "test:allow", limit: 3, windowMs: 60_000 }),
    ).not.toThrow();
  });

  it("throws after exceeding limit", () => {
    const opts = { key: "test:exceed", limit: 2, windowMs: 60_000 };
    enforceRateLimit(opts);
    enforceRateLimit(opts);
    expect(() => enforceRateLimit(opts)).toThrow("errors.rateLimited");
  });

  it("resets after window expires", () => {
    const opts = { key: "test:reset", limit: 1, windowMs: 1_000 };
    enforceRateLimit(opts);
    expect(() => enforceRateLimit(opts)).toThrow();

    vi.advanceTimersByTime(1_001);
    expect(() => enforceRateLimit(opts)).not.toThrow();
  });

  it("uses separate buckets per key", () => {
    const opts1 = { key: "test:a", limit: 1, windowMs: 60_000 };
    const opts2 = { key: "test:b", limit: 1, windowMs: 60_000 };
    enforceRateLimit(opts1);
    expect(() => enforceRateLimit(opts2)).not.toThrow();
  });
});
