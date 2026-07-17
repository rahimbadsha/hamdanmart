import "server-only";

import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

const orderDetailInclude = {
  items: { orderBy: { id: "asc" as const } },
  statusHistory: { orderBy: { createdAt: "asc" as const } },
  payments: { orderBy: { createdAt: "asc" as const } },
  shippingMethod: true,
  invoice: true,
} satisfies Prisma.OrderInclude;

export type OrderDetail = Prisma.OrderGetPayload<{
  include: typeof orderDetailInclude;
}>;

const orderSummaryInclude = {
  items: { select: { id: true, nameEn: true, nameBn: true, quantity: true } },
} satisfies Prisma.OrderInclude;

export type OrderSummary = Prisma.OrderGetPayload<{
  include: typeof orderSummaryInclude;
}>;

export async function findOrderByNumber(
  orderNumber: string,
): Promise<OrderDetail | null> {
  return db.order.findUnique({
    where: { orderNumber },
    include: orderDetailInclude,
  });
}

export async function findOrdersByUser(userId: string): Promise<OrderSummary[]> {
  return db.order.findMany({
    where: { userId },
    include: orderSummaryInclude,
    orderBy: { createdAt: "desc" },
  });
}

/** Number of orders created since the start of the given day (for numbering). */
export async function countOrdersSince(
  tx: Prisma.TransactionClient,
  since: Date,
): Promise<number> {
  return tx.order.count({ where: { createdAt: { gte: since } } });
}
