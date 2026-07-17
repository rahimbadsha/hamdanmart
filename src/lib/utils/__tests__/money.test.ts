import { describe, expect, it } from "vitest";

import {
  formatBDT,
  poishaToTaka,
  POISHA_PER_TAKA,
  sumPoisha,
  takaToPoisha,
} from "../money";

describe("takaToPoisha", () => {
  it("converts whole taka to poisha", () => {
    expect(takaToPoisha(100)).toBe(10000);
  });

  it("converts fractional taka correctly", () => {
    expect(takaToPoisha(199.5)).toBe(19950);
  });

  it("rounds to nearest poisha", () => {
    expect(takaToPoisha(10.999)).toBe(1100);
  });

  it("handles zero", () => {
    expect(takaToPoisha(0)).toBe(0);
  });

  it("throws on unsafe integers", () => {
    expect(() => takaToPoisha(Number.MAX_SAFE_INTEGER)).toThrow(TypeError);
  });
});

describe("poishaToTaka", () => {
  it("converts whole poisha to taka", () => {
    expect(poishaToTaka(10000)).toBe(100);
  });

  it("preserves fractional taka", () => {
    expect(poishaToTaka(19950)).toBe(199.5);
  });

  it("handles zero", () => {
    expect(poishaToTaka(0)).toBe(0);
  });

  it("throws on non-integer", () => {
    expect(() => poishaToTaka(99.5)).toThrow(TypeError);
  });
});

describe("sumPoisha", () => {
  it("sums multiple amounts", () => {
    expect(sumPoisha(1000, 2000, 3000)).toBe(6000);
  });

  it("returns 0 for no arguments", () => {
    expect(sumPoisha()).toBe(0);
  });

  it("throws if any amount is not an integer", () => {
    expect(() => sumPoisha(100, 50.5)).toThrow(TypeError);
  });
});

describe("formatBDT", () => {
  it("formats poisha as BDT currency string", () => {
    const result = formatBDT(199950);
    expect(result).toContain("1,999.50");
  });

  it("formats zero amount", () => {
    const result = formatBDT(0);
    expect(result).toContain("0.00");
  });

  it("throws on non-integer", () => {
    expect(() => formatBDT(99.5)).toThrow(TypeError);
  });
});

describe("POISHA_PER_TAKA", () => {
  it("equals 100", () => {
    expect(POISHA_PER_TAKA).toBe(100);
  });
});
