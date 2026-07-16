import { defineRouting } from "next-intl/routing";

/**
 * Locale routing configuration.
 *
 * Bengali is the default (mobile-first Bangladesh customers):
 *   /          -> Bengali
 *   /en/...    -> English
 */
export const routing = defineRouting({
  locales: ["bn", "en"],
  defaultLocale: "bn",
  localePrefix: "as-needed",
});

export type AppLocale = (typeof routing.locales)[number];
