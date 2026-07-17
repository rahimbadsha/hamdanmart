import { getLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { localized } from "@/lib/i18n/content";
import { WishlistButton } from "@/features/wishlist/components/wishlist-button";

import type { ProductForCard } from "../repositories/product-repository";
import { Price } from "./price";
import { ProductImage } from "./product-image";
import { StockBadge } from "./stock-badge";

interface ProductCardProps {
  readonly product: ProductForCard;
  readonly wishlisted?: boolean;
}

export async function ProductCard({
  product,
  wishlisted = false,
}: ProductCardProps): Promise<React.ReactElement> {
  const locale = (await getLocale()) as "bn" | "en";
  const name = localized(product, "name", locale);
  const image = product.images[0]?.media ?? null;
  const totalStock = product.variants.reduce(
    (sum, variant) => sum + (variant.inventory?.quantity ?? 0),
    0,
  );

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md">
      <WishlistButton
        productId={product.id}
        initialWishlisted={wishlisted}
        className="absolute right-2 top-2 z-10"
      />
      <Link href={`/product/${product.slug}`} className="flex flex-1 flex-col">
        <ProductImage
          path={image?.path}
          alt={image ? localized(image, "alt", locale) || name : name}
        />
        <div className="flex flex-1 flex-col gap-1.5 p-3">
          <h3 className="line-clamp-2 text-sm font-medium">{name}</h3>
          <div className="mt-auto flex items-center justify-between gap-2">
            <Price
              pricePoisha={product.basePricePoisha}
              compareAtPricePoisha={product.compareAtPricePoisha}
              locale={locale}
            />
            <StockBadge stock={totalStock} />
          </div>
        </div>
      </Link>
    </div>
  );
}
