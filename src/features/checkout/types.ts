import type { PaymentMethod } from "@/lib/constants";

/** Client-safe shapes passed from the checkout page to the form island. */

export interface CheckoutLineItem {
  readonly nameEn: string;
  readonly nameBn: string;
  readonly variantNameEn: string;
  readonly variantNameBn: string;
  readonly quantity: number;
  readonly unitPricePoisha: number;
}

export interface CheckoutShippingOption {
  readonly id: string;
  readonly nameEn: string;
  readonly nameBn: string;
  readonly feePoisha: number;
}

export interface CheckoutPaymentOption {
  readonly method: PaymentMethod;
  readonly labelEn: string;
  readonly labelBn: string;
}

export interface CheckoutPrefill {
  readonly customerName: string;
  readonly customerPhone: string;
  readonly shippingLine1: string;
  readonly shippingLine2: string;
  readonly shippingCity: string;
  readonly shippingDistrict: string;
  readonly shippingPostalCode: string;
}
