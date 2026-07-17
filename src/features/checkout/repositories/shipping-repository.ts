import "server-only";

import { db } from "@/lib/db";
import type { ShippingMethod } from "@/generated/prisma/client";

export async function findActiveShippingMethods(): Promise<ShippingMethod[]> {
  return db.shippingMethod.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function findShippingMethodById(id: string): Promise<ShippingMethod | null> {
  return db.shippingMethod.findFirst({ where: { id, isActive: true } });
}
