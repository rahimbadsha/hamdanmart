"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { removeCartItemAction, updateCartItemAction } from "../actions";

interface CartItemControlsProps {
  readonly itemId: string;
  readonly quantity: number;
  readonly maxQuantity: number;
}

export function CartItemControls({
  itemId,
  quantity,
  maxQuantity,
}: CartItemControlsProps): React.ReactElement {
  const t = useTranslations();
  const [pending, startTransition] = useTransition();

  function setQuantity(next: number): void {
    startTransition(async () => {
      const result = await updateCartItemAction({ itemId, quantity: next });
      if (result && !result.ok) toast.error(t(result.error));
    });
  }

  function remove(): void {
    startTransition(async () => {
      const result = await removeCartItemAction({ itemId });
      if (result && !result.ok) toast.error(t(result.error));
    });
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center rounded-md border">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t("cart.decrease")}
          disabled={pending || quantity <= 1}
          onClick={() => setQuantity(quantity - 1)}
        >
          <Minus className="size-4" />
        </Button>
        <span className="w-8 text-center text-sm" aria-live="polite">
          {quantity}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t("cart.increase")}
          disabled={pending || quantity >= maxQuantity}
          onClick={() => setQuantity(quantity + 1)}
        >
          <Plus className="size-4" />
        </Button>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={t("cart.remove")}
        disabled={pending}
        onClick={remove}
      >
        <Trash2 className="size-4 text-destructive" />
      </Button>
    </div>
  );
}
