import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

/**
 * Locale detection and routing (next-intl).
 * Session handling and additional request-level concerns are added in Phase 3.
 */
export default createMiddleware(routing);

export const config = {
  // Skip API routes, the admin area (English-only, no locale prefix),
  // Next internals, and static files (anything with a dot).
  matcher: "/((?!api|admin|_next|_vercel|.*\\..*).*)",
};
