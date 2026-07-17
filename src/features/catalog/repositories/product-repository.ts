import "server-only";

import { db } from "@/lib/db";
import type { Prisma, Product } from "@/generated/prisma/client";
import type { AppLocale } from "@/i18n/routing";

/**
 * Product data access. Storefront reads exclude inactive/soft-deleted rows
 * and include what product cards and detail pages need.
 */

const storefrontVisible = { isActive: true, deletedAt: null } as const;

const productCardInclude = {
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
} satisfies Prisma.ProductInclude;

export type ProductForCard = Prisma.ProductGetPayload<{
  include: typeof productCardInclude;
}>;

const productDetailInclude = {
  category: true,
  images: {
    orderBy: { sortOrder: "asc" as const },
    include: { media: true },
  },
  variants: {
    where: { deletedAt: null },
    orderBy: { sortOrder: "asc" as const },
    include: { inventory: true },
  },
} satisfies Prisma.ProductInclude;

export type ProductDetail = Prisma.ProductGetPayload<{
  include: typeof productDetailInclude;
}>;

export type ProductSort = "newest" | "priceAsc" | "priceDesc" | "nameAsc";

export interface ProductListParams {
  readonly categoryId?: string;
  readonly query?: string;
  readonly minPricePoisha?: number;
  readonly maxPricePoisha?: number;
  readonly inStockOnly?: boolean;
  readonly featuredOnly?: boolean;
  readonly sort?: ProductSort;
  readonly locale?: AppLocale;
  readonly page?: number;
  readonly pageSize?: number;
}

export interface Paged<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly pageCount: number;
}

const DEFAULT_PAGE_SIZE = 24;
const MAX_PAGE_SIZE = 60;

function buildWhere(params: ProductListParams): Prisma.ProductWhereInput {
  const priceFilter: Prisma.IntFilter = {
    ...(params.minPricePoisha !== undefined ? { gte: params.minPricePoisha } : {}),
    ...(params.maxPricePoisha !== undefined ? { lte: params.maxPricePoisha } : {}),
  };

  return {
    ...storefrontVisible,
    ...(params.categoryId ? { categoryId: params.categoryId } : {}),
    ...(params.featuredOnly ? { isFeatured: true } : {}),
    ...(Object.keys(priceFilter).length > 0 ? { basePricePoisha: priceFilter } : {}),
    ...(params.inStockOnly
      ? {
          variants: {
            some: { deletedAt: null, inventory: { quantity: { gt: 0 } } },
          },
        }
      : {}),
    ...(params.query
      ? {
          OR: [
            { nameEn: { contains: params.query } },
            { nameBn: { contains: params.query } },
            { brand: { contains: params.query } },
          ],
        }
      : {}),
  };
}

function buildOrderBy(
  sort: ProductSort,
  locale: AppLocale,
): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "priceAsc":
      return { basePricePoisha: "asc" };
    case "priceDesc":
      return { basePricePoisha: "desc" };
    case "nameAsc":
      return locale === "bn" ? { nameBn: "asc" } : { nameEn: "asc" };
    case "newest":
      return { createdAt: "desc" };
  }
}

export async function findProducts(
  params: ProductListParams = {},
): Promise<Paged<ProductForCard>> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, params.pageSize ?? DEFAULT_PAGE_SIZE),
  );
  const where = buildWhere(params);

  const [items, total] = await db.$transaction([
    db.product.findMany({
      where,
      include: productCardInclude,
      orderBy: buildOrderBy(params.sort ?? "newest", params.locale ?? "en"),
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.product.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function findProductBySlug(slug: string): Promise<ProductDetail | null> {
  return db.product.findFirst({
    where: { slug, ...storefrontVisible },
    include: productDetailInclude,
  });
}

export async function findProductById(id: string): Promise<Product | null> {
  return db.product.findUnique({ where: { id } });
}

export async function findRelatedProducts(
  productId: string,
  categoryId: string,
  take = 8,
): Promise<ProductForCard[]> {
  return db.product.findMany({
    where: { ...storefrontVisible, categoryId, id: { not: productId } },
    include: productCardInclude,
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function findFeaturedProducts(take = 8): Promise<ProductForCard[]> {
  return db.product.findMany({
    where: { ...storefrontVisible, isFeatured: true },
    include: productCardInclude,
    orderBy: { createdAt: "desc" },
    take,
  });
}

export interface SearchSuggestion {
  readonly id: string;
  readonly slug: string;
  readonly nameEn: string;
  readonly nameBn: string;
  readonly basePricePoisha: number;
}

export async function findSearchSuggestions(
  query: string,
  take = 6,
): Promise<SearchSuggestion[]> {
  return db.product.findMany({
    where: buildWhere({ query }),
    select: {
      id: true,
      slug: true,
      nameEn: true,
      nameBn: true,
      basePricePoisha: true,
    },
    orderBy: { createdAt: "desc" },
    take,
  });
}
