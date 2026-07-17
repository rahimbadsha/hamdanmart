"use server";

import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";

import { redirect } from "@/i18n/navigation";
import { toActionFailure, type ActionResult } from "@/lib/action-result";
import { ValidationError } from "@/lib/errors";

import { checkoutSchema } from "../schemas";
import { placeOrder } from "../services/checkout-service";

export async function placeOrderAction(input: unknown): Promise<ActionResult> {
  let orderNumber: string;
  try {
    const parsed = checkoutSchema.safeParse(input);
    if (!parsed.success) throw new ValidationError("errors.invalidInput");
    const result = await placeOrder(parsed.data);
    orderNumber = result.orderNumber;
  } catch (error) {
    return toActionFailure(error);
  }
  revalidatePath("/", "layout");
  redirect({ href: `/order-confirmation/${orderNumber}`, locale: await getLocale() });
}
