import { getLocale, getTranslations } from "next-intl/server";

import { formatBDT } from "@/lib/utils";
import type { AppLocale } from "@/i18n/routing";

interface OrderTotalsProps {
  readonly subtotalPoisha: number;
  readonly shippingFeePoisha: number;
  readonly discountPoisha: number;
  readonly totalPoisha: number;
}

export async function OrderTotals({
  subtotalPoisha,
  shippingFeePoisha,
  discountPoisha,
  totalPoisha,
}: OrderTotalsProps): Promise<React.ReactElement> {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations();

  return (
    <dl className="space-y-1.5 text-sm">
      <div className="flex justify-between">
        <dt className="text-muted-foreground">{t("cart.subtotal")}</dt>
        <dd>{formatBDT(subtotalPoisha, locale)}</dd>
      </div>
      {discountPoisha > 0 ? (
        <div className="flex justify-between text-green-700 dark:text-green-500">
          <dt>{t("checkout.discount")}</dt>
          <dd>−{formatBDT(discountPoisha, locale)}</dd>
        </div>
      ) : null}
      <div className="flex justify-between">
        <dt className="text-muted-foreground">{t("checkout.shipping")}</dt>
        <dd>{formatBDT(shippingFeePoisha, locale)}</dd>
      </div>
      <div className="flex justify-between border-t pt-1.5 text-base font-bold">
        <dt>{t("checkout.total")}</dt>
        <dd>{formatBDT(totalPoisha, locale)}</dd>
      </div>
    </dl>
  );
}
