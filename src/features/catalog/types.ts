/** Client-safe plain types passed from server components to client islands. */

export interface VariantOption {
  readonly id: string;
  readonly nameEn: string;
  readonly nameBn: string;
  readonly pricePoisha: number;
  readonly compareAtPricePoisha: number | null;
  readonly stock: number;
}

export interface RecentProduct {
  readonly slug: string;
  readonly nameEn: string;
  readonly nameBn: string;
  readonly pricePoisha: number;
}

export const LOW_STOCK_THRESHOLD = 5;

export type StockLevel = "in" | "low" | "out";

export function stockLevel(stock: number): StockLevel {
  if (stock <= 0) return "out";
  if (stock <= LOW_STOCK_THRESHOLD) return "low";
  return "in";
}
