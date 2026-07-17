import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { localized } from "@/lib/i18n/content";
import { cn, formatBDT } from "@/lib/utils";
import { ProductImage } from "@/features/catalog/components/product-image";
import { CartItemControls } from "@/features/cart/components/cart-item-controls";
import {
  computeTotals,
  getCart,
  MAX_QTY_PER_ITEM,
} from "@/features/cart/services/cart-service";
import type { AppLocale } from "@/i18n/routing";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("cart");
  return { title: t("title") };
}

export default async function CartPage(): Promise<React.ReactElement> {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations();
  const cart = await getCart();
  const totals = computeTotals(cart);

  if (!cart || cart.items.length === 0) {
    return (
      <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">{t("cart.title")}</h1>
        <p className="text-muted-foreground">{t("cart.empty")}</p>
        <Link href="/products" className={cn(buttonVariants())}>
          {t("home.shopNow")}
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6">
      <h1 className="text-2xl font-bold">{t("cart.title")}</h1>

      <ul className="space-y-3">
        {cart.items.map((item) => {
          const product = item.variant.product;
          const name = localized(product, "name", locale);
          const variantName = localized(item.variant, "name", locale);
          const image = product.images[0]?.media ?? null;
          const stock = item.variant.inventory?.quantity ?? 0;
          const lineTotal = item.quantity * item.variant.pricePoisha;

          return (
            <li key={item.id}>
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <Link
                    href={`/product/${product.slug}`}
                    className="w-16 shrink-0 sm:w-20"
                  >
                    <ProductImage
                      path={image?.path}
                      alt={name}
                      className="rounded-md"
                      sizes="80px"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/product/${product.slug}`}
                      className="line-clamp-1 font-medium hover:underline"
                    >
                      {name}
                    </Link>
                    <p className="text-sm text-muted-foreground">{variantName}</p>
                    <p className="text-sm">
                      {formatBDT(item.variant.pricePoisha, locale)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="font-semibold">{formatBDT(lineTotal, locale)}</span>
                    <CartItemControls
                      itemId={item.id}
                      quantity={item.quantity}
                      maxQuantity={Math.min(Math.max(stock, 1), MAX_QTY_PER_ITEM)}
                    />
                  </div>
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>

      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm text-muted-foreground">
              {t("cart.itemCount", { count: totals.itemCount })}
            </p>
            <p className="text-lg font-bold">
              {t("cart.subtotal")}: {formatBDT(totals.subtotalPoisha, locale)}
            </p>
            <p className="text-xs text-muted-foreground">{t("cart.shippingNote")}</p>
          </div>
          <Link href="/checkout" className={cn(buttonVariants({ size: "lg" }))}>
            {t("cart.checkout")}
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
