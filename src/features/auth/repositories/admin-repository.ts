import "server-only";

import { db } from "@/lib/db";
import type { AdminUser } from "@/generated/prisma/client";

export async function findAdminByEmail(email: string): Promise<AdminUser | null> {
  return db.adminUser.findUnique({ where: { email } });
}

export async function recordAdminFailedLogin(
  adminUserId: string,
  lockedUntil: Date | null,
): Promise<void> {
  await db.adminUser.update({
    where: { id: adminUserId },
    data: { failedLoginAttempts: { increment: 1 }, lockedUntil },
  });
}

export async function resetAdminLoginAttempts(adminUserId: string): Promise<void> {
  await db.adminUser.update({
    where: { id: adminUserId },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  });
}
