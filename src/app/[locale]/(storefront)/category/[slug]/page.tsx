import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";

import { localized } from "@/lib/i18n/content";
import { Breadcrumbs } from "@/features/catalog/components/breadcrumbs";
import { FiltersBar } from "@/features/catalog/components/filters-bar";
import { Pagination } from "@/features/catalog/components/pagination";
import { ProductGrid } from "@/features/catalog/components/product-grid";
import { findCategoryBySlug } from "@/features/catalog/repositories/category-repository";
import { findProducts } from "@/features/catalog/repositories/product-repository";
import {
  flattenParams,
  parseListParams,
  type ListSearchParams,
} from "@/features/catalog/search-params";
import type { AppLocale } from "@/i18n/routing";

interface CategoryPageProps {
  readonly params: Promise<{ slug: string }>;
  readonly searchParams: Promise<ListSearchParams>;
}

export async function generateMetadata({
  params,
}: Pick<CategoryPageProps, "params">): Promise<Metadata> {
  const { slug } = await params;
  const locale = (await getLocale()) as AppLocale;
  const category = await findCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: localized(category, "name", locale),
    description: localized(category, "description", locale) || undefined,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps): Promise<React.ReactElement> {
  const { slug } = await params;
  const category = await findCategoryBySlug(slug);
  if (!category) notFound();

  const locale = (await getLocale()) as AppLocale;
  const rawParams = await searchParams;
  const listParams = parseListParams(rawParams, locale);
  const result = await findProducts({ ...listParams, categoryId: category.id });
  const name = localized(category, "name", locale);

  return (
    <main className="mx-auto w-full max-w-6xl space-y-4 px-4 py-6">
      <Breadcrumbs crumbs={[{ label: name }]} />
      <h1 className="text-2xl font-bold">{name}</h1>
      <FiltersBar />
      <ProductGrid products={result.items} />
      <Pagination
        page={result.page}
        pageCount={result.pageCount}
        basePath={`/category/${slug}`}
        searchParams={flattenParams(rawParams)}
      />
    </main>
  );
}
