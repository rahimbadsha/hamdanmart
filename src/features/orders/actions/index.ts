"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { toActionFailure, type ActionResult } from "@/lib/action-result";
import { ValidationError } from "@/lib/errors";

import { cancelOrder } from "../services/order-service";

const cancelSchema = z.object({
  orderNumber: z.string().trim().min(1),
  reason: z.string().trim().max(500).optional(),
  phone: z.string().trim().optional(),
});

export async function cancelOrderAction(input: unknown): Promise<ActionResult> {
  try {
    const parsed = cancelSchema.safeParse(input);
    if (!parsed.success) throw new ValidationError("errors.invalidInput");
    await cancelOrder(
      parsed.data.orderNumber,
      parsed.data.reason ?? "Cancelled by customer",
      parsed.data.phone,
    );
    revalidatePath("/", "layout");
    return undefined;
  } catch (error) {
    return toActionFailure(error);
  }
}
