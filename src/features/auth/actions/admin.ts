"use server";

import { redirect } from "next/navigation";

import { toActionFailure, type ActionResult } from "@/lib/action-result";
import { ValidationError } from "@/lib/errors";

import { adminLoginSchema } from "../schemas";
import * as adminAuthService from "../services/admin-auth-service";

export async function adminLoginAction(input: unknown): Promise<ActionResult> {
  try {
    const parsed = adminLoginSchema.safeParse(input);
    if (!parsed.success) throw new ValidationError("errors.invalidInput");
    await adminAuthService.loginAdmin(parsed.data);
  } catch (error) {
    return toActionFailure(error);
  }
  redirect("/admin");
}

export async function adminLogoutAction(): Promise<void> {
  await adminAuthService.logoutAdmin();
  redirect("/admin/login");
}
