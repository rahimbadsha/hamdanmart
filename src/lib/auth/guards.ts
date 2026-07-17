import "server-only";

import { ForbiddenError, UnauthorizedError } from "@/lib/errors";
import type { PermissionKey } from "@/lib/constants";
import type { User } from "@/generated/prisma/client";

import { getCurrentAdmin, getCurrentUser, type SessionAdmin } from "./session";

/**
 * Authorization guards. Services and server actions call these — access
 * control is never enforced only in the UI (SECURITY.md).
 */

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  return user;
}

export async function requireAdmin(): Promise<SessionAdmin> {
  const admin = await getCurrentAdmin();
  if (!admin) throw new UnauthorizedError();
  return admin;
}

export function adminHasPermission(
  admin: SessionAdmin,
  permission: PermissionKey,
): boolean {
  if (admin.role.name === "SUPER_ADMIN") return true;
  return admin.role.rolePermissions.some((rp) => rp.permission.key === permission);
}

export async function requirePermission(
  permission: PermissionKey,
): Promise<SessionAdmin> {
  const admin = await requireAdmin();
  if (!adminHasPermission(admin, permission)) {
    throw new ForbiddenError();
  }
  return admin;
}
