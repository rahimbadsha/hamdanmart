"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { toActionFailure, type ActionResult } from "@/lib/action-result";
import { ValidationError } from "@/lib/errors";

import {
  toggleProductActive,
  updateInventoryQuantity,
  updateVariantPrice,
} from "../services/admin-product-service";

const toggleSchema = z.object({
  productId: z.string().min(1),
  isActive: z.boolean(),
});

export async function adminToggleProductAction(input: unknown): Promise<ActionResult> {
  try {
    const parsed = toggleSchema.safeParse(input);
    if (!parsed.success) throw new ValidationError("Invalid input");
    await toggleProductActive(parsed.data.productId, parsed.data.isActive);
    revalidatePath("/admin", "layout");
    return undefined;
  } catch (error) {
    return toActionFailure(error);
  }
}

const priceSchema = z.object({
  variantId: z.string().min(1),
  pricePoisha: z.number().int().positive(),
  compareAtPricePoisha: z.number().int().positive().nullable(),
});

export async function adminUpdateVariantPriceAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    const parsed = priceSchema.safeParse(input);
    if (!parsed.success) throw new ValidationError("Invalid input");
    await updateVariantPrice(
      parsed.data.variantId,
      parsed.data.pricePoisha,
      parsed.data.compareAtPricePoisha,
    );
    revalidatePath("/admin", "layout");
    return undefined;
  } catch (error) {
    return toActionFailure(error);
  }
}

const inventorySchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().min(0),
});

export async function adminUpdateInventoryAction(input: unknown): Promise<ActionResult> {
  try {
    const parsed = inventorySchema.safeParse(input);
    if (!parsed.success) throw new ValidationError("Invalid input");
    await updateInventoryQuantity(parsed.data.variantId, parsed.data.quantity);
    revalidatePath("/admin", "layout");
    return undefined;
  } catch (error) {
    return toActionFailure(error);
  }
}
