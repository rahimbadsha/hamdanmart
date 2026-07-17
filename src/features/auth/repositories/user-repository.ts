import "server-only";

import { db } from "@/lib/db";
import type { User } from "@/generated/prisma/client";

export async function findUserByEmail(email: string): Promise<User | null> {
  return db.user.findUnique({ where: { email } });
}

export async function findUserById(id: string): Promise<User | null> {
  return db.user.findUnique({ where: { id } });
}

export async function createUser(data: {
  email: string;
  passwordHash: string;
  name: string;
  phone?: string;
}): Promise<User> {
  return db.user.create({ data });
}

export async function recordFailedLogin(
  userId: string,
  lockedUntil: Date | null,
): Promise<void> {
  await db.user.update({
    where: { id: userId },
    data: { failedLoginAttempts: { increment: 1 }, lockedUntil },
  });
}

export async function resetLoginAttempts(userId: string): Promise<void> {
  await db.user.update({
    where: { id: userId },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  });
}

export async function markEmailVerified(userId: string): Promise<void> {
  await db.user.update({
    where: { id: userId },
    data: { emailVerifiedAt: new Date() },
  });
}

export async function updatePassword(
  userId: string,
  passwordHash: string,
): Promise<void> {
  await db.user.update({
    where: { id: userId },
    data: { passwordHash, failedLoginAttempts: 0, lockedUntil: null },
  });
}
