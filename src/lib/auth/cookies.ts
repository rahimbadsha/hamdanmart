import "server-only";

import { cookies } from "next/headers";

import { env } from "@/config/env";

export const USER_SESSION_COOKIE = "hm_session";
export const ADMIN_SESSION_COOKIE = "hm_admin_session";

export const USER_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
export const ADMIN_SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

interface SetSessionCookieOptions {
  readonly name: string;
  readonly token: string;
  readonly maxAgeMs: number;
}

export async function setSessionCookie({
  name,
  token,
  maxAgeMs,
}: SetSessionCookieOptions): Promise<void> {
  const store = await cookies();
  store.set(name, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(maxAgeMs / 1000),
  });
}

export async function readSessionCookie(name: string): Promise<string | null> {
  const store = await cookies();
  return store.get(name)?.value ?? null;
}

export async function clearSessionCookie(name: string): Promise<void> {
  const store = await cookies();
  store.set(name, "", {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
