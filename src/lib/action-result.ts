import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";

/**
 * Uniform result shape for server actions that report errors back to forms.
 * Successful actions usually redirect instead of returning.
 *
 * `error` is an i18n key (e.g. "errors.invalidCredentials") translated in the UI.
 */
export interface ActionFailure {
  readonly ok: false;
  readonly error: string;
}

export type ActionResult = ActionFailure | undefined;

/** Maps a thrown value to an ActionFailure without leaking internals. */
export function toActionFailure(error: unknown): ActionFailure {
  if (error instanceof AppError) {
    return { ok: false, error: error.message };
  }
  logger.error({ err: error }, "unhandled action error");
  return { ok: false, error: "errors.generic" };
}
