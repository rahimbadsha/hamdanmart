import "server-only";

import { db } from "@/lib/db";
import type { Coupon } from "@/generated/prisma/client";

export async function findActiveCouponByCode(code: string): Promise<Coupon | null> {
  return db.coupon.findFirst({
    where: { code, isActive: true, deletedAt: null },
  });
}

export async function countCouponUsages(couponId: string): Promise<number> {
  return db.couponUsage.count({ where: { couponId } });
}

export async function countCouponUsagesByUser(
  couponId: string,
  userId: string,
): Promise<number> {
  return db.couponUsage.count({ where: { couponId, userId } });
}
