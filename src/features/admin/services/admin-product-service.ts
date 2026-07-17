import "server-only";

import { requirePermission } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { logger } from "@/lib/logger";

import {
  findAdminProductBySlug,
  findAdminProducts,
  type AdminProductDetail,
  type AdminProductRow,
} from "../repositories/admin-product-repository";
import { writeAuditLog } from "./audit-service";

export async function getAdminProducts(params: {
  search?: string;
  categoryId?: string;
  page?: number;
}): Promise<{ products: AdminProductRow[]; total: number }> {
  await requirePermission("products.read");
  return findAdminProducts(params);
}

export async function getAdminProduct(slug: string): Promise<AdminProductDetail> {
  await requirePermission("products.read");
  const product = await findAdminProductBySlug(slug);
  if (!product) throw new NotFoundError();
  return product;
}

export async function toggleProductActive(
  productId: string,
  isActive: boolean,
): Promise<void> {
  const admin = await requirePermission("products.write");
  await db.product.update({
    where: { id: productId },
    data: { isActive },
  });
  await writeAuditLog({
    adminUserId: admin.id,
    action: "product.toggle_active",
    entityType: "Product",
    entityId: productId,
    after: { isActive },
  });
  logger.info({ productId, isActive }, "product active toggled");
}

export async function updateVariantPrice(
  variantId: string,
  pricePoisha: number,
  compareAtPricePoisha: number | null,
): Promise<void> {
  const admin = await requirePermission("products.write");
  if (pricePoisha < 0) throw new ValidationError("Price must be positive");
  const before = await db.productVariant.findUnique({
    where: { id: variantId },
    select: { pricePoisha: true, compareAtPricePoisha: true },
  });
  await db.productVariant.update({
    where: { id: variantId },
    data: { pricePoisha, compareAtPricePoisha },
  });
  await writeAuditLog({
    adminUserId: admin.id,
    action: "product.update_price",
    entityType: "ProductVariant",
    entityId: variantId,
    before: before
      ? {
          pricePoisha: before.pricePoisha,
          compareAtPricePoisha: before.compareAtPricePoisha,
        }
      : undefined,
    after: { pricePoisha, compareAtPricePoisha },
  });
  logger.info({ variantId, pricePoisha }, "variant price updated");
}

export async function updateInventoryQuantity(
  variantId: string,
  quantity: number,
): Promise<void> {
  const admin = await requirePermission("inventory.write");
  if (quantity < 0) throw new ValidationError("Quantity must be non-negative");
  const before = await db.inventory.findFirst({
    where: { variantId },
    select: { quantity: true },
  });
  await db.inventory.updateMany({
    where: { variantId },
    data: { quantity },
  });
  await writeAuditLog({
    adminUserId: admin.id,
    action: "inventory.update",
    entityType: "Inventory",
    entityId: variantId,
    before: before ? { quantity: before.quantity } : undefined,
    after: { quantity },
  });
  logger.info({ variantId, quantity }, "inventory updated");
}
