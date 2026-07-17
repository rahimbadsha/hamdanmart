import "server-only";

import { env } from "@/config/env";
import { logger } from "@/lib/logger";

export interface EmailMessage {
  readonly to: string;
  readonly subject: string;
  readonly text: string;
}

export async function sendEmail(message: EmailMessage): Promise<void> {
  if (
    env.NODE_ENV === "production" &&
    env.SMTP_HOST &&
    env.SMTP_PORT &&
    env.SMTP_USER &&
    env.SMTP_PASS
  ) {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
    await transporter.sendMail({
      from: env.SMTP_FROM ?? `HamdanMart <${env.SMTP_USER}>`,
      to: message.to,
      subject: message.subject,
      text: message.text,
    });
    logger.info({ to: message.to, subject: message.subject }, "email sent via SMTP");
    return;
  }

  logger.info(
    { to: message.to, subject: message.subject },
    `\n--- EMAIL (dev console transport) ---\nTo: ${message.to}\nSubject: ${message.subject}\n\n${message.text}\n--- END EMAIL ---`,
  );
}
