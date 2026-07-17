import { describe, expect, it } from "vitest";

import { checkoutSchema } from "../index";

const valid = {
  customerName: "Rahim Badsha",
  customerPhone: "01712345678",
  customerEmail: "rahim@example.com",
  shippingLine1: "House 5, Road 3",
  shippingCity: "Dhaka",
  shippingDistrict: "Dhaka",
  shippingMethodId: "sm_1",
  paymentMethod: "COD" as const,
};

describe("checkoutSchema", () => {
  it("accepts valid checkout input", () => {
    expect(checkoutSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects invalid BD phone", () => {
    expect(
      checkoutSchema.safeParse({ ...valid, customerPhone: "0012345678" }).success,
    ).toBe(false);
  });

  it("rejects non-existent payment method", () => {
    expect(checkoutSchema.safeParse({ ...valid, paymentMethod: "VISA" }).success).toBe(
      false,
    );
  });

  it("accepts optional fields as empty strings", () => {
    const result = checkoutSchema.safeParse({
      ...valid,
      customerEmail: "",
      shippingLine2: "",
      shippingPostalCode: "",
      couponCode: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.customerEmail).toBeUndefined();
    }
  });

  it("rejects filled honeypot", () => {
    expect(checkoutSchema.safeParse({ ...valid, honeypot: "spam" }).success).toBe(false);
  });

  it("accepts empty honeypot", () => {
    expect(checkoutSchema.safeParse({ ...valid, honeypot: "" }).success).toBe(true);
  });

  it("rejects short customer name", () => {
    expect(checkoutSchema.safeParse({ ...valid, customerName: "R" }).success).toBe(false);
  });

  it("rejects missing shipping method", () => {
    expect(checkoutSchema.safeParse({ ...valid, shippingMethodId: "" }).success).toBe(
      false,
    );
  });

  it("limits customer note length", () => {
    const longNote = "x".repeat(501);
    expect(checkoutSchema.safeParse({ ...valid, customerNote: longNote }).success).toBe(
      false,
    );
  });
});
