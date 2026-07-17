"use server";

import { z } from "zod";

import { toActionFailure } from "@/lib/action-result";
import { ValidationError } from "@/lib/errors";

import { validateCoupon } from "../services/coupon-service";

const applySchema = z.object({
  code: z.string().trim().min(1).max(40),
  subtotalPoisha: z.number().int().positive(),
});

export type ApplyCouponResult =
  | { readonly ok: true; readonly code: string; readonly discountPoisha: number }
  | { readonly ok: false; readonly error: string };

/**
 * Validates a coupon for the storefront checkout UI (live preview).
 * The authoritative re-check happens again at order placement.
 */
export async function applyCouponAction(input: unknown): Promise<ApplyCouponResult> {
  try {
    const parsed = applySchema.safeParse(input);
    if (!parsed.success) throw new ValidationError("errors.invalidInput");
    const applied = await validateCoupon(parsed.data.code, parsed.data.subtotalPoisha);
    return {
      ok: true,
      code: applied.coupon.code,
      discountPoisha: applied.discountPoisha,
    };
  } catch (error) {
    return toActionFailure(error);
  }
}
