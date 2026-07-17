import { formatBDT } from "@/lib/utils";
import type { AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

interface PriceProps {
  readonly pricePoisha: number;
  readonly compareAtPricePoisha?: number | null;
  readonly locale: AppLocale;
  readonly className?: string;
}

export function Price({
  pricePoisha,
  compareAtPricePoisha,
  locale,
  className,
}: PriceProps): React.ReactElement {
  const hasDiscount = compareAtPricePoisha != null && compareAtPricePoisha > pricePoisha;

  return (
    <span className={cn("flex items-baseline gap-2", className)}>
      <span className="font-semibold">{formatBDT(pricePoisha, locale)}</span>
      {hasDiscount ? (
        <s className="text-sm text-muted-foreground">
          {formatBDT(compareAtPricePoisha, locale)}
        </s>
      ) : null}
    </span>
  );
}
