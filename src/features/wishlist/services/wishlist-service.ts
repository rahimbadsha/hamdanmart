import "server-only";

import { requireUser } from "@/lib/auth/guards";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";

import * as wishlists from "../repositories/wishlist-repository";
import type { WishlistWithItems } from "../repositories/wishlist-repository";

/** Wishlist requires a logged-in user (guards throw UnauthorizedError). */

export async function getWishlist(): Promise<WishlistWithItems | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return wishlists.findWishlistByUserId(user.id);
}

/** Toggles a product; returns true when the product is now wishlisted. */
export async function toggleProduct(productId: string): Promise<boolean> {
  const user = await requireUser();

  const product = await db.product.findFirst({
    where: { id: productId, isActive: true, deletedAt: null },
    select: { id: true },
  });
  if (!product) throw new NotFoundError("errors.productUnavailable");

  const wishlistId = await wishlists.ensureWishlist(user.id);
  const existing = await wishlists.findItem(wishlistId, productId);
  if (existing) {
    await wishlists.removeItem(existing.id);
    return false;
  }
  await wishlists.addItem(wishlistId, productId);
  return true;
}

/** Which of the given products are wishlisted by the current user. */
export async function wishlistedIds(productIds: readonly string[]): Promise<Set<string>> {
  const user = await getCurrentUser();
  if (!user || productIds.length === 0) return new Set();
  return wishlists.findWishlistedProductIds(user.id, productIds);
}
