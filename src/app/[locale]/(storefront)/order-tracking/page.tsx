import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppError } from "@/lib/errors";
import { OrderDetailView } from "@/features/orders/components/order-detail-view";
import { TrackingForm } from "@/features/orders/components/tracking-form";
import { trackOrder } from "@/features/orders/services/order-service";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("orders");
  return { title: t("trackOrder") };
}

interface TrackingPageProps {
  readonly searchParams: Promise<{ order?: string; phone?: string }>;
}

export default async function OrderTrackingPage({
  searchParams,
}: TrackingPageProps): Promise<React.ReactElement> {
  const { order, phone } = await searchParams;
  const t = await getTranslations("orders");

  let tracked = null;
  let error: string | null = null;
  if (order && phone) {
    try {
      tracked = await trackOrder(order, phone);
    } catch (err) {
      error = err instanceof AppError ? err.message : "errors.generic";
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6">
      <h1 className="text-2xl font-bold">{t("trackOrder")}</h1>

      {tracked ? (
        <OrderDetailView order={tracked} cancelPhone={phone} />
      ) : (
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle>{t("trackTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error ? (
              <p
                role="alert"
                className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
              >
                {(await getTranslations())(error)}
              </p>
            ) : null}
            <TrackingForm defaultOrderNumber={order} />
          </CardContent>
        </Card>
      )}
    </main>
  );
}
