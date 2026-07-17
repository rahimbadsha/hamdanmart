"use client";

import { Heart } from "lucide-react";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

import { toggleWishlistAction } from "../actions";

interface WishlistButtonProps {
  readonly productId: string;
  readonly initialWishlisted: boolean;
  readonly className?: string;
}

export function WishlistButton({
  productId,
  initialWishlisted,
  className,
}: WishlistButtonProps): React.ReactElement {
  const t = useTranslations();
  const router = useRouter();
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [, startTransition] = useTransition();

  function onToggle(): void {
    startTransition(async () => {
      const result = await toggleWishlistAction({ productId });
      if (result.ok) {
        setWishlisted(result.wishlisted);
        toast.success(result.wishlisted ? t("wishlist.added") : t("wishlist.removed"));
      } else if ("loginRequired" in result) {
        router.push("/login");
      } else {
        toast.error(t(result.error));
      }
    });
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon"
      aria-label={t("wishlist.toggle")}
      aria-pressed={wishlisted}
      onClick={onToggle}
      className={cn("rounded-full", className)}
    >
      <Heart
        className={cn("size-4", wishlisted && "fill-destructive text-destructive")}
      />
    </Button>
  );
}
