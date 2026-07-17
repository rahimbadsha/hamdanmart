import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

import { localized } from "@/lib/i18n/content";
import { AddToCartPanel } from "@/features/catalog/components/add-to-cart-panel";
import { Breadcrumbs } from "@/features/catalog/components/breadcrumbs";
import { Gallery } from "@/features/catalog/components/gallery";
import { ProductGrid } from "@/features/catalog/components/product-grid";
import {
  RecentlyViewed,
  RecordRecentlyViewed,
} from "@/features/catalog/components/recently-viewed";
import {
  findProductBySlug,
  findRelatedProducts,
} from "@/features/catalog/repositories/product-repository";
import type { VariantOption } from "@/features/catalog/types";
import { WishlistButton } from "@/features/wishlist/components/wishlist-button";
import { wishlistedIds } from "@/features/wishlist/services/wishlist-service";
import type { AppLocale } from "@/i18n/routing";

interface ProductPageProps {
  readonly params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = (await getLocale()) as AppLocale;
  const product = await findProductBySlug(slug);
  if (!product) return {};
  return {
    title: localized(product, "name", locale),
    description: localized(product, "description", locale).slice(0, 160),
  };
}

export default async function ProductPage({
  params,
}: ProductPageProps): Promise<React.ReactElement> {
  const { slug } = await params;
  const product = await findProductBySlug(slug);
  if (!product) notFound();

  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations();
  const name = localized(product, "name", locale);
  const categoryName = localized(product.category, "name", locale);

  const [related, wishlisted] = await Promise.all([
    findRelatedProducts(product.id, product.categoryId, 4),
    wishlistedIds([product.id]),
  ]);

  const variantOptions: VariantOption[] = product.variants.map((variant) => ({
    id: variant.id,
    nameEn: variant.nameEn,
    nameBn: variant.nameBn,
    pricePoisha: variant.pricePoisha,
    compareAtPricePoisha: variant.compareAtPricePoisha,
    stock: variant.inventory?.quantity ?? 0,
  }));

  const galleryImages = product.images.map((image) => ({
    path: image.media.path,
    alt: localized(image.media, "alt", locale) || name,
  }));

  return (
    <main className="mx-auto w-full max-w-6xl space-y-10 px-4 py-6">
      <RecordRecentlyViewed
        product={{
          slug: product.slug,
          nameEn: product.nameEn,
          nameBn: product.nameBn,
          pricePoisha: product.basePricePoisha,
        }}
      />
      <div className="space-y-4">
        <Breadcrumbs
          crumbs={[
            {
              label: categoryName,
              href: `/category/${product.category.slug}`,
            },
            { label: name },
          ]}
        />
        <div className="grid gap-8 md:grid-cols-2">
          <Gallery images={galleryImages} fallbackLabel={name} />
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl font-bold">{name}</h1>
              <WishlistButton
                productId={product.id}
                initialWishlisted={wishlisted.has(product.id)}
              />
            </div>
            {product.brand ? (
              <p className="text-sm text-muted-foreground">{product.brand}</p>
            ) : null}
            <AddToCartPanel variants={variantOptions} />
            <div className="space-y-2">
              <h2 className="font-semibold">{t("catalog.description")}</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {localized(product, "description", locale)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">{t("catalog.related")}</h2>
          <ProductGrid products={related} />
        </section>
      ) : null}

      <RecentlyViewed excludeSlug={product.slug} />
    </main>
  );
}
