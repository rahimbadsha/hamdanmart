import { describe, expect, it } from "vitest";

import {
  AppError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  RateLimitError,
  toErrorResponse,
  UnauthorizedError,
  ValidationError,
} from "../index";

describe("error classes", () => {
  it("ValidationError has code VALIDATION and status 400", () => {
    const err = new ValidationError("bad input");
    expect(err.code).toBe("VALIDATION");
    expect(err.status).toBe(400);
    expect(err.message).toBe("bad input");
    expect(err).toBeInstanceOf(AppError);
  });

  it("UnauthorizedError has status 401", () => {
    expect(new UnauthorizedError().status).toBe(401);
  });

  it("ForbiddenError has status 403", () => {
    expect(new ForbiddenError().status).toBe(403);
  });

  it("NotFoundError has status 404", () => {
    expect(new NotFoundError().status).toBe(404);
  });

  it("ConflictError has status 409", () => {
    expect(new ConflictError().status).toBe(409);
  });

  it("RateLimitError has status 429", () => {
    expect(new RateLimitError().status).toBe(429);
  });
});

describe("toErrorResponse", () => {
  it("maps AppError to matching status and body", () => {
    const err = new ValidationError("invalid", { field: "email" });
    const resp = toErrorResponse(err);
    expect(resp.status).toBe(400);
    expect(resp.body.error.code).toBe("VALIDATION");
    expect(resp.body.error.message).toBe("invalid");
    expect(resp.body.error.details).toEqual({ field: "email" });
  });

  it("maps unknown errors to 500 without leaking internals", () => {
    const resp = toErrorResponse(new Error("secret db info"));
    expect(resp.status).toBe(500);
    expect(resp.body.error.code).toBe("INTERNAL");
    expect(resp.body.error.message).toBe("Something went wrong");
  });

  it("maps non-error values to 500", () => {
    const resp = toErrorResponse("string error");
    expect(resp.status).toBe(500);
    expect(resp.body.error.code).toBe("INTERNAL");
  });
});
