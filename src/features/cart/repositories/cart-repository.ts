import "server-only";

import { db } from "@/lib/db";
import type { Cart, Prisma } from "@/generated/prisma/client";

const cartInclude = {
  items: {
    orderBy: { createdAt: "asc" as const },
    include: {
      variant: {
        include: {
          inventory: true,
          product: {
            include: {
              images: {
                orderBy: { sortOrder: "asc" as const },
                take: 1,
                include: { media: true },
              },
            },
          },
        },
      },
    },
  },
} satisfies Prisma.CartInclude;

export type CartWithItems = Prisma.CartGetPayload<{ include: typeof cartInclude }>;
export type CartItemWithVariant = CartWithItems["items"][number];

export async function findCartByUserId(userId: string): Promise<CartWithItems | null> {
  return db.cart.findUnique({ where: { userId }, include: cartInclude });
}

export async function findCartBySessionToken(
  sessionToken: string,
): Promise<CartWithItems | null> {
  return db.cart.findUnique({ where: { sessionToken }, include: cartInclude });
}

export async function createUserCart(userId: string): Promise<Cart> {
  return db.cart.create({ data: { userId } });
}

export async function createGuestCart(
  sessionToken: string,
  expiresAt: Date,
): Promise<Cart> {
  return db.cart.create({ data: { sessionToken, expiresAt } });
}

export async function upsertCartItem(
  cartId: string,
  variantId: string,
  quantity: number,
): Promise<void> {
  await db.cartItem.upsert({
    where: { cartId_variantId: { cartId, variantId } },
    create: { cartId, variantId, quantity },
    update: { quantity },
  });
}

export async function updateItemQuantity(
  itemId: string,
  quantity: number,
): Promise<void> {
  await db.cartItem.update({ where: { id: itemId }, data: { quantity } });
}

export async function deleteCartItem(itemId: string): Promise<void> {
  await db.cartItem.delete({ where: { id: itemId } });
}

export async function deleteCart(cartId: string): Promise<void> {
  await db.cart.delete({ where: { id: cartId } });
}

export async function countCartItems(cartId: string): Promise<number> {
  const result = await db.cartItem.aggregate({
    where: { cartId },
    _sum: { quantity: true },
  });
  return result._sum.quantity ?? 0;
}
