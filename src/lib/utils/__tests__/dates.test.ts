import { describe, expect, it } from "vitest";

import { BUSINESS_TIMEZONE, formatDate, formatDateTime } from "../dates";

describe("BUSINESS_TIMEZONE", () => {
  it("is Asia/Dhaka", () => {
    expect(BUSINESS_TIMEZONE).toBe("Asia/Dhaka");
  });
});

describe("formatDateTime", () => {
  it("includes date and time", () => {
    const date = new Date("2026-07-16T10:30:00Z");
    const result = formatDateTime(date, "en");
    expect(result).toContain("Jul");
    expect(result).toContain("2026");
  });

  it("formats in Bengali locale", () => {
    const date = new Date("2026-07-16T10:30:00Z");
    const result = formatDateTime(date, "bn");
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("formatDate", () => {
  it("includes date without time", () => {
    const date = new Date("2026-07-16T10:30:00Z");
    const result = formatDate(date, "en");
    expect(result).toContain("Jul");
    expect(result).toContain("2026");
  });
});
