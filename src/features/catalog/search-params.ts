import { takaToPoisha } from "@/lib/utils";
import type { AppLocale } from "@/i18n/routing";

import type { ProductListParams, ProductSort } from "./repositories/product-repository";

export type ListSearchParams = Readonly<Record<string, string | string[] | undefined>>;

const SORTS: readonly ProductSort[] = ["newest", "priceAsc", "priceDesc", "nameAsc"];

function single(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parsePositiveInt(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : undefined;
}

/** Maps URL search params (?sort=&min=&max=&stock=&page=&q=) to repository params. */
export function parseListParams(
  searchParams: ListSearchParams,
  locale: AppLocale,
): ProductListParams {
  const sortRaw = single(searchParams.sort) as ProductSort | undefined;
  const minTaka = parsePositiveInt(single(searchParams.min));
  const maxTaka = parsePositiveInt(single(searchParams.max));
  const query = single(searchParams.q)?.trim().slice(0, 80);

  return {
    locale,
    sort: sortRaw && SORTS.includes(sortRaw) ? sortRaw : "newest",
    minPricePoisha: minTaka !== undefined ? takaToPoisha(minTaka) : undefined,
    maxPricePoisha: maxTaka !== undefined ? takaToPoisha(maxTaka) : undefined,
    inStockOnly: single(searchParams.stock) === "1",
    page: parsePositiveInt(single(searchParams.page)) || 1,
    ...(query ? { query } : {}),
  };
}

/** Flattens search params for pagination link building. */
export function flattenParams(
  searchParams: ListSearchParams,
): Record<string, string | undefined> {
  return Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => [key, single(value)]),
  );
}
