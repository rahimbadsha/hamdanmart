"use server";

import { getLocale } from "next-intl/server";

import { redirect } from "@/i18n/navigation";
import { toActionFailure, type ActionResult } from "@/lib/action-result";
import { ValidationError } from "@/lib/errors";

import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../schemas";
import * as authService from "../services/auth-service";

/**
 * Customer auth server actions: thin adapters — validate, call the service,
 * map errors. Business rules live in the service layer.
 */

export async function registerAction(input: unknown): Promise<ActionResult> {
  try {
    const parsed = registerSchema.safeParse(input);
    if (!parsed.success) throw new ValidationError("errors.invalidInput");
    await authService.registerUser(parsed.data);
  } catch (error) {
    return toActionFailure(error);
  }
  redirect({ href: "/account", locale: await getLocale() });
}

export async function loginAction(input: unknown): Promise<ActionResult> {
  try {
    const parsed = loginSchema.safeParse(input);
    if (!parsed.success) throw new ValidationError("errors.invalidInput");
    await authService.loginUser(parsed.data);
  } catch (error) {
    return toActionFailure(error);
  }
  redirect({ href: "/account", locale: await getLocale() });
}

export async function logoutAction(): Promise<void> {
  await authService.logoutUser();
  redirect({ href: "/", locale: await getLocale() });
}

export async function forgotPasswordAction(input: unknown): Promise<ActionResult> {
  try {
    const parsed = forgotPasswordSchema.safeParse(input);
    if (!parsed.success) throw new ValidationError("errors.invalidInput");
    await authService.requestPasswordReset(parsed.data.email);
    return undefined; // success handled in the form (neutral message)
  } catch (error) {
    return toActionFailure(error);
  }
}

export async function resetPasswordAction(input: unknown): Promise<ActionResult> {
  try {
    const parsed = resetPasswordSchema.safeParse(input);
    if (!parsed.success) throw new ValidationError("errors.invalidInput");
    await authService.resetPassword(parsed.data.token, parsed.data.password);
  } catch (error) {
    return toActionFailure(error);
  }
  redirect({ href: "/login?reset=1", locale: await getLocale() });
}
