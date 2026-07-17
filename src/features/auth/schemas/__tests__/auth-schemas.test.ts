import { describe, expect, it } from "vitest";

import { loginSchema, registerSchema, resetPasswordSchema } from "../index";

describe("registerSchema", () => {
  const valid = {
    name: "John Doe",
    email: "john@example.com",
    phone: "01712345678",
    password: "securepass1",
  };

  it("accepts valid input", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects short name", () => {
    expect(registerSchema.safeParse({ ...valid, name: "J" }).success).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(registerSchema.safeParse({ ...valid, email: "notanemail" }).success).toBe(
      false,
    );
  });

  it("rejects non-BD phone", () => {
    expect(registerSchema.safeParse({ ...valid, phone: "12345678901" }).success).toBe(
      false,
    );
  });

  it("accepts valid BD phone prefixes", () => {
    for (const prefix of ["013", "014", "015", "016", "017", "018", "019"]) {
      const phone = `${prefix}12345678`;
      expect(registerSchema.safeParse({ ...valid, phone }).success).toBe(true);
    }
  });

  it("rejects short password", () => {
    expect(registerSchema.safeParse({ ...valid, password: "short" }).success).toBe(false);
  });

  it("rejects filled honeypot", () => {
    expect(registerSchema.safeParse({ ...valid, honeypot: "bot" }).success).toBe(false);
  });

  it("accepts empty honeypot", () => {
    expect(registerSchema.safeParse({ ...valid, honeypot: "" }).success).toBe(true);
  });

  it("allows phone to be optional", () => {
    const { phone: _, ...withoutPhone } = valid;
    expect(registerSchema.safeParse(withoutPhone).success).toBe(true);
  });
});

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    const result = loginSchema.safeParse({
      email: "user@test.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing password", () => {
    const result = loginSchema.safeParse({ email: "user@test.com", password: "" });
    expect(result.success).toBe(false);
  });

  it("lowercases email", () => {
    const result = loginSchema.safeParse({
      email: "USER@TEST.COM",
      password: "password123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("user@test.com");
    }
  });
});

describe("resetPasswordSchema", () => {
  it("requires token and strong password", () => {
    const result = resetPasswordSchema.safeParse({
      token: "abc123",
      password: "newpassword1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing token", () => {
    const result = resetPasswordSchema.safeParse({
      token: "",
      password: "newpassword1",
    });
    expect(result.success).toBe(false);
  });
});
