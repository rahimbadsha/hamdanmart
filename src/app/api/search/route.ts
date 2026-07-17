import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { localized } from "@/lib/i18n/content";
import { RateLimitError } from "@/lib/errors";
import { enforceRateLimit } from "@/lib/rate-limit";
import { findSearchSuggestions } from "@/features/catalog/repositories/product-repository";

const querySchema = z.object({
  q: z.string().trim().min(2).max(80),
  locale: z.enum(["bn", "en"]).default("bn"),
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  try {
    enforceRateLimit({ key: `search:${ip}`, limit: 30, windowMs: 60_000 });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json({ suggestions: [] }, { status: 429 });
    }
    throw error;
  }

  const parsed = querySchema.safeParse({
    q: request.nextUrl.searchParams.get("q") ?? "",
    locale: request.nextUrl.searchParams.get("locale") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ suggestions: [] });
  }

  const rows = await findSearchSuggestions(parsed.data.q);
  const suggestions = rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: localized(row, "name", parsed.data.locale),
    pricePoisha: row.basePricePoisha,
  }));

  return NextResponse.json({ suggestions });
}
