"use client";

import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";

const LOCALE_LABELS: Record<AppLocale, string> = {
  bn: "বাংলা",
  en: "English",
};

export function LocaleSwitcher(): React.ReactElement {
  const t = useTranslations("common");
  const activeLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchTo(locale: AppLocale): void {
    router.replace(pathname, { locale });
  }

  return (
    <nav aria-label={t("language")} className="flex items-center gap-1">
      {routing.locales.map((locale) => (
        <Button
          key={locale}
          variant={locale === activeLocale ? "secondary" : "ghost"}
          size="sm"
          aria-current={locale === activeLocale ? "true" : undefined}
          onClick={() => switchTo(locale)}
        >
          {LOCALE_LABELS[locale]}
        </Button>
      ))}
    </nav>
  );
}
