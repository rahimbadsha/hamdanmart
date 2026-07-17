import { getLocale, getTranslations } from "next-intl/server";

import { formatDateTime } from "@/lib/utils";
import type { AppLocale } from "@/i18n/routing";
import type { OrderDetail } from "../repositories/order-repository";

interface OrderTimelineProps {
  readonly history: OrderDetail["statusHistory"];
}

export async function OrderTimeline({
  history,
}: OrderTimelineProps): Promise<React.ReactElement> {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations("orders.status");

  return (
    <ol className="space-y-4">
      {history.map((entry, index) => (
        <li key={entry.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span
              className={`mt-1 size-3 rounded-full ${
                index === history.length - 1 ? "bg-primary" : "bg-muted-foreground"
              }`}
            />
            {index < history.length - 1 ? (
              <span className="w-px flex-1 bg-border" />
            ) : null}
          </div>
          <div className="pb-2">
            <p className="font-medium">{t(entry.toStatus)}</p>
            <p className="text-sm text-muted-foreground">
              {formatDateTime(entry.createdAt, locale)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
