import "server-only";

import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

const productListInclude = {
  category: { select: { nameEn: true } },
  variants: {
    include: { inventory: true },
    orderBy: { sortOrder: "asc" as const },
  },
  images: { take: 1, orderBy: { sortOrder: "asc" as const } },
} satisfies Prisma.ProductInclude;

export type AdminProductRow = Prisma.ProductGetPayload<{
  include: typeof productListInclude;
}>;

export async function findAdminProducts(params: {
  search?: string;
  categoryId?: string;
  page?: number;
  perPage?: number;
}): Promise<{ products: AdminProductRow[]; total: number }> {
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 20;
  const where: Prisma.ProductWhereInput = { deletedAt: null };

  if (params.search) {
    where.OR = [
      { nameEn: { contains: params.search } },
      { nameBn: { contains: params.search } },
      { slug: { contains: params.search } },
    ];
  }
  if (params.categoryId) where.categoryId = params.categoryId;

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      include: productListInclude,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    db.product.count({ where }),
  ]);
  return { products, total };
}

const productDetailInclude = {
  category: true,
  variants: {
    include: { inventory: true },
    orderBy: { sortOrder: "asc" as const },
  },
  images: {
    include: { media: true },
    orderBy: { sortOrder: "asc" as const },
  },
} satisfies Prisma.ProductInclude;

export type AdminProductDetail = Prisma.ProductGetPayload<{
  include: typeof productDetailInclude;
}>;

export async function findAdminProductBySlug(
  slug: string,
): Promise<AdminProductDetail | null> {
  return db.product.findFirst({
    where: { slug, deletedAt: null },
    include: productDetailInclude,
  });
}
