"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { toActionFailure, type ActionResult } from "@/lib/action-result";
import { ValidationError } from "@/lib/errors";

import * as cartService from "../services/cart-service";

const addSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).max(cartService.MAX_QTY_PER_ITEM),
});

const updateSchema = z.object({
  itemId: z.string().min(1),
  quantity: z.number().int().min(0).max(cartService.MAX_QTY_PER_ITEM),
});

function revalidateStorefront(): void {
  // Cart badge lives in the storefront layout — refresh the whole tree.
  revalidatePath("/", "layout");
}

export async function addToCartAction(input: unknown): Promise<ActionResult> {
  try {
    const parsed = addSchema.safeParse(input);
    if (!parsed.success) throw new ValidationError("errors.invalidInput");
    await cartService.addItem(parsed.data.variantId, parsed.data.quantity);
    revalidateStorefront();
    return undefined;
  } catch (error) {
    return toActionFailure(error);
  }
}

export async function updateCartItemAction(input: unknown): Promise<ActionResult> {
  try {
    const parsed = updateSchema.safeParse(input);
    if (!parsed.success) throw new ValidationError("errors.invalidInput");
    await cartService.updateItemQuantity(parsed.data.itemId, parsed.data.quantity);
    revalidateStorefront();
    return undefined;
  } catch (error) {
    return toActionFailure(error);
  }
}

export async function removeCartItemAction(input: unknown): Promise<ActionResult> {
  try {
    const parsed = z.object({ itemId: z.string().min(1) }).safeParse(input);
    if (!parsed.success) throw new ValidationError("errors.invalidInput");
    await cartService.removeItem(parsed.data.itemId);
    revalidateStorefront();
    return undefined;
  } catch (error) {
    return toActionFailure(error);
  }
}
