import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatBDT } from "@/lib/utils";
import { ToggleActiveButton } from "@/features/admin/components/toggle-active-button";
import { getAdminProducts } from "@/features/admin/services/admin-product-service";

export const metadata: Metadata = { title: "Products — HamdanMart Admin" };

interface ProductsPageProps {
  readonly searchParams: Promise<{
    search?: string;
    category?: string;
    page?: string;
  }>;
}

export default async function AdminProductsPage({
  searchParams,
}: ProductsPageProps): Promise<React.ReactElement> {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const { products, total } = await getAdminProducts({
    search: params.search,
    categoryId: params.category,
    page,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <p className="text-sm text-muted-foreground">{total} products</p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Variants</TableHead>
              <TableHead className="text-right">Base Price</TableHead>
              <TableHead className="text-center">Stock</TableHead>
              <TableHead className="text-center">Active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const totalStock = product.variants.reduce(
                (sum, v) => sum + (v.inventory?.quantity ?? 0),
                0,
              );
              return (
                <TableRow key={product.id}>
                  <TableCell>
                    <Link
                      href={`/admin/products/${product.slug}`}
                      className="font-medium hover:underline"
                    >
                      {product.nameEn}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {product.category?.nameEn ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.variants.length}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatBDT(product.basePricePoisha)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        totalStock === 0
                          ? "destructive"
                          : totalStock < 5
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {totalStock}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <ToggleActiveButton
                      productId={product.id}
                      isActive={product.isActive}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
