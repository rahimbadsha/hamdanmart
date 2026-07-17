"use client";

import { Badge } from "@/components/ui/badge";
import type { ActionResult } from "@/lib/action-result";

import {
  adminUpdateInventoryAction,
  adminUpdateVariantPriceAction,
} from "../actions/product-actions";
import { InlineEditField } from "./inline-edit-field";

interface VariantRowProps {
  readonly variantId: string;
  readonly nameEn: string;
  readonly sku: string;
  readonly pricePoisha: number;
  readonly compareAtPricePoisha: number | null;
  readonly stockQuantity: number;
}

export function VariantRow({
  variantId,
  nameEn,
  sku,
  pricePoisha,
  compareAtPricePoisha,
  stockQuantity,
}: VariantRowProps): React.ReactElement {
  async function onPriceSave(value: number): Promise<ActionResult> {
    return adminUpdateVariantPriceAction({
      variantId,
      pricePoisha: value,
      compareAtPricePoisha,
    });
  }

  async function onStockSave(value: number): Promise<ActionResult> {
    return adminUpdateInventoryAction({ variantId, quantity: value });
  }

  return (
    <tr className="border-b">
      <td className="py-2">{nameEn}</td>
      <td className="py-2 font-mono text-xs">{sku}</td>
      <td className="py-2 text-right">
        <InlineEditField
          value={pricePoisha}
          label="Price (poisha)"
          onSave={onPriceSave}
        />
      </td>
      <td className="py-2 text-center">
        <InlineEditField
          value={stockQuantity}
          label="Stock quantity"
          onSave={onStockSave}
        />
      </td>
      <td className="py-2 text-center">
        <Badge
          variant={
            stockQuantity === 0
              ? "destructive"
              : stockQuantity < 5
                ? "secondary"
                : "outline"
          }
        >
          {stockQuantity === 0 ? "Out of stock" : stockQuantity < 5 ? "Low" : "In stock"}
        </Badge>
      </td>
    </tr>
  );
}
