import { getTranslations } from "next-intl/server";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";

export default async function AuthLayout({
  children,
}: {
  readonly children: React.ReactNode;
}): Promise<React.ReactElement> {
  const t = await getTranslations("common");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-secondary/30 px-4 py-10">
      <Link href="/" className="text-xl font-bold">
        {t("appName")}
      </Link>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="sr-only">{t("appName")}</CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </main>
  );
}
