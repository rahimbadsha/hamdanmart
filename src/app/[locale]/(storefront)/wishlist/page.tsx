import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

import { buttonVariants } from "@/components/ui/button";
import { Link, redirect } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { ProductGrid } from "@/features/catalog/components/product-grid";
import { getCurrentUser } from "@/lib/auth/session";
import { getWishlist } from "@/features/wishlist/services/wishlist-service";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("wishlist");
  return { title: t("title") };
}

export default async function WishlistPage(): Promise<React.ReactElement> {
  const user = await getCurrentUser();
  const locale = await getLocale();
  if (!user) {
    redirect({ href: "/login", locale });
    return <></>; // unreachable — redirect() throws
  }

  const t = await getTranslations();
  const wishlist = await getWishlist();
  const products = wishlist?.items.map((item) => item.product) ?? [];

  return (
    <main className="mx-auto w-full max-w-6xl space-y-4 px-4 py-6">
      <h1 className="text-2xl font-bold">{t("wishlist.title")}</h1>
      {products.length === 0 ? (
        <div className="space-y-4 py-16 text-center">
          <p className="text-muted-foreground">{t("wishlist.empty")}</p>
          <Link href="/products" className={cn(buttonVariants())}>
            {t("home.shopNow")}
          </Link>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </main>
  );
}
