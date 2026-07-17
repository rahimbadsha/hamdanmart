import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/lib/constants";

const VARIANT: Record<OrderStatus, "default" | "secondary" | "destructive"> = {
  PENDING: "secondary",
  CONFIRMED: "secondary",
  PROCESSING: "secondary",
  SHIPPED: "default",
  DELIVERED: "default",
  CANCELLED: "destructive",
};

interface OrderStatusBadgeProps {
  readonly status: string;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps): React.ReactElement {
  const t = useTranslations("orders.status");
  return (
    <Badge variant={VARIANT[status as OrderStatus] ?? "secondary"}>{t(status)}</Badge>
  );
}
