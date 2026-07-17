"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { toActionFailure, type ActionFailure } from "@/lib/action-result";
import { UnauthorizedError, ValidationError } from "@/lib/errors";

import * as wishlistService from "../services/wishlist-service";

export type ToggleWishlistResult =
  | { readonly ok: true; readonly wishlisted: boolean }
  | ActionFailure
  | {
      readonly ok: false;
      readonly error: "errors.loginRequired";
      readonly loginRequired: true;
    };

export async function toggleWishlistAction(
  input: unknown,
): Promise<ToggleWishlistResult> {
  try {
    const parsed = z.object({ productId: z.string().min(1) }).safeParse(input);
    if (!parsed.success) throw new ValidationError("errors.invalidInput");
    const wishlisted = await wishlistService.toggleProduct(parsed.data.productId);
    revalidatePath("/", "layout");
    return { ok: true, wishlisted };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return { ok: false, error: "errors.loginRequired", loginRequired: true };
    }
    return toActionFailure(error);
  }
}
