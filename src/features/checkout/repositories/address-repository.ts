import "server-only";

import { db } from "@/lib/db";
import type { Address, Prisma } from "@/generated/prisma/client";

export async function findDefaultAddress(userId: string): Promise<Address | null> {
  return db.address.findFirst({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}

export async function createAddress(
  data: Prisma.AddressUncheckedCreateInput,
): Promise<Address> {
  return db.address.create({ data });
}
