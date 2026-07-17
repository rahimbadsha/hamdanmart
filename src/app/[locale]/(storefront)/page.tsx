import { getLocale, getTranslations } from "next-intl/server";

import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { localized } from "@/lib/i18n/content";
import { cn } from "@/lib/utils";
import { ProductGrid } from "@/features/catalog/components/product-grid";
import { RecentlyViewed } from "@/features/catalog/components/recently-viewed";
import { findCategoryTree } from "@/features/catalog/repositories/category-repository";
import { findFeaturedProducts } from "@/features/catalog/repositories/product-repository";
import type { AppLocale } from "@/i18n/routing";

export default async function HomePage(): Promise<React.ReactElement> {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations();
  const [categories, featured] = await Promise.all([
    findCategoryTree(),
    findFeaturedProducts(8),
  ]);

  return (
    <main className="mx-auto w-full max-w-6xl space-y-10 px-4 py-6">
      <section className="rounded-xl bg-primary px-6 py-12 text-center text-primary-foreground sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t("home.title")}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-primary-foreground/80">
          {t("home.subtitle")}
        </p>
        <Link
          href="/products"
          className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "mt-6")}
        >
          {t("home.shopNow")}
        </Link>
      </section>

      {categories.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">{t("common.categories")}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="rounded-lg border p-4 text-center font-medium transition-shadow hover:shadow-md"
              >
                {localized(category, "name", locale)}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {featured.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">{t("home.featured")}</h2>
          <ProductGrid products={featured} />
        </section>
      ) : null}

      <RecentlyViewed />
    </main>
  );
}
