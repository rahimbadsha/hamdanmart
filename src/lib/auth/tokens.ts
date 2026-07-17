import "server-only";

import { createHash, randomBytes } from "node:crypto";

/**
 * Opaque token helpers for sessions, email verification, and password reset.
 *
 * The raw token goes to the user (cookie or email link); only its SHA-256
 * hash is stored, so a database leak cannot be replayed as a live token.
 */

export function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
