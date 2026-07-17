import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

import { getCurrentUser } from "@/lib/auth/session";
import { AppError } from "@/lib/errors";
import { formatBDT, formatDate } from "@/lib/utils";
import { PrintButton } from "@/features/orders/components/print-button";
import type { OrderDetail } from "@/features/orders/repositories/order-repository";
import { getMyOrder, trackOrder } from "@/features/orders/services/order-service";
import type { AppLocale } from "@/i18n/routing";

export const metadata: Metadata = { robots: { index: false, follow: false } };

interface InvoicePageProps {
  readonly params: Promise<{ orderNumber: string }>;
  readonly searchParams: Promise<{ phone?: string }>;
}

/** Resolves the order for the logged-in owner, or a guest with the phone. */
async function resolveOrder(
  orderNumber: string,
  phone: string | undefined,
): Promise<OrderDetail | null> {
  const user = await getCurrentUser();
  if (user) {
    try {
      return await getMyOrder(orderNumber);
    } catch (error) {
      if (!(error instanceof AppError)) throw error;
    }
  }
  if (phone) {
    try {
      return await trackOrder(orderNumber, phone);
    } catch (error) {
      if (!(error instanceof AppError)) throw error;
    }
  }
  return null;
}

export default async function InvoicePage({
  params,
  searchParams,
}: InvoicePageProps): Promise<React.ReactElement> {
  const { orderNumber } = await params;
  const { phone } = await searchParams;
  const order = await resolveOrder(orderNumber, phone);
  if (!order) notFound();

  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations();

  return (
    <main className="mx-auto w-full max-w-2xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between print:hidden">
        <h1 className="text-2xl font-bold">{t("orders.invoice")}</h1>
        <PrintButton />
      </div>

      <div className="space-y-6 rounded-lg border p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-lg font-bold">{t("common.appName")}</p>
            <p className="text-sm text-muted-foreground">{t("footer.tagline")}</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-mono font-medium">{order.invoice?.invoiceNumber}</p>
            <p className="text-muted-foreground">
              {order.invoice ? formatDate(order.invoice.issuedAt, locale) : ""}
            </p>
          </div>
        </div>

        <div className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <p className="font-medium">{t("orders.billTo")}</p>
            <p className="text-muted-foreground">{order.customerName}</p>
            <p className="text-muted-foreground">{order.customerPhone}</p>
            <p className="text-muted-foreground">
              {order.shippingLine1}
              {order.shippingLine2 ? `, ${order.shippingLine2}` : ""},{" "}
              {order.shippingCity}, {order.shippingDistrict}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="font-medium">{t("orders.orderNumber")}</p>
            <p className="font-mono text-muted-foreground">{order.orderNumber}</p>
            <p className="mt-1 font-medium">{t("checkout.paymentMethod")}</p>
            <p className="text-muted-foreground">
              {t(`checkout.method.${order.payments[0]?.method ?? "COD"}`)}
            </p>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2">{t("orders.item")}</th>
              <th className="py-2 text-center">{t("orders.qty")}</th>
              <th className="py-2 text-right">{t("orders.price")}</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="py-2">
                  {locale === "bn" ? item.nameBn : item.nameEn}
                  <span className="text-muted-foreground">
                    {" "}
                    ({locale === "bn" ? item.variantNameBn : item.variantNameEn})
                  </span>
                </td>
                <td className="py-2 text-center">{item.quantity}</td>
                <td className="py-2 text-right">{formatBDT(item.totalPoisha, locale)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="ml-auto max-w-xs space-y-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">{t("cart.subtotal")}</dt>
            <dd>{formatBDT(order.subtotalPoisha, locale)}</dd>
          </div>
          {order.discountPoisha > 0 ? (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t("checkout.discount")}</dt>
              <dd>−{formatBDT(order.discountPoisha, locale)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between">
            <dt className="text-muted-foreground">{t("checkout.shipping")}</dt>
            <dd>{formatBDT(order.shippingFeePoisha, locale)}</dd>
          </div>
          <div className="flex justify-between border-t pt-1.5 font-bold">
            <dt>{t("checkout.total")}</dt>
            <dd>{formatBDT(order.totalPoisha, locale)}</dd>
          </div>
        </dl>
      </div>
    </main>
  );
}
