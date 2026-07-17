"use client";

import { Minus, Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { addToCartAction } from "@/features/cart/actions";
import { formatBDT } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { AppLocale } from "@/i18n/routing";

import { stockLevel, type VariantOption } from "../types";

interface AddToCartPanelProps {
  readonly variants: readonly VariantOption[];
}

const MAX_QTY = 20;

export function AddToCartPanel({ variants }: AddToCartPanelProps): React.ReactElement {
  const t = useTranslations();
  const locale = useLocale() as AppLocale;
  const [selectedId, setSelectedId] = useState(
    variants.find((variant) => variant.stock > 0)?.id ?? variants[0]?.id ?? "",
  );
  const [quantity, setQuantity] = useState(1);
  const [pending, startTransition] = useTransition();

  const selected = variants.find((variant) => variant.id === selectedId);
  const stock = selected?.stock ?? 0;
  const level = stockLevel(stock);
  const maxQty = Math.min(Math.max(stock, 1), MAX_QTY);

  function onAdd(): void {
    if (!selected) return;
    startTransition(async () => {
      const result = await addToCartAction({
        variantId: selected.id,
        quantity,
      });
      if (result && !result.ok) {
        toast.error(t(result.error));
      } else {
        toast.success(t("cart.added"));
        setQuantity(1);
      }
    });
  }

  return (
    <div className="space-y-4">
      {variants.length > 1 ? (
        <div className="space-y-2">
          <span className="text-sm font-medium">{t("catalog.variant")}</span>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                aria-pressed={variant.id === selectedId}
                disabled={variant.stock <= 0}
                onClick={() => {
                  setSelectedId(variant.id);
                  setQuantity(1);
                }}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-sm transition-colors",
                  variant.id === selectedId
                    ? "border-primary bg-primary text-primary-foreground"
                    : "hover:bg-secondary",
                  variant.stock <= 0 && "cursor-not-allowed opacity-40 line-through",
                )}
              >
                {locale === "bn" ? variant.nameBn : variant.nameEn}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {selected ? (
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold">
            {formatBDT(selected.pricePoisha, locale)}
          </span>
          {selected.compareAtPricePoisha &&
          selected.compareAtPricePoisha > selected.pricePoisha ? (
            <s className="text-muted-foreground">
              {formatBDT(selected.compareAtPricePoisha, locale)}
            </s>
          ) : null}
          {level === "out" ? (
            <Badge variant="destructive">{t("catalog.outOfStock")}</Badge>
          ) : level === "low" ? (
            <Badge variant="secondary">{t("catalog.lowStock")}</Badge>
          ) : (
            <Badge variant="secondary">{t("catalog.inStock")}</Badge>
          )}
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-md border">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t("cart.decrease")}
            disabled={quantity <= 1}
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
          >
            <Minus className="size-4" />
          </Button>
          <span className="w-10 text-center text-sm font-medium" aria-live="polite">
            {quantity}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t("cart.increase")}
            disabled={quantity >= maxQty}
            onClick={() => setQuantity((current) => Math.min(maxQty, current + 1))}
          >
            <Plus className="size-4" />
          </Button>
        </div>
        <Button
          type="button"
          className="flex-1"
          disabled={pending || level === "out" || !selected}
          onClick={onAdd}
        >
          {pending ? t("common.loading") : t("cart.addToCart")}
        </Button>
      </div>
    </div>
  );
}
