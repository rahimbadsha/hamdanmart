/**
 * Generates a URL-safe slug.
 *
 * Unicode letters are preserved, so both English and Bengali names produce
 * readable slugs (e.g. "Fresh Mango" -> "fresh-mango", "আম" -> "আম").
 */
export function slugify(input: string): string {
  return input
    .normalize("NFC")
    .toLowerCase()
    .trim()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

/** Appends a short random suffix — used to resolve slug collisions. */
export function uniqueSlug(base: string): string {
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${slugify(base)}-${suffix}`;
}
