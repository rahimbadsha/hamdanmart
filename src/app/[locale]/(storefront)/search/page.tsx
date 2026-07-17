import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

import { Breadcrumbs } from "@/features/catalog/components/breadcrumbs";
import { FiltersBar } from "@/features/catalog/components/filters-bar";
import { Pagination } from "@/features/catalog/components/pagination";
import { ProductGrid } from "@/features/catalog/components/product-grid";
import { findProducts } from "@/features/catalog/repositories/product-repository";
import {
  flattenParams,
  parseListParams,
  type ListSearchParams,
} from "@/features/catalog/search-params";
import type { AppLocale } from "@/i18n/routing";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("search");
  return { title: t("title") };
}

interface SearchPageProps {
  readonly searchParams: Promise<ListSearchParams>;
}

export default async function SearchPage({
  searchParams,
}: SearchPageProps): Promise<React.ReactElement> {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations("search");
  const rawParams = await searchParams;
  const params = parseListParams(rawParams, locale);
  const result = params.query
    ? await findProducts(params)
    : { items: [], total: 0, page: 1, pageSize: 0, pageCount: 1 };

  return (
    <main className="mx-auto w-full max-w-6xl space-y-4 px-4 py-6">
      <Breadcrumbs crumbs={[{ label: t("title") }]} />
      <h1 className="text-2xl font-bold">
        {params.query
          ? t("resultsFor", { query: params.query, count: result.total })
          : t("title")}
      </h1>
      {params.query ? (
        <>
          <FiltersBar />
          <ProductGrid products={[...result.items]} />
          <Pagination
            page={result.page}
            pageCount={result.pageCount}
            basePath="/search"
            searchParams={flattenParams(rawParams)}
          />
        </>
      ) : (
        <p className="py-16 text-center text-muted-foreground">{t("empty")}</p>
      )}
    </main>
  );
}
