import { getTranslations } from "next-intl/server";

import { LocaleSwitcher } from "@/components/locale-switcher";
import { Badge } from "@/components/ui/badge";

export default async function HomePage(): Promise<React.ReactElement> {
  const t = await getTranslations("home");
  const tCommon = await getTranslations("common");

  return (
    <main className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b px-4 py-3 sm:px-6">
        <span className="text-lg font-bold">{tCommon("appName")}</span>
        <LocaleSwitcher />
      </header>

      <section className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
        <Badge variant="secondary">{t("status")}</Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h1>
        <p className="max-w-md text-muted-foreground">{t("subtitle")}</p>
      </section>
    </main>
  );
}
