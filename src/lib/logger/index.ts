import pino from "pino";

import { env } from "@/config/env";

/**
 * Structured JSON logger.
 *
 * In development, pipe output through pino-pretty for readability:
 *   pnpm dev | pnpm exec pino-pretty
 *
 * (pino-pretty is intentionally not wired as a transport — worker-thread
 * transports are unreliable inside the Next.js server bundle.)
 */
export const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  base: undefined, // omit pid/hostname noise
  redact: {
    paths: ["password", "*.password", "token", "*.token", "authorization"],
    censor: "[redacted]",
  },
});
