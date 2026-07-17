import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requirePermission } from "@/lib/auth/guards";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Inventory — HamdanMart Admin" };

export default async function AdminInventoryPage(): Promise<React.ReactElement> {
  await requirePermission("inventory.read");

  const variants = await db.productVariant.findMany({
    include: {
      product: { select: { nameEn: true, slug: true } },
      inventory: true,
    },
    orderBy: [{ product: { nameEn: "asc" } }, { sortOrder: "asc" }],
  });

  const lowStock = variants.filter((v) => (v.inventory?.quantity ?? 0) < 5);
  const outOfStock = variants.filter((v) => (v.inventory?.quantity ?? 0) === 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <div className="flex gap-2 text-sm">
          <Badge variant="destructive">{outOfStock.length} out of stock</Badge>
          <Badge variant="secondary">{lowStock.length} low stock</Badge>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Variant</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-center">Quantity</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.map((variant) => {
              const qty = variant.inventory?.quantity ?? 0;
              return (
                <TableRow
                  key={variant.id}
                  className={
                    qty === 0
                      ? "bg-destructive/5"
                      : qty < 5
                        ? "bg-yellow-50 dark:bg-yellow-950/20"
                        : ""
                  }
                >
                  <TableCell className="font-medium">{variant.product.nameEn}</TableCell>
                  <TableCell>{variant.nameEn}</TableCell>
                  <TableCell className="font-mono text-xs">{variant.sku}</TableCell>
                  <TableCell className="text-center font-bold">{qty}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        qty === 0 ? "destructive" : qty < 5 ? "secondary" : "outline"
                      }
                    >
                      {qty === 0 ? "Out" : qty < 5 ? "Low" : "OK"}
                    </Badge>
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
