import "server-only";

import { getDummyPasswordHash, verifyPassword } from "@/lib/auth/password";
import { createAdminSession, destroyAdminSession } from "@/lib/auth/session";
import { UnauthorizedError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { enforceRateLimit } from "@/lib/rate-limit";

import * as admins from "../repositories/admin-repository";
import type { AdminLoginInput } from "../schemas";

/** Admin login: same lockout policy as customers, shorter sessions (12 h). */

const MAX_FAILED_LOGINS = 5;
const LOCKOUT_MS = 1000 * 60 * 15;

export async function loginAdmin(input: AdminLoginInput): Promise<void> {
  enforceRateLimit({ key: `admin-login:${input.email}`, limit: 10, windowMs: 60_000 });

  const admin = await admins.findAdminByEmail(input.email);
  const hashToCheck = admin?.passwordHash ?? (await getDummyPasswordHash());
  const passwordOk = await verifyPassword(hashToCheck, input.password);

  if (!admin || !admin.isActive) {
    throw new UnauthorizedError("errors.invalidCredentials");
  }
  if (admin.lockedUntil && admin.lockedUntil > new Date()) {
    throw new UnauthorizedError("errors.accountLocked");
  }
  if (!passwordOk) {
    const attempts = admin.failedLoginAttempts + 1;
    const lockedUntil =
      attempts >= MAX_FAILED_LOGINS ? new Date(Date.now() + LOCKOUT_MS) : null;
    await admins.recordAdminFailedLogin(admin.id, lockedUntil);
    if (lockedUntil) {
      logger.warn({ adminUserId: admin.id }, "admin account locked");
    }
    throw new UnauthorizedError("errors.invalidCredentials");
  }

  await admins.resetAdminLoginAttempts(admin.id);
  await createAdminSession(admin.id);
  logger.info({ adminUserId: admin.id }, "admin logged in");
}

export async function logoutAdmin(): Promise<void> {
  await destroyAdminSession();
}
