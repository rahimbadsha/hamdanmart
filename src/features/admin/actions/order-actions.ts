"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { toActionFailure, type ActionResult } from "@/lib/action-result";
import { ORDER_STATUSES } from "@/lib/constants";
import { ValidationError } from "@/lib/errors";

import { updateOrderStatus } from "../services/admin-order-service";

const schema = z.object({
  orderNumber: z.string().min(1),
  status: z.enum(ORDER_STATUSES),
  note: z.string().max(500).optional(),
});

export async function adminUpdateOrderStatusAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    const parsed = schema.safeParse(input);
    if (!parsed.success) throw new ValidationError("Invalid input");
    await updateOrderStatus(
      parsed.data.orderNumber,
      parsed.data.status,
      parsed.data.note,
    );
    revalidatePath("/admin", "layout");
    return undefined;
  } catch (error) {
    return toActionFailure(error);
  }
}
