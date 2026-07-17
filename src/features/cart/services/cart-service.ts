import "server-only";

import { cookies } from "next/headers";

import { env } from "@/config/env";
import { getCurrentUser } from "@/lib/auth/session";
import { generateToken } from "@/lib/auth/tokens";
import { db } from "@/lib/db";
import { ConflictError, NotFoundError, ValidationError } from "@/lib/errors";

import * as carts from "../repositories/cart-repository";
import type { CartWithItems } from "../repositories/cart-repository";

/**
 * Cart business logic.
 *
 * Guests get a cart keyed by a random token in an HTTP-only cookie;
 * logged-in users get a cart keyed by userId. On login the guest cart is
 * merged into the user cart (quantities summed, clamped to stock).
 */

const CART_COOKIE = "hm_cart";
const GUEST_CART_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
export const MAX_QTY_PER_ITEM = 20;

async function readCartToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(CART_COOKIE)?.value ?? null;
}

async function setCartToken(token: string): Promise<void> {
  const store = await cookies();
  store.set(CART_COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(GUEST_CART_TTL_MS / 1000),
  });
}

async function clearCartToken(): Promise<void> {
  const store = await cookies();
  store.set(CART_COOKIE, "", { path: "/", maxAge: 0 });
}

/** Clears the guest cart cookie after a successful order. */
export async function clearGuestCartCookie(): Promise<void> {
  await clearCartToken();
}

/** Current cart, or null if none exists yet. */
export async function getCart(): Promise<CartWithItems | null> {
  const user = await getCurrentUser();
  if (user) return carts.findCartByUserId(user.id);

  const token = await readCartToken();
  if (!token) return null;
  const cart = await carts.findCartBySessionToken(token);
  if (cart?.expiresAt && cart.expiresAt < new Date()) return null;
  return cart;
}

async function getOrCreateCart(): Promise<CartWithItems> {
  const existing = await getCart();
  if (existing) return existing;

  const user = await getCurrentUser();
  if (user) {
    await carts.createUserCart(user.id);
    const created = await carts.findCartByUserId(user.id);
    if (!created) throw new NotFoundError("errors.generic");
    return created;
  }

  const token = generateToken();
  await carts.createGuestCart(token, new Date(Date.now() + GUEST_CART_TTL_MS));
  await setCartToken(token);
  const created = await carts.findCartBySessionToken(token);
  if (!created) throw new NotFoundError("errors.generic");
  return created;
}

async function availableStock(variantId: string): Promise<number> {
  const variant = await db.productVariant.findFirst({
    where: {
      id: variantId,
      deletedAt: null,
      product: { isActive: true, deletedAt: null },
    },
    include: { inventory: true },
  });
  if (!variant) throw new NotFoundError("errors.productUnavailable");
  return variant.inventory?.quantity ?? 0;
}

export async function addItem(variantId: string, quantity: number): Promise<void> {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new ValidationError("errors.invalidInput");
  }

  const stock = await availableStock(variantId);
  if (stock < 1) throw new ConflictError("errors.outOfStock");

  const cart = await getOrCreateCart();
  const existing = cart.items.find((item) => item.variantId === variantId);
  const requested = (existing?.quantity ?? 0) + quantity;
  const clamped = Math.min(requested, stock, MAX_QTY_PER_ITEM);

  await carts.upsertCartItem(cart.id, variantId, clamped);
}

export async function updateItemQuantity(
  itemId: string,
  quantity: number,
): Promise<void> {
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new ValidationError("errors.invalidInput");
  }

  const cart = await getCart();
  const item = cart?.items.find((entry) => entry.id === itemId);
  // Ownership check: the item must belong to the caller's own cart (IDOR).
  if (!cart || !item) throw new NotFoundError("errors.generic");

  if (quantity === 0) {
    await carts.deleteCartItem(itemId);
    return;
  }

  const stock = await availableStock(item.variantId);
  const clamped = Math.min(quantity, Math.max(stock, 0), MAX_QTY_PER_ITEM);
  if (clamped === 0) {
    await carts.deleteCartItem(itemId);
    return;
  }
  await carts.updateItemQuantity(itemId, clamped);
}

export async function removeItem(itemId: string): Promise<void> {
  const cart = await getCart();
  const item = cart?.items.find((entry) => entry.id === itemId);
  if (!cart || !item) throw new NotFoundError("errors.generic");
  await carts.deleteCartItem(itemId);
}

export interface CartTotals {
  readonly itemCount: number;
  readonly subtotalPoisha: number;
}

export function computeTotals(cart: CartWithItems | null): CartTotals {
  if (!cart) return { itemCount: 0, subtotalPoisha: 0 };
  return cart.items.reduce<CartTotals>(
    (acc, item) => ({
      itemCount: acc.itemCount + item.quantity,
      subtotalPoisha: acc.subtotalPoisha + item.quantity * item.variant.pricePoisha,
    }),
    { itemCount: 0, subtotalPoisha: 0 },
  );
}

/**
 * Merges the guest cart into the user's cart after login/registration.
 * Quantities are summed and clamped; the guest cart is then deleted.
 */
export async function mergeGuestCartIntoUser(userId: string): Promise<void> {
  const token = await readCartToken();
  if (!token) return;

  const guestCart = await carts.findCartBySessionToken(token);
  if (!guestCart || guestCart.items.length === 0) {
    if (guestCart) await carts.deleteCart(guestCart.id);
    await clearCartToken();
    return;
  }

  let userCart = await carts.findCartByUserId(userId);
  if (!userCart) {
    await carts.createUserCart(userId);
    userCart = await carts.findCartByUserId(userId);
    if (!userCart) return;
  }

  for (const guestItem of guestCart.items) {
    const existing = userCart.items.find(
      (item) => item.variantId === guestItem.variantId,
    );
    const stock = guestItem.variant.inventory?.quantity ?? 0;
    const merged = Math.min(
      (existing?.quantity ?? 0) + guestItem.quantity,
      Math.max(stock, 0),
      MAX_QTY_PER_ITEM,
    );
    if (merged > 0) {
      await carts.upsertCartItem(userCart.id, guestItem.variantId, merged);
    }
  }

  await carts.deleteCart(guestCart.id);
  await clearCartToken();
}
