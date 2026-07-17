/**
 * Domain constants — single source of truth for the String status/type
 * columns in the database (SQLite has no enums; see prisma/schema.prisma).
 *
 * Always import from here. Never write a status string literal elsewhere.
 */

export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Statuses a customer may still cancel from. */
export const CANCELLABLE_ORDER_STATUSES: readonly OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
];

export const PAYMENT_METHODS = ["COD", "BKASH", "NAGAD", "ROCKET", "SSLCOMMERZ"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_STATUSES = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const REFUND_STATUSES = ["PENDING", "COMPLETED", "REJECTED"] as const;
export type RefundStatus = (typeof REFUND_STATUSES)[number];

export const REVIEW_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export const COUPON_TYPES = ["PERCENT", "FIXED"] as const;
export type CouponType = (typeof COUPON_TYPES)[number];

export const SYSTEM_ROLES = ["SUPER_ADMIN", "MANAGER", "STAFF"] as const;
export type SystemRole = (typeof SYSTEM_ROLES)[number];

/**
 * Permission keys, grouped by area. Roles are granted subsets of these;
 * SUPER_ADMIN implicitly has all.
 */
export const PERMISSIONS = [
  "products.read",
  "products.write",
  "categories.read",
  "categories.write",
  "inventory.read",
  "inventory.write",
  "orders.read",
  "orders.write",
  "customers.read",
  "customers.write",
  "coupons.read",
  "coupons.write",
  "reviews.read",
  "reviews.moderate",
  "payments.read",
  "payments.write",
  "refunds.write",
  "shipping.write",
  "media.write",
  "notifications.read",
  "reports.read",
  "settings.write",
  "admins.manage",
  "audit_logs.read",
] as const;
export type PermissionKey = (typeof PERMISSIONS)[number];
