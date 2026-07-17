import { z } from "zod";

/**
 * Auth validation schemas — shared by client forms (React Hook Form resolver)
 * and server actions. Error messages are i18n keys, translated in the UI.
 */

const email = z
  .string()
  .trim()
  .toLowerCase()
  .email("validation.email")
  .max(254, "validation.emailTooLong");

const password = z
  .string()
  .min(8, "validation.passwordMin")
  .max(128, "validation.passwordMax");

export const registerSchema = z.object({
  name: z.string().trim().min(2, "validation.nameMin").max(100, "validation.nameMax"),
  email,
  phone: z
    .string()
    .trim()
    .regex(/^01[3-9]\d{8}$/, "validation.phoneBd")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  password,
  honeypot: z.string().max(0).optional(),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "validation.required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({ email });
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "validation.required"),
  password,
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const adminLoginSchema = loginSchema;
export type AdminLoginInput = LoginInput;
