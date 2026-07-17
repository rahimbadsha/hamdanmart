import "server-only";

import { getDummyPasswordHash, hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  createUserSession,
  destroyAllUserSessions,
  destroyUserSession,
} from "@/lib/auth/session";
import { generateToken, hashToken } from "@/lib/auth/tokens";
import { sendEmail } from "@/lib/email";
import { passwordResetEmail, verificationEmail } from "@/lib/email/templates";
import { ConflictError, UnauthorizedError, ValidationError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { enforceRateLimit } from "@/lib/rate-limit";

import { mergeGuestCartIntoUser } from "@/features/cart/services/cart-service";

import * as tokens from "../repositories/token-repository";
import * as users from "../repositories/user-repository";
import type { LoginInput, RegisterInput } from "../schemas";

/**
 * Customer authentication business logic.
 *
 * Lockout policy: 5 failed logins → account locked for 15 minutes.
 * Tokens: verification 24 h, reset 1 h, both single-use, only hashes stored.
 */

const MAX_FAILED_LOGINS = 5;
const LOCKOUT_MS = 1000 * 60 * 15;
const VERIFICATION_TTL_MS = 1000 * 60 * 60 * 24;
const RESET_TTL_MS = 1000 * 60 * 60;

export async function registerUser(input: RegisterInput): Promise<void> {
  enforceRateLimit({ key: `register:${input.email}`, limit: 3, windowMs: 60_000 });

  const existing = await users.findUserByEmail(input.email);
  if (existing) throw new ConflictError("errors.emailTaken");

  const user = await users.createUser({
    email: input.email,
    name: input.name,
    phone: input.phone,
    passwordHash: await hashPassword(input.password),
  });

  await issueVerificationEmail(user.id, user.email);
  await createUserSession(user.id);
  await mergeGuestCartIntoUser(user.id);
  logger.info({ userId: user.id }, "user registered");
}

async function issueVerificationEmail(userId: string, email: string): Promise<void> {
  const token = generateToken();
  await tokens.createEmailVerificationToken(
    userId,
    hashToken(token),
    new Date(Date.now() + VERIFICATION_TTL_MS),
  );
  await sendEmail(verificationEmail(email, token));
}

export async function loginUser(input: LoginInput): Promise<void> {
  enforceRateLimit({ key: `login:${input.email}`, limit: 10, windowMs: 60_000 });

  const user = await users.findUserByEmail(input.email);

  // Always verify against some hash so response timing does not reveal
  // whether the email exists.
  const hashToCheck = user?.passwordHash ?? (await getDummyPasswordHash());
  const passwordOk = await verifyPassword(hashToCheck, input.password);

  if (!user || user.deletedAt || !user.isActive) {
    throw new UnauthorizedError("errors.invalidCredentials");
  }
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new UnauthorizedError("errors.accountLocked");
  }
  if (!passwordOk) {
    const attempts = user.failedLoginAttempts + 1;
    const lockedUntil =
      attempts >= MAX_FAILED_LOGINS ? new Date(Date.now() + LOCKOUT_MS) : null;
    await users.recordFailedLogin(user.id, lockedUntil);
    if (lockedUntil) {
      logger.warn({ userId: user.id }, "account locked after failed logins");
    }
    throw new UnauthorizedError("errors.invalidCredentials");
  }

  await users.resetLoginAttempts(user.id);
  await createUserSession(user.id);
  await mergeGuestCartIntoUser(user.id);
}

export async function logoutUser(): Promise<void> {
  await destroyUserSession();
}

export async function verifyEmail(rawToken: string): Promise<void> {
  const token = await tokens.findEmailVerificationToken(hashToken(rawToken));
  if (!token || token.usedAt || token.expiresAt < new Date()) {
    throw new ValidationError("errors.invalidToken");
  }
  await tokens.consumeEmailVerificationToken(token.id);
  await users.markEmailVerified(token.userId);
}

/**
 * Always succeeds from the caller's perspective — whether the email exists
 * is never revealed (no user enumeration).
 */
export async function requestPasswordReset(email: string): Promise<void> {
  enforceRateLimit({ key: `reset:${email}`, limit: 3, windowMs: 60_000 });

  const user = await users.findUserByEmail(email);
  if (!user || user.deletedAt || !user.isActive) return;

  const token = generateToken();
  await tokens.createPasswordResetToken(
    user.id,
    hashToken(token),
    new Date(Date.now() + RESET_TTL_MS),
  );
  await sendEmail(passwordResetEmail(user.email, token));
}

export async function resetPassword(
  rawToken: string,
  newPassword: string,
): Promise<void> {
  const token = await tokens.findPasswordResetToken(hashToken(rawToken));
  if (!token || token.usedAt || token.expiresAt < new Date()) {
    throw new ValidationError("errors.invalidToken");
  }
  await tokens.consumePasswordResetToken(token.id);
  await users.updatePassword(token.userId, await hashPassword(newPassword));
  // Invalidate every existing session for this account.
  await destroyAllUserSessions(token.userId);
  logger.info({ userId: token.userId }, "password reset completed");
}
