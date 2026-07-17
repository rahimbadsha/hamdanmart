import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, redirect } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { LogoutButton } from "@/features/auth/components/logout-button";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("account");
  return { title: t("title") };
}

export default async function AccountPage(): Promise<React.ReactElement> {
  const user = await getCurrentUser();
  if (!user) {
    redirect({ href: "/login", locale: await getLocale() });
    return <></>; // unreachable — redirect() throws
  }
  const t = await getTranslations();

  return (
    <main className="mx-auto w-full max-w-2xl space-y-6 px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("account.title")}</h1>
        <LogoutButton />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {user.name}
            {user.emailVerifiedAt ? (
              <Badge variant="secondary">{t("account.verified")}</Badge>
            ) : (
              <Badge variant="outline">{t("account.unverified")}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-muted-foreground">
          <p>{user.email}</p>
          {user.phone ? <p>{user.phone}</p> : null}
        </CardContent>
      </Card>
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/account/orders"
          className="rounded-lg border p-4 font-medium transition-shadow hover:shadow-md"
        >
          {t("orders.myOrders")}
        </Link>
        <Link
          href="/wishlist"
          className="rounded-lg border p-4 font-medium transition-shadow hover:shadow-md"
        >
          {t("wishlist.title")}
        </Link>
      </div>
      <Link href="/" className="inline-block text-sm underline">
        {t("common.backToHome")}
      </Link>
    </main>
  );
}
