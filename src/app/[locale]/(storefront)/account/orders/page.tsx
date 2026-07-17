import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, redirect } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { getMyOrders } from "@/features/orders/services/order-service";
import type { AppLocale } from "@/i18n/routing";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("orders");
  return { title: t("myOrders") };
}

export default async function MyOrdersPage(): Promise<React.ReactElement> {
  const locale = (await getLocale()) as AppLocale;
  const user = await getCurrentUser();
  if (!user) {
    redirect({ href: "/login", locale });
    return <></>; // unreachable — redirect() throws
  }

  const t = await getTranslations();
  const orders = await getMyOrders();

  return (
    <main className="mx-auto w-full max-w-3xl space-y-4 px-4 py-6">
      <h1 className="text-2xl font-bold">{t("orders.myOrders")}</h1>
      {orders.length === 0 ? (
        <div className="space-y-4 py-16 text-center">
          <p className="text-muted-foreground">{t("orders.noOrders")}</p>
          <Link href="/products" className={cn(buttonVariants())}>
            {t("home.shopNow")}
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Link href={`/account/orders/${order.orderNumber}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center justify-between gap-3 p-4">
                    <div>
                      <p className="font-mono font-medium">{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(order.createdAt, locale)} ·{" "}
                        {t("cart.itemCount", {
                          count: order.items.reduce(
                            (sum, item) => sum + item.quantity,
                            0,
                          ),
                        })}
                      </p>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
