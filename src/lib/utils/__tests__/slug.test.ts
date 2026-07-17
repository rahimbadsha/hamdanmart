import { describe, expect, it } from "vitest";

import { slugify, uniqueSlug } from "../slug";

describe("slugify", () => {
  it("lowercases and replaces spaces with hyphens", () => {
    expect(slugify("Fresh Mango")).toBe("fresh-mango");
  });

  it("strips leading and trailing hyphens", () => {
    expect(slugify("  Hello World  ")).toBe("hello-world");
  });

  it("replaces multiple special chars with single hyphen", () => {
    expect(slugify("A -- B")).toBe("a-b");
  });

  it("preserves Bengali characters", () => {
    const result = slugify("আম");
    expect(result).toBe("আম");
  });

  it("handles mixed English and Bengali", () => {
    const result = slugify("Fresh আম Juice");
    expect(result).toBe("fresh-আম-juice");
  });

  it("handles empty string", () => {
    expect(slugify("")).toBe("");
  });
});

describe("uniqueSlug", () => {
  it("appends a random suffix", () => {
    const result = uniqueSlug("Fresh Mango");
    expect(result).toMatch(/^fresh-mango-[a-z0-9]{6}$/);
  });

  it("generates different slugs each call", () => {
    const a = uniqueSlug("test");
    const b = uniqueSlug("test");
    expect(a).not.toBe(b);
  });
});
