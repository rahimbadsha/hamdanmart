import "server-only";

import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

const orderListSelect = {
  id: true,
  orderNumber: true,
  status: true,
  customerName: true,
  customerPhone: true,
  totalPoisha: true,
  createdAt: true,
  _count: { select: { items: true } },
} satisfies Prisma.OrderSelect;

export type AdminOrderRow = Prisma.OrderGetPayload<{
  select: typeof orderListSelect;
}>;

const orderDetailInclude = {
  items: { orderBy: { id: "asc" as const } },
  statusHistory: { orderBy: { createdAt: "asc" as const } },
  payments: { orderBy: { createdAt: "asc" as const } },
  shippingMethod: true,
  invoice: true,
  coupon: true,
} satisfies Prisma.OrderInclude;

export type AdminOrderDetail = Prisma.OrderGetPayload<{
  include: typeof orderDetailInclude;
}>;

interface AdminOrderListParams {
  status?: string;
  search?: string;
  page?: number;
  perPage?: number;
}

export async function findAdminOrders(
  params: AdminOrderListParams,
): Promise<{ orders: AdminOrderRow[]; total: number }> {
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 20;
  const where: Prisma.OrderWhereInput = {};

  if (params.status) where.status = params.status;
  if (params.search) {
    where.OR = [
      { orderNumber: { contains: params.search } },
      { customerName: { contains: params.search } },
      { customerPhone: { contains: params.search } },
    ];
  }

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      select: orderListSelect,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    db.order.count({ where }),
  ]);

  return { orders, total };
}

export async function findAdminOrderByNumber(
  orderNumber: string,
): Promise<AdminOrderDetail | null> {
  return db.order.findUnique({
    where: { orderNumber },
    include: orderDetailInclude,
  });
}
