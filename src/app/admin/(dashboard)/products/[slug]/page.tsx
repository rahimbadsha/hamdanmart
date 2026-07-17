import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBDT } from "@/lib/utils";
import { ToggleActiveButton } from "@/features/admin/components/toggle-active-button";
import { VariantRow } from "@/features/admin/components/variant-row";
import { getAdminProduct } from "@/features/admin/services/admin-product-service";

export const metadata: Metadata = { title: "Product Detail — HamdanMart Admin" };

interface ProductPageProps {
  readonly params: Promise<{ slug: string }>;
}

export default async function AdminProductDetailPage({
  params,
}: ProductPageProps): Promise<React.ReactElement> {
  const { slug } = await params;
  let product;
  try {
    product = await getAdminProduct(slug);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">{product.nameEn}</h1>
          <p className="text-sm text-muted-foreground">{product.nameBn}</p>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant="outline">{product.category?.nameEn}</Badge>
            <Badge variant={product.isFeatured ? "default" : "secondary"}>
              {product.isFeatured ? "Featured" : "Standard"}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Active</span>
          <ToggleActiveButton productId={product.id} isActive={product.isActive} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Slug</span>
              <span className="font-mono">{product.slug}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Base Price</span>
              <span>{formatBDT(product.basePricePoisha)}</span>
            </div>
            {product.compareAtPricePoisha ? (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Compare Price</span>
                <span className="line-through">
                  {formatBDT(product.compareAtPricePoisha)}
                </span>
              </div>
            ) : null}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Images</span>
              <span>{product.images.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent className="text-sm whitespace-pre-wrap text-muted-foreground">
            {product.descriptionEn || "No description"}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Variants ({product.variants.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2">Variant</th>
                <th className="py-2">SKU</th>
                <th className="py-2 text-right">Price (poisha)</th>
                <th className="py-2 text-center">Stock</th>
                <th className="py-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {product.variants.map((variant) => (
                <VariantRow
                  key={variant.id}
                  variantId={variant.id}
                  nameEn={variant.nameEn}
                  sku={variant.sku}
                  pricePoisha={variant.pricePoisha}
                  compareAtPricePoisha={variant.compareAtPricePoisha}
                  stockQuantity={variant.inventory?.quantity ?? 0}
                />
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
