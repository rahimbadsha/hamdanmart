import "server-only";

import { getCurrentUser } from "@/lib/auth/session";
import type { CouponType } from "@/lib/constants";
import { ValidationError } from "@/lib/errors";
import type { Coupon } from "@/generated/prisma/client";

import * as coupons from "../repositories/coupon-repository";

/**
 * Coupon validation and discount calculation.
 *
 * All checks run on the server — the client never supplies a discount amount.
 * Usage limits are re-checked inside the checkout transaction to close the
 * race between validation and order placement.
 */

export interface AppliedCoupon {
  readonly coupon: Coupon;
  readonly discountPoisha: number;
}

function computeDiscount(
  type: CouponType,
  value: number,
  subtotalPoisha: number,
  maxDiscountPoisha: number | null,
): number {
  if (type === "PERCENT") {
    const raw = Math.floor((subtotalPoisha * value) / 100);
    const capped = maxDiscountPoisha ? Math.min(raw, maxDiscountPoisha) : raw;
    return Math.min(capped, subtotalPoisha);
  }
  // FIXED: value is poisha, never more than the subtotal.
  return Math.min(value, subtotalPoisha);
}

/**
 * Validates a coupon against the current subtotal and returns the discount.
 * Throws ValidationError (with an i18n key) when the coupon cannot be used.
 */
export async function validateCoupon(
  code: string,
  subtotalPoisha: number,
): Promise<AppliedCoupon> {
  const coupon = await coupons.findActiveCouponByCode(code.trim().toUpperCase());
  if (!coupon) throw new ValidationError("errors.couponInvalid");

  const now = new Date();
  if (coupon.startsAt > now) throw new ValidationError("errors.couponInvalid");
  if (coupon.endsAt && coupon.endsAt < now) {
    throw new ValidationError("errors.couponExpired");
  }
  if (coupon.minOrderPoisha && subtotalPoisha < coupon.minOrderPoisha) {
    throw new ValidationError("errors.couponMinOrder");
  }
  if (coupon.usageLimit !== null) {
    const used = await coupons.countCouponUsages(coupon.id);
    if (used >= coupon.usageLimit) throw new ValidationError("errors.couponUsedUp");
  }
  if (coupon.perUserLimit !== null) {
    const user = await getCurrentUser();
    if (user) {
      const usedByUser = await coupons.countCouponUsagesByUser(coupon.id, user.id);
      if (usedByUser >= coupon.perUserLimit) {
        throw new ValidationError("errors.couponUsedUp");
      }
    }
  }

  const discountPoisha = computeDiscount(
    coupon.type as CouponType,
    coupon.value,
    subtotalPoisha,
    coupon.maxDiscountPoisha,
  );
  return { coupon, discountPoisha };
}
