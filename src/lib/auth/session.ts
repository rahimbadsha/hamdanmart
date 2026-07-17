import "server-only";

import { cache } from "react";

import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_MS,
  clearSessionCookie,
  readSessionCookie,
  setSessionCookie,
  USER_SESSION_COOKIE,
  USER_SESSION_TTL_MS,
} from "./cookies";
import { generateToken, hashToken } from "./tokens";

/**
 * Database-backed sessions.
 *
 * A fresh random token is issued on every login (prevents session fixation);
 * only its SHA-256 hash is stored. Sessions are renewed on activity once less
 * than half their lifetime remains.
 */

interface RequestMeta {
  readonly ip?: string;
  readonly userAgent?: string;
}

export async function createUserSession(
  userId: string,
  meta: RequestMeta = {},
): Promise<void> {
  const token = generateToken();
  await db.session.create({
    data: {
      tokenHash: hashToken(token),
      userId,
      ip: meta.ip,
      userAgent: meta.userAgent,
      expiresAt: new Date(Date.now() + USER_SESSION_TTL_MS),
    },
  });
  await setSessionCookie({
    name: USER_SESSION_COOKIE,
    token,
    maxAgeMs: USER_SESSION_TTL_MS,
  });
}

export async function createAdminSession(
  adminUserId: string,
  meta: RequestMeta = {},
): Promise<void> {
  const token = generateToken();
  await db.session.create({
    data: {
      tokenHash: hashToken(token),
      adminUserId,
      ip: meta.ip,
      userAgent: meta.userAgent,
      expiresAt: new Date(Date.now() + ADMIN_SESSION_TTL_MS),
    },
  });
  await setSessionCookie({
    name: ADMIN_SESSION_COOKIE,
    token,
    maxAgeMs: ADMIN_SESSION_TTL_MS,
  });
}

const adminSessionInclude = {
  adminUser: {
    include: {
      role: {
        include: { rolePermissions: { include: { permission: true } } },
      },
    },
  },
} satisfies Prisma.SessionInclude;

export type SessionAdmin = NonNullable<
  Prisma.SessionGetPayload<{ include: typeof adminSessionInclude }>["adminUser"]
>;

/**
 * Returns the logged-in customer, or null. Cached per request.
 * Expired sessions are treated as absent; cleanup happens on logout/login.
 */
export const getCurrentUser = cache(async () => {
  const token = await readSessionCookie(USER_SESSION_COOKIE);
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });
  if (!session?.user || session.expiresAt < new Date()) return null;
  if (!session.user.isActive || session.user.deletedAt) return null;

  await renewIfNeeded(session.id, session.expiresAt, USER_SESSION_TTL_MS);
  return session.user;
});

/** Returns the logged-in admin with role + permissions, or null. */
export const getCurrentAdmin = cache(async (): Promise<SessionAdmin | null> => {
  const token = await readSessionCookie(ADMIN_SESSION_COOKIE);
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: adminSessionInclude,
  });
  if (!session?.adminUser || session.expiresAt < new Date()) return null;
  if (!session.adminUser.isActive) return null;

  await renewIfNeeded(session.id, session.expiresAt, ADMIN_SESSION_TTL_MS);
  return session.adminUser;
});

async function renewIfNeeded(
  sessionId: string,
  expiresAt: Date,
  ttlMs: number,
): Promise<void> {
  const remaining = expiresAt.getTime() - Date.now();
  if (remaining < ttlMs / 2) {
    await db.session.update({
      where: { id: sessionId },
      data: { expiresAt: new Date(Date.now() + ttlMs) },
    });
  }
}

export async function destroyUserSession(): Promise<void> {
  const token = await readSessionCookie(USER_SESSION_COOKIE);
  if (token) {
    await db.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  await clearSessionCookie(USER_SESSION_COOKIE);
}

export async function destroyAdminSession(): Promise<void> {
  const token = await readSessionCookie(ADMIN_SESSION_COOKIE);
  if (token) {
    await db.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  await clearSessionCookie(ADMIN_SESSION_COOKIE);
}

/** Logs the user out of every device — used after a password reset. */
export async function destroyAllUserSessions(userId: string): Promise<void> {
  await db.session.deleteMany({ where: { userId } });
}
