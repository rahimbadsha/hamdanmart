/**
 * Money utilities.
 *
 * All amounts are stored and computed as integer poisha (1 ৳ = 100 poisha).
 * Floats are never used for money — see DATABASE.md.
 */

export const POISHA_PER_TAKA = 100;

export type SupportedLocale = "bn" | "en";

function assertInteger(value: number, label: string): void {
  if (!Number.isSafeInteger(value)) {
    throw new TypeError(`${label} must be a safe integer (got ${value})`);
  }
}

/** Converts a taka amount (e.g. user input "199.50") to integer poisha. */
export function takaToPoisha(taka: number): number {
  const poisha = Math.round(taka * POISHA_PER_TAKA);
  assertInteger(poisha, "poisha");
  return poisha;
}

/** Converts integer poisha to taka as a number (display/calculation edge only). */
export function poishaToTaka(poisha: number): number {
  assertInteger(poisha, "poisha");
  return poisha / POISHA_PER_TAKA;
}

/** Sums poisha amounts safely. */
export function sumPoisha(...amounts: readonly number[]): number {
  return amounts.reduce((total, amount) => {
    assertInteger(amount, "amount");
    return total + amount;
  }, 0);
}

/**
 * Formats integer poisha as a BDT currency string, e.g. "৳1,999.50".
 * Uses Western numerals in both locales for price clarity (see UI_GUIDELINES.md).
 */
export function formatBDT(poisha: number, locale: SupportedLocale = "en"): string {
  assertInteger(poisha, "poisha");
  const formatter = new Intl.NumberFormat(locale === "bn" ? "bn-BD-u-nu-latn" : "en-BD", {
    style: "currency",
    currency: "BDT",
    currencyDisplay: "narrowSymbol",
  });
  return formatter.format(poisha / POISHA_PER_TAKA);
}
