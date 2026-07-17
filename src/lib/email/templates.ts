import "server-only";

import { env } from "@/config/env";
import type { EmailMessage } from "./index";

/** Plain-text auth emails. HTML templates come with the notification phase. */

export function verificationEmail(to: string, token: string): EmailMessage {
  const url = `${env.APP_URL}/verify-email?token=${token}`;
  return {
    to,
    subject: "Verify your HamdanMart email",
    text: `Welcome to HamdanMart!\n\nPlease verify your email address by opening this link:\n${url}\n\nThe link expires in 24 hours. If you did not create an account, ignore this email.`,
  };
}

export function passwordResetEmail(to: string, token: string): EmailMessage {
  const url = `${env.APP_URL}/reset-password?token=${token}`;
  return {
    to,
    subject: "Reset your HamdanMart password",
    text: `We received a request to reset your password.\n\nOpen this link to choose a new password:\n${url}\n\nThe link expires in 1 hour and can be used once. If you did not request this, ignore this email — your password is unchanged.`,
  };
}
