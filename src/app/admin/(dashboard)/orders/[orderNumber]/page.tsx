import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBDT, formatDateTime } from "@/lib/utils";
import { OrderStatusSelect } from "@/features/admin/components/order-status-select";
import { getAdminOrder } from "@/features/admin/services/admin-order-service";

export const metadata: Metadata = { title: "Order Detail — HamdanMart Admin" };

interface AdminOrderPageProps {
  readonly params: Promise<{ orderNumber: string }>;
}

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderPageProps): Promise<React.ReactElement> {
  const { orderNumber } = await params;
  let order;
  try {
    order = await getAdminOrder(orderNumber);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-mono text-xl font-bold">{order.orderNumber}</h1>
          <Badge
            variant={
              order.status === "CANCELLED"
                ? "destructive"
                : order.status === "DELIVERED"
                  ? "default"
                  : "secondary"
            }
            className="mt-1"
          >
            {order.status}
          </Badge>
        </div>
        <OrderStatusSelect orderNumber={order.orderNumber} currentStatus={order.status} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="font-medium">{order.customerName}</p>
            <p>{order.customerPhone}</p>
            {order.customerEmail ? <p>{order.customerEmail}</p> : null}
            <div className="mt-2 text-muted-foreground">
              <p>{order.shippingLine1}</p>
              {order.shippingLine2 ? <p>{order.shippingLine2}</p> : null}
              <p>
                {order.shippingCity}, {order.shippingDistrict}
                {order.shippingPostalCode ? ` - ${order.shippingPostalCode}` : ""}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatBDT(order.subtotalPoisha)}</span>
            </div>
            {order.discountPoisha > 0 ? (
              <div className="flex justify-between text-green-700">
                <span>Discount{order.coupon ? ` (${order.coupon.code})` : ""}</span>
                <span>−{formatBDT(order.discountPoisha)}</span>
              </div>
            ) : null}
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Shipping ({order.shippingMethod?.nameEn})
              </span>
              <span>{formatBDT(order.shippingFeePoisha)}</span>
            </div>
            <div className="flex justify-between border-t pt-1.5 font-bold">
              <span>Total</span>
              <span>{formatBDT(order.totalPoisha)}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-muted-foreground">Payment</span>
              <span>
                {order.payments[0]?.method} ·{" "}
                <Badge variant="outline" className="text-xs">
                  {order.payments[0]?.status}
                </Badge>
              </span>
            </div>
            {order.customerNote ? (
              <p className="mt-2 rounded bg-muted p-2 text-xs">
                Note: {order.customerNote}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2">Product</th>
                <th className="py-2">SKU</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Unit Price</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-2">
                    {item.nameEn}
                    <span className="text-muted-foreground"> ({item.variantNameEn})</span>
                  </td>
                  <td className="py-2 font-mono text-xs">{item.sku}</td>
                  <td className="py-2 text-center">{item.quantity}</td>
                  <td className="py-2 text-right">{formatBDT(item.unitPricePoisha)}</td>
                  <td className="py-2 text-right font-medium">
                    {formatBDT(item.totalPoisha)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status History</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm">
            {order.statusHistory.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between border-b py-1.5 last:border-0"
              >
                <span>
                  {entry.fromStatus ?? "—"} → <strong>{entry.toStatus}</strong>
                  {entry.note ? (
                    <span className="ml-2 text-muted-foreground">({entry.note})</span>
                  ) : null}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(entry.createdAt)}
                </span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
