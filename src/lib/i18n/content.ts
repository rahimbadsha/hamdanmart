import type { AppLocale } from "@/i18n/routing";

/**
 * Picks the localized value from bilingual column pairs (nameEn/nameBn, …).
 * Falls back to English if the Bengali value is empty.
 */
export function localized<
  F extends string,
  T extends Record<`${F}En` | `${F}Bn`, string | null>,
>(row: T, field: F, locale: AppLocale): string {
  const bn = row[`${field}Bn` as keyof T] as string | null;
  const en = row[`${field}En` as keyof T] as string | null;
  return (locale === "bn" ? bn || en : en || bn) ?? "";
}
