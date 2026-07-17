import "server-only";

import { requireUser } from "@/lib/auth/guards";
import { getCurrentUser } from "@/lib/auth/session";
import { CANCELLABLE_ORDER_STATUSES, type OrderStatus } from "@/lib/constants";
import { db } from "@/lib/db";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { logger } from "@/lib/logger";

import {
  findOrderByNumber,
  findOrdersByUser,
  type OrderDetail,
  type OrderSummary,
} from "../repositories/order-repository";

/**
 * Order read + lifecycle operations.
 *
 * Access control is explicit on every path (IDOR): account views require the
 * order's userId to match the caller; guest access requires the order number
 * AND the matching phone number.
 */

export async function getMyOrders(): Promise<OrderSummary[]> {
  const user = await requireUser();
  return findOrdersByUser(user.id);
}

/** Order detail for the logged-in owner. */
export async function getMyOrder(orderNumber: string): Promise<OrderDetail> {
  const user = await requireUser();
  const order = await findOrderByNumber(orderNumber);
  if (!order || order.userId !== user.id) throw new NotFoundError("errors.orderNotFound");
  return order;
}

/** Public tracking — requires both the order number and the phone on file. */
export async function trackOrder(
  orderNumber: string,
  phone: string,
): Promise<OrderDetail> {
  const order = await findOrderByNumber(orderNumber.trim());
  if (!order || order.customerPhone !== phone.trim()) {
    throw new NotFoundError("errors.orderNotFound");
  }
  return order;
}

async function authorizeCancel(
  orderNumber: string,
  phone: string | undefined,
): Promise<OrderDetail> {
  const order = await findOrderByNumber(orderNumber.trim());
  if (!order) throw new NotFoundError("errors.orderNotFound");

  const user = await getCurrentUser();
  const ownedByUser = user && order.userId === user.id;
  const matchedByPhone = phone && order.customerPhone === phone.trim();
  if (!ownedByUser && !matchedByPhone) {
    throw new NotFoundError("errors.orderNotFound");
  }
  return order;
}

/**
 * Cancels an order and restocks its items. Allowed for the owner (logged in)
 * or a guest supplying the matching phone, and only while the order is still
 * in a cancellable status.
 */
export async function cancelOrder(
  orderNumber: string,
  reason: string,
  phone?: string,
): Promise<void> {
  const order = await authorizeCancel(orderNumber, phone);

  if (!CANCELLABLE_ORDER_STATUSES.includes(order.status as OrderStatus)) {
    throw new ConflictError("errors.orderNotCancellable");
  }

  await db.$transaction(async (tx) => {
    for (const item of order.items) {
      if (item.variantId) {
        await tx.inventory.updateMany({
          where: { variantId: item.variantId },
          data: { quantity: { increment: item.quantity } },
        });
      }
    }
    await tx.order.update({
      where: { id: order.id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        cancelReason: reason.slice(0, 500),
      },
    });
    await tx.orderStatusHistory.create({
      data: {
        orderId: order.id,
        fromStatus: order.status,
        toStatus: "CANCELLED",
        note: "Cancelled by customer",
      },
    });
  });

  logger.info({ orderNumber }, "order cancelled by customer");
}
