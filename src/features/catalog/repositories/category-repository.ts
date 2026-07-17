import "server-only";

import { db } from "@/lib/db";
import type { Category } from "@/generated/prisma/client";

/**
 * Category data access. All category queries live here — no Prisma outside
 * repositories. Soft-deleted and inactive rows are excluded from storefront
 * reads by default.
 */

const storefrontVisible = { isActive: true, deletedAt: null } as const;

export async function findCategoryBySlug(slug: string): Promise<Category | null> {
  return db.category.findFirst({
    where: { slug, ...storefrontVisible },
  });
}

/** Top-level categories with their direct children, for navigation menus. */
export async function findCategoryTree(): Promise<
  Array<Category & { children: Category[] }>
> {
  return db.category.findMany({
    where: { parentId: null, ...storefrontVisible },
    include: {
      children: {
        where: storefrontVisible,
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });
}
