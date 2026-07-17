import "server-only";

import { env } from "@/config/env";
import { logger } from "@/lib/logger";

/**
 * Email abstraction.
 *
 * Development: messages are logged to the server console (no SMTP needed —
 * verification/reset links are copied from the log).
 * Production: an SMTP transport plugs in here without touching callers.
 */

export interface EmailMessage {
  readonly to: string;
  readonly subject: string;
  readonly text: string;
}

export async function sendEmail(message: EmailMessage): Promise<void> {
  if (env.NODE_ENV === "production") {
    // SMTP transport is configured at deployment time (see DEPLOYMENT.md).
    throw new Error("SMTP transport not configured");
  }
  logger.info(
    { to: message.to, subject: message.subject },
    `\n--- EMAIL (dev console transport) ---\nTo: ${message.to}\nSubject: ${message.subject}\n\n${message.text}\n--- END EMAIL ---`,
  );
}
