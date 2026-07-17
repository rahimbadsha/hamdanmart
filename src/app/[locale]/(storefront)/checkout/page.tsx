import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

import { redirect } from "@/i18n/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { CheckoutForm } from "@/features/checkout/components/checkout-form";
import { getCheckoutData } from "@/features/checkout/services/checkout-service";
import type { CheckoutLineItem, CheckoutPrefill } from "@/features/checkout/types";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("checkout");
  return { title: t("title"), robots: { index: false, follow: false } };
}

export default async function CheckoutPage(): Promise<React.ReactElement> {
  const locale = await getLocale();
  const data = await getCheckoutData();
  if (!data) {
    redirect({ href: "/cart", locale });
    return <></>; // unreachable — redirect() throws
  }

  const t = await getTranslations("checkout");
  const user = await getCurrentUser();

  const items: CheckoutLineItem[] = data.cart.items.map((item) => ({
    nameEn: item.variant.product.nameEn,
    nameBn: item.variant.product.nameBn,
    variantNameEn: item.variant.nameEn,
    variantNameBn: item.variant.nameBn,
    quantity: item.quantity,
    unitPricePoisha: item.variant.pricePoisha,
  }));

  const prefill: CheckoutPrefill | null = data.prefill
    ? {
        customerName: data.prefill.recipientName,
        customerPhone: data.prefill.phone,
        shippingLine1: data.prefill.line1,
        shippingLine2: data.prefill.line2 ?? "",
        shippingCity: data.prefill.city,
        shippingDistrict: data.prefill.district,
        shippingPostalCode: data.prefill.postalCode ?? "",
      }
    : user
      ? {
          customerName: user.name,
          customerPhone: user.phone ?? "",
          shippingLine1: "",
          shippingLine2: "",
          shippingCity: "",
          shippingDistrict: "",
          shippingPostalCode: "",
        }
      : null;

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <CheckoutForm
        items={items}
        subtotalPoisha={data.subtotalPoisha}
        shippingMethods={data.shippingMethods}
        availablePayments={data.availablePayments}
        comingSoonPayments={data.comingSoonPayments}
        prefill={prefill}
        isLoggedIn={user !== null}
      />
    </main>
  );
}
