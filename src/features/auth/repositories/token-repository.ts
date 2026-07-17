import "server-only";

import { db } from "@/lib/db";
import type {
  EmailVerificationToken,
  PasswordResetToken,
} from "@/generated/prisma/client";

/** Verification / reset token storage. Only token hashes are persisted. */

export async function createEmailVerificationToken(
  userId: string,
  tokenHash: string,
  expiresAt: Date,
): Promise<void> {
  await db.emailVerificationToken.create({
    data: { userId, tokenHash, expiresAt },
  });
}

export async function findEmailVerificationToken(
  tokenHash: string,
): Promise<EmailVerificationToken | null> {
  return db.emailVerificationToken.findUnique({ where: { tokenHash } });
}

export async function consumeEmailVerificationToken(id: string): Promise<void> {
  await db.emailVerificationToken.update({
    where: { id },
    data: { usedAt: new Date() },
  });
}

export async function createPasswordResetToken(
  userId: string,
  tokenHash: string,
  expiresAt: Date,
): Promise<void> {
  await db.passwordResetToken.create({ data: { userId, tokenHash, expiresAt } });
}

export async function findPasswordResetToken(
  tokenHash: string,
): Promise<PasswordResetToken | null> {
  return db.passwordResetToken.findUnique({ where: { tokenHash } });
}

export async function consumePasswordResetToken(id: string): Promise<void> {
  await db.passwordResetToken.update({
    where: { id },
    data: { usedAt: new Date() },
  });
}
