import { getLocale, getTranslations } from "next-intl/server";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { CANCELLABLE_ORDER_STATUSES, type OrderStatus } from "@/lib/constants";
import { cn, formatBDT } from "@/lib/utils";
import type { AppLocale } from "@/i18n/routing";

import type { OrderDetail } from "../repositories/order-repository";
import { CancelOrderButton } from "./cancel-order-button";
import { OrderStatusBadge } from "./order-status-badge";
import { OrderTimeline } from "./order-timeline";
import { OrderTotals } from "./order-totals";

interface OrderDetailViewProps {
  readonly order: OrderDetail;
  /** Passed for guest cancellation from the tracking page. */
  readonly cancelPhone?: string;
}

export async function OrderDetailView({
  order,
  cancelPhone,
}: OrderDetailViewProps): Promise<React.ReactElement> {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations();
  const canCancel = CANCELLABLE_ORDER_STATUSES.includes(order.status as OrderStatus);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-mono text-xl font-bold">{order.orderNumber}</h1>
          <div className="mt-1 flex items-center gap-2">
            <OrderStatusBadge status={order.status} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {order.invoice ? (
            <Link
              href={`/invoice/${order.orderNumber}${cancelPhone ? `?phone=${encodeURIComponent(cancelPhone)}` : ""}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              {t("orders.invoice")}
            </Link>
          ) : null}
          {canCancel ? (
            <CancelOrderButton orderNumber={order.orderNumber} phone={cancelPhone} />
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("orders.items")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-2 py-2 text-sm">
                    <span className="min-w-0">
                      <span className="line-clamp-1">
                        {locale === "bn" ? item.nameBn : item.nameEn}
                      </span>
                      <span className="text-muted-foreground">
                        {locale === "bn" ? item.variantNameBn : item.variantNameEn} ×{" "}
                        {item.quantity}
                      </span>
                    </span>
                    <span className="shrink-0">
                      {formatBDT(item.totalPoisha, locale)}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("checkout.shippingAddress")}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p className="text-foreground">{order.customerName}</p>
              <p>{order.customerPhone}</p>
              <p className="mt-1">
                {order.shippingLine1}
                {order.shippingLine2 ? `, ${order.shippingLine2}` : ""}
              </p>
              <p>
                {order.shippingCity}, {order.shippingDistrict}
                {order.shippingPostalCode ? ` - ${order.shippingPostalCode}` : ""}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("checkout.orderSummary")}</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTotals
                subtotalPoisha={order.subtotalPoisha}
                shippingFeePoisha={order.shippingFeePoisha}
                discountPoisha={order.discountPoisha}
                totalPoisha={order.totalPoisha}
              />
              <p className="mt-3 text-sm text-muted-foreground">
                {t("checkout.paymentMethod")}:{" "}
                {t(`checkout.method.${order.payments[0]?.method ?? "COD"}`)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("orders.tracking")}</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTimeline history={order.statusHistory} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
