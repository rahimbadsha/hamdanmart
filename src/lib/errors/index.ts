/**
 * Typed application errors.
 *
 * Services throw these; adapters (API routes, server actions) convert them
 * to HTTP responses or form errors via toErrorResponse(). Unknown errors are
 * never leaked to clients.
 */

export type ErrorCode =
  | "VALIDATION"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL";

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  /** Safe-to-expose details (e.g. field errors). Never put secrets here. */
  readonly details?: Readonly<Record<string, unknown>>;

  constructor(
    code: ErrorCode,
    status: number,
    message: string,
    details?: Readonly<Record<string, unknown>>,
  ) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message = "Invalid input", details?: Readonly<Record<string, unknown>>) {
    super("VALIDATION", 400, message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super("UNAUTHORIZED", 401, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to do this") {
    super("FORBIDDEN", 403, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super("NOT_FOUND", 404, message);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict") {
    super("CONFLICT", 409, message);
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests, please try again later") {
    super("RATE_LIMITED", 429, message);
  }
}

export interface ErrorResponseBody {
  readonly error: {
    readonly code: ErrorCode;
    readonly message: string;
    readonly details?: Readonly<Record<string, unknown>>;
  };
}

/**
 * Maps any thrown value to a safe HTTP response shape.
 * Unknown errors become an opaque 500 — internals are never exposed.
 */
export function toErrorResponse(error: unknown): {
  status: number;
  body: ErrorResponseBody;
} {
  if (error instanceof AppError) {
    return {
      status: error.status,
      body: {
        error: {
          code: error.code,
          message: error.message,
          ...(error.details ? { details: error.details } : {}),
        },
      },
    };
  }
  return {
    status: 500,
    body: { error: { code: "INTERNAL", message: "Something went wrong" } },
  };
}
