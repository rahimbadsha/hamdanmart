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
  const t = await getTranslations("catalog");
  return { title: t("allProducts") };
}

interface ProductsPageProps {
  readonly searchParams: Promise<ListSearchParams>;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps): Promise<React.ReactElement> {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations("catalog");
  const rawParams = await searchParams;
  const params = parseListParams(rawParams, locale);
  const result = await findProducts(params);

  return (
    <main className="mx-auto w-full max-w-6xl space-y-4 px-4 py-6">
      <Breadcrumbs crumbs={[{ label: t("allProducts") }]} />
      <h1 className="text-2xl font-bold">{t("allProducts")}</h1>
      <FiltersBar />
      <ProductGrid products={result.items} />
      <Pagination
        page={result.page}
        pageCount={result.pageCount}
        basePath="/products"
        searchParams={flattenParams(rawParams)}
      />
    </main>
  );
}
