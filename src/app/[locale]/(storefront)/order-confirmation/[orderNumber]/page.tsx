import { CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { cn, formatBDT } from "@/lib/utils";
import { getPlacedOrderSummary } from "@/features/checkout/services/checkout-service";
import type { AppLocale } from "@/i18n/routing";

export const metadata: Metadata = { robots: { index: false, follow: false } };

interface ConfirmationPageProps {
  readonly params: Promise<{ orderNumber: string }>;
}

export default async function OrderConfirmationPage({
  params,
}: ConfirmationPageProps): Promise<React.ReactElement> {
  const { orderNumber } = await params;
  const summary = await getPlacedOrderSummary(orderNumber);
  if (!summary) notFound();

  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations();

  return (
    <main className="mx-auto w-full max-w-lg space-y-6 px-4 py-16 text-center">
      <CheckCircle2 className="mx-auto size-14 text-green-600" />
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">{t("checkout.thankYou")}</h1>
        <p className="text-muted-foreground">{t("checkout.orderPlacedHint")}</p>
      </div>
      <Card>
        <CardContent className="space-y-2 p-6 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("orders.orderNumber")}</span>
            <span className="font-mono font-medium">{summary.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("checkout.total")}</span>
            <span className="font-bold">{formatBDT(summary.totalPoisha, locale)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("checkout.paymentMethod")}</span>
            <span>{t(`checkout.method.${summary.paymentMethod}`)}</span>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-center gap-3">
        <Link
          href={`/order-tracking?order=${summary.orderNumber}`}
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          {t("orders.trackOrder")}
        </Link>
        <Link href="/products" className={cn(buttonVariants())}>
          {t("home.shopNow")}
        </Link>
      </div>
    </main>
  );
}
