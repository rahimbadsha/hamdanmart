/**
 * Date utilities.
 *
 * All business timestamps (orders, invoices, reports) are displayed in
 * Bangladesh time regardless of server timezone.
 */

export const BUSINESS_TIMEZONE = "Asia/Dhaka";

export type DateLocale = "bn" | "en";

/** Formats a date for display, e.g. "16 July 2026, 5:30 PM" (Asia/Dhaka). */
export function formatDateTime(date: Date, locale: DateLocale = "en"): string {
  return new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: BUSINESS_TIMEZONE,
  }).format(date);
}

/** Formats a date without time, e.g. "16 July 2026" (Asia/Dhaka). */
export function formatDate(date: Date, locale: DateLocale = "en"): string {
  return new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-BD", {
    dateStyle: "medium",
    timeZone: BUSINESS_TIMEZONE,
  }).format(date);
}
