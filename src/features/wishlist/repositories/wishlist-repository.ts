import "server-only";

import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

const wishlistInclude = {
  items: {
    orderBy: { createdAt: "desc" as const },
    include: {
      product: {
        include: {
          images: {
            orderBy: { sortOrder: "asc" as const },
            take: 1,
            include: { media: true },
          },
          variants: {
            where: { deletedAt: null },
            orderBy: { sortOrder: "asc" as const },
            include: { inventory: true },
          },
        },
      },
    },
  },
} satisfies Prisma.WishlistInclude;

export type WishlistWithItems = Prisma.WishlistGetPayload<{
  include: typeof wishlistInclude;
}>;

export async function findWishlistByUserId(
  userId: string,
): Promise<WishlistWithItems | null> {
  return db.wishlist.findUnique({ where: { userId }, include: wishlistInclude });
}

export async function ensureWishlist(userId: string): Promise<string> {
  const wishlist = await db.wishlist.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
  return wishlist.id;
}

export async function findItem(
  wishlistId: string,
  productId: string,
): Promise<{ id: string } | null> {
  return db.wishlistItem.findUnique({
    where: { wishlistId_productId: { wishlistId, productId } },
    select: { id: true },
  });
}

export async function addItem(wishlistId: string, productId: string): Promise<void> {
  await db.wishlistItem.create({ data: { wishlistId, productId } });
}

export async function removeItem(itemId: string): Promise<void> {
  await db.wishlistItem.delete({ where: { id: itemId } });
}

export async function findWishlistedProductIds(
  userId: string,
  productIds: readonly string[],
): Promise<Set<string>> {
  const rows = await db.wishlistItem.findMany({
    where: { wishlist: { userId }, productId: { in: [...productIds] } },
    select: { productId: true },
  });
  return new Set(rows.map((row) => row.productId));
}
