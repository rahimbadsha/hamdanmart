import { getTranslations } from "next-intl/server";

import { wishlistedIds } from "@/features/wishlist/services/wishlist-service";

import type { ProductForCard } from "../repositories/product-repository";
import { ProductCard } from "./product-card";

interface ProductGridProps {
  readonly products: readonly ProductForCard[];
}

export async function ProductGrid({
  products,
}: ProductGridProps): Promise<React.ReactElement> {
  if (products.length === 0) {
    const t = await getTranslations("catalog");
    return <p className="py-16 text-center text-muted-foreground">{t("noProducts")}</p>;
  }

  const wishlisted = await wishlistedIds(products.map((product) => product.id));

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          wishlisted={wishlisted.has(product.id)}
        />
      ))}
    </div>
  );
}
