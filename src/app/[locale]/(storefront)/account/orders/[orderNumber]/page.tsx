import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";

import { redirect } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { AppError } from "@/lib/errors";
import { OrderDetailView } from "@/features/orders/components/order-detail-view";
import { getMyOrder } from "@/features/orders/services/order-service";

export const metadata: Metadata = { robots: { index: false, follow: false } };

interface OrderPageProps {
  readonly params: Promise<{ orderNumber: string }>;
}

export default async function AccountOrderPage({
  params,
}: OrderPageProps): Promise<React.ReactElement> {
  const { orderNumber } = await params;
  const locale = await getLocale();
  const user = await getCurrentUser();
  if (!user) {
    redirect({ href: "/login", locale });
    return <></>; // unreachable — redirect() throws
  }

  let order;
  try {
    order = await getMyOrder(orderNumber);
  } catch (error) {
    if (error instanceof AppError) notFound();
    throw error;
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6">
      <OrderDetailView order={order} />
    </main>
  );
}
