import "server-only";

import { env } from "@/config/env";
import { poishaToTaka } from "@/lib/utils/money";

import type { EmailMessage } from "./index";

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

export interface OrderEmailData {
  readonly orderNumber: string;
  readonly customerName: string;
  readonly totalPoisha: number;
  readonly itemCount: number;
  readonly paymentMethod: string;
}

export function orderConfirmationEmail(to: string, order: OrderEmailData): EmailMessage {
  const trackUrl = `${env.APP_URL}/order-tracking`;
  const total = `৳${poishaToTaka(order.totalPoisha).toLocaleString("en-BD")}`;
  return {
    to,
    subject: `Order Confirmed — ${order.orderNumber}`,
    text: [
      `Dear ${order.customerName},`,
      "",
      `Thank you for your order! Here's your summary:`,
      "",
      `Order Number: ${order.orderNumber}`,
      `Items: ${order.itemCount}`,
      `Total: ${total}`,
      `Payment: ${order.paymentMethod}`,
      "",
      `Track your order: ${trackUrl}`,
      "",
      "— HamdanMart",
    ].join("\n"),
  };
}

export function orderStatusUpdateEmail(
  to: string,
  order: { orderNumber: string; customerName: string; newStatus: string },
): EmailMessage {
  const trackUrl = `${env.APP_URL}/order-tracking`;
  return {
    to,
    subject: `Order ${order.orderNumber} — ${order.newStatus}`,
    text: [
      `Dear ${order.customerName},`,
      "",
      `Your order ${order.orderNumber} has been updated to: ${order.newStatus}`,
      "",
      `Track your order: ${trackUrl}`,
      "",
      "— HamdanMart",
    ].join("\n"),
  };
}
