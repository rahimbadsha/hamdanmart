import "server-only";

import { randomUUID } from "node:crypto";

import argon2 from "argon2";

/**
 * Password hashing (argon2id, library defaults: 64 MiB memory, 3 iterations).
 * Never store or log plaintext passwords.
 */

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, { type: argon2.argon2id });
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

/**
 * Hash of a random throwaway value, computed once per process.
 * Verified against when an account does not exist, so login timing does not
 * reveal which emails are registered.
 */
let dummyHashPromise: Promise<string> | null = null;

export function getDummyPasswordHash(): Promise<string> {
  dummyHashPromise ??= argon2.hash(randomUUID(), { type: argon2.argon2id });
  return dummyHashPromise;
}
