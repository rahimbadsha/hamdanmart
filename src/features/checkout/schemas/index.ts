import { z } from "zod";

import { PAYMENT_METHODS } from "@/lib/constants";

/**
 * Checkout input. Address is collected inline so guests and logged-in users
 * share one flow. Server-side validation is the source of truth.
 */
export const checkoutSchema = z.object({
  customerName: z.string().trim().min(2, "validation.nameMin").max(100),
  customerPhone: z
    .string()
    .trim()
    .regex(/^01[3-9]\d{8}$/, "validation.phoneBd"),
  customerEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email("validation.email")
    .max(254)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  shippingLine1: z.string().trim().min(3, "validation.required").max(200),
  shippingLine2: z
    .string()
    .trim()
    .max(200)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  shippingCity: z.string().trim().min(2, "validation.required").max(100),
  shippingDistrict: z.string().trim().min(2, "validation.required").max(100),
  shippingPostalCode: z
    .string()
    .trim()
    .max(20)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  shippingMethodId: z.string().min(1, "validation.required"),
  paymentMethod: z.enum(PAYMENT_METHODS),
  couponCode: z
    .string()
    .trim()
    .max(40)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  customerNote: z.string().trim().max(500).optional(),
  saveAddress: z.boolean().optional(),
  honeypot: z.string().max(0).optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
