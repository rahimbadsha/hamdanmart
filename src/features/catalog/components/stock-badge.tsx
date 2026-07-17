import { getTranslations } from "next-intl/server";

import { Badge } from "@/components/ui/badge";

import { stockLevel } from "../types";

interface StockBadgeProps {
  readonly stock: number;
}

export async function StockBadge({
  stock,
}: StockBadgeProps): Promise<React.ReactElement | null> {
  const t = await getTranslations("catalog");
  const level = stockLevel(stock);

  if (level === "in") return null;
  return (
    <Badge variant={level === "out" ? "destructive" : "secondary"}>
      {level === "out" ? t("outOfStock") : t("lowStock")}
    </Badge>
  );
}
