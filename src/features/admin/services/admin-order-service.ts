import "server-only";

import { requirePermission } from "@/lib/auth/guards";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/constants";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { orderStatusUpdateEmail } from "@/lib/email/templates";
import { ConflictError, NotFoundError, ValidationError } from "@/lib/errors";
import { logger } from "@/lib/logger";

import {
  findAdminOrderByNumber,
  findAdminOrders,
  type AdminOrderDetail,
  type AdminOrderRow,
} from "../repositories/admin-order-repository";
import { writeAuditLog } from "./audit-service";

export async function getAdminOrders(params: {
  status?: string;
  search?: string;
  page?: number;
}): Promise<{ orders: AdminOrderRow[]; total: number }> {
  await requirePermission("orders.read");
  return findAdminOrders(params);
}

export async function getAdminOrder(orderNumber: string): Promise<AdminOrderDetail> {
  await requirePermission("orders.read");
  const order = await findAdminOrderByNumber(orderNumber);
  if (!order) throw new NotFoundError();
  return order;
}

const ALLOWED_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
};

export async function updateOrderStatus(
  orderNumber: string,
  newStatus: OrderStatus,
  note?: string,
): Promise<void> {
  const admin = await requirePermission("orders.write");

  if (!ORDER_STATUSES.includes(newStatus)) {
    throw new ValidationError("Invalid status");
  }

  const order = await findAdminOrderByNumber(orderNumber);
  if (!order) throw new NotFoundError();

  const allowed = ALLOWED_TRANSITIONS[order.status as OrderStatus];
  if (!allowed || !allowed.includes(newStatus)) {
    throw new ConflictError(`Cannot transition from ${order.status} to ${newStatus}`);
  }

  await db.$transaction(async (tx) => {
    const updateData: Record<string, unknown> = { status: newStatus };
    if (newStatus === "CANCELLED") {
      updateData.cancelledAt = new Date();
      updateData.cancelReason = note ?? "Cancelled by admin";
      for (const item of order.items) {
        if (item.variantId) {
          await tx.inventory.updateMany({
            where: { variantId: item.variantId },
            data: { quantity: { increment: item.quantity } },
          });
        }
      }
    }
    if (newStatus === "DELIVERED") {
      updateData.deliveredAt = new Date();
      const pendingPayment = order.payments.find(
        (p) => p.status === "PENDING" && p.method === "COD",
      );
      if (pendingPayment) {
        await tx.payment.update({
          where: { id: pendingPayment.id },
          data: { status: "PAID", paidAt: new Date() },
        });
      }
    }

    await tx.order.update({
      where: { id: order.id },
      data: updateData,
    });
    await tx.orderStatusHistory.create({
      data: {
        orderId: order.id,
        fromStatus: order.status,
        toStatus: newStatus,
        note: note ?? `Status updated by admin`,
      },
    });
  });

  await writeAuditLog({
    adminUserId: admin.id,
    action: "order.status_change",
    entityType: "Order",
    entityId: order.id,
    before: { status: order.status },
    after: { status: newStatus, note },
  });

  if (order.customerEmail) {
    sendEmail(
      orderStatusUpdateEmail(order.customerEmail, {
        orderNumber,
        customerName: order.customerName,
        newStatus,
      }),
    ).catch((err) => logger.warn({ err }, "failed to send status update email"));
  }

  logger.info(
    { orderNumber, from: order.status, to: newStatus },
    "admin updated order status",
  );
}
