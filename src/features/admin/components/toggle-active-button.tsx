"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Switch } from "@/components/ui/switch";

import { adminToggleProductAction } from "../actions/product-actions";

interface ToggleActiveButtonProps {
  readonly productId: string;
  readonly isActive: boolean;
}

export function ToggleActiveButton({
  productId,
  isActive,
}: ToggleActiveButtonProps): React.ReactElement {
  const [pending, startTransition] = useTransition();

  function onToggle(checked: boolean): void {
    startTransition(async () => {
      const result = await adminToggleProductAction({
        productId,
        isActive: checked,
      });
      if (result && !result.ok) toast.error(result.error);
    });
  }

  return (
    <Switch
      checked={isActive}
      onCheckedChange={onToggle}
      disabled={pending}
      aria-label="Toggle product active"
    />
  );
}
