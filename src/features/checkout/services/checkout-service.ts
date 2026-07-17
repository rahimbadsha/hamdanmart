import "server-only";

import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { ConflictError, ValidationError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { enforceRateLimit } from "@/lib/rate-limit";
import type { Address, ShippingMethod } from "@/generated/prisma/client";

import {
  clearGuestCartCookie,
  computeTotals,
  getCart,
} from "@/features/cart/services/cart-service";
import type { CartWithItems } from "@/features/cart/repositories/cart-repository";
import { validateCoupon } from "@/features/coupons/services/coupon-service";
import {
  getAvailablePaymentMethods,
  getComingSoonPaymentMethods,
  getPaymentProvider,
} from "@/features/payments/providers";
import { countOrdersSince } from "@/features/orders/repositories/order-repository";

import * as addresses from "../repositories/address-repository";
import { findShippingMethodById } from "../repositories/shipping-repository";
import { findActiveShippingMethods } from "../repositories/shipping-repository";
import type { CheckoutInput } from "../schemas";

/**
 * Checkout orchestration.
 *
 * placeOrder() is the atomic heart: a single transaction re-checks and
 * decrements stock, snapshots prices/names/address onto the order, records
 * payment + coupon usage + invoice + status history, and clears the cart.
 * Everything commits together or not at all — no oversell, no orphan orders.
 */

export interface CheckoutData {
  readonly cart: CartWithItems;
  readonly shippingMethods: readonly ShippingMethod[];
  readonly availablePayments: ReturnType<typeof getAvailablePaymentMethods>;
  readonly comingSoonPayments: ReturnType<typeof getComingSoonPaymentMethods>;
  readonly subtotalPoisha: number;
  readonly prefill: Address | null;
}

/** Loads everything the checkout page needs, or null when the cart is empty. */
export async function getCheckoutData(): Promise<CheckoutData | null> {
  const cart = await getCart();
  if (!cart || cart.items.length === 0) return null;

  const user = await getCurrentUser();
  const [shippingMethods, prefill] = await Promise.all([
    findActiveShippingMethods(),
    user ? addresses.findDefaultAddress(user.id) : Promise.resolve(null),
  ]);
  const { subtotalPoisha } = computeTotals(cart);

  return {
    cart,
    shippingMethods,
    availablePayments: getAvailablePaymentMethods(),
    comingSoonPayments: getComingSoonPaymentMethods(),
    subtotalPoisha,
    prefill,
  };
}

function startOfToday(): Date {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

function buildNumber(prefix: string, sequence: number): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${prefix}-${yy}${mm}${dd}-${String(sequence).padStart(4, "0")}`;
}

export interface PlaceOrderResult {
  readonly orderNumber: string;
  readonly redirectUrl?: string;
}

export async function placeOrder(input: CheckoutInput): Promise<PlaceOrderResult> {
  enforceRateLimit({
    key: `checkout:${input.customerPhone}`,
    limit: 5,
    windowMs: 60_000,
  });

  const cart = await getCart();
  if (!cart || cart.items.length === 0) {
    throw new ValidationError("errors.cartEmpty");
  }

  const shipping = await findShippingMethodById(input.shippingMethodId);
  if (!shipping) throw new ValidationError("errors.shippingInvalid");

  const provider = getPaymentProvider(input.paymentMethod);
  if (!provider.available) throw new ValidationError("errors.paymentUnavailable");

  const { subtotalPoisha } = computeTotals(cart);

  // Validate coupon (if any) against the current subtotal before committing.
  const applied = input.couponCode
    ? await validateCoupon(input.couponCode, subtotalPoisha)
    : null;
  const discountPoisha = applied?.discountPoisha ?? 0;
  const totalPoisha = subtotalPoisha - discountPoisha + shipping.feePoisha;

  const user = await getCurrentUser();
  const isGuestCart = cart.userId === null;

  const orderNumber = await db.$transaction(async (tx) => {
    // Re-check and decrement stock atomically. The conditional updateMany
    // only succeeds when enough stock remains, preventing oversell.
    for (const item of cart.items) {
      const result = await tx.inventory.updateMany({
        where: { variantId: item.variantId, quantity: { gte: item.quantity } },
        data: { quantity: { decrement: item.quantity } },
      });
      if (result.count !== 1) {
        throw new ConflictError("errors.outOfStock");
      }
    }

    const daySequence = (await countOrdersSince(tx, startOfToday())) + 1;
    const number = buildNumber("HM", daySequence);

    const order = await tx.order.create({
      data: {
        orderNumber: number,
        userId: user?.id ?? null,
        status: "PENDING",
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerEmail: input.customerEmail ?? null,
        shippingLine1: input.shippingLine1,
        shippingLine2: input.shippingLine2 ?? null,
        shippingCity: input.shippingCity,
        shippingDistrict: input.shippingDistrict,
        shippingPostalCode: input.shippingPostalCode ?? null,
        shippingMethodId: shipping.id,
        subtotalPoisha,
        shippingFeePoisha: shipping.feePoisha,
        discountPoisha,
        totalPoisha,
        couponId: applied?.coupon.id ?? null,
        customerNote: input.customerNote ?? null,
        items: {
          create: cart.items.map((item) => ({
            productId: item.variant.productId,
            variantId: item.variantId,
            nameEn: item.variant.product.nameEn,
            nameBn: item.variant.product.nameBn,
            variantNameEn: item.variant.nameEn,
            variantNameBn: item.variant.nameBn,
            sku: item.variant.sku,
            unitPricePoisha: item.variant.pricePoisha,
            quantity: item.quantity,
            totalPoisha: item.variant.pricePoisha * item.quantity,
          })),
        },
        statusHistory: {
          create: { fromStatus: null, toStatus: "PENDING", note: "Order placed" },
        },
      },
    });

    const init = await provider.initiate({
      orderNumber: number,
      amountPoisha: totalPoisha,
    });

    await tx.payment.create({
      data: {
        orderId: order.id,
        method: provider.method,
        status: init.initialStatus,
        amountPoisha: totalPoisha,
        paidAt: init.initialStatus === "PAID" ? new Date() : null,
      },
    });

    if (applied) {
      await tx.couponUsage.create({
        data: {
          couponId: applied.coupon.id,
          userId: user?.id ?? null,
          orderId: order.id,
        },
      });
    }

    await tx.invoice.create({
      data: {
        orderId: order.id,
        invoiceNumber: buildNumber("INV", daySequence),
        totalPoisha,
      },
    });

    // Empty the cart (deleting items keeps the cart row for logged-in users).
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    if (isGuestCart) {
      await tx.cart.delete({ where: { id: cart.id } });
    }

    return number;
  });

  // Post-commit side effects (cookies, address book) run outside the tx.
  if (isGuestCart) {
    await clearGuestCartCookie();
  }
  if (user && input.saveAddress) {
    await addresses
      .createAddress({
        userId: user.id,
        recipientName: input.customerName,
        phone: input.customerPhone,
        line1: input.shippingLine1,
        line2: input.shippingLine2 ?? null,
        city: input.shippingCity,
        district: input.shippingDistrict,
        postalCode: input.shippingPostalCode ?? null,
      })
      .catch((error) => logger.warn({ err: error }, "failed to save address"));
  }

  logger.info({ orderNumber, totalPoisha }, "order placed");
  return { orderNumber };
}

/** Confirmation lookup — only exposes non-sensitive summary fields. */
export async function getPlacedOrderSummary(orderNumber: string): Promise<{
  orderNumber: string;
  totalPoisha: number;
  paymentMethod: string;
  customerName: string;
} | null> {
  const order = await db.order.findUnique({
    where: { orderNumber },
    include: { payments: true },
  });
  if (!order) return null;
  return {
    orderNumber: order.orderNumber,
    totalPoisha: order.totalPoisha,
    paymentMethod: order.payments[0]?.method ?? "COD",
    customerName: order.customerName,
  };
}

export async function getActiveShippingMethods(): Promise<ShippingMethod[]> {
  return findActiveShippingMethods();
}
