import type { PaymentMethod } from "@/lib/constants";

import { codProvider } from "./cod-provider";
import type { PaymentProvider } from "./types";

/**
 * Registry of payment providers.
 *
 * Online gateways are placeholders (available: false) so the UI can show them
 * as "coming soon" while keeping a single source of truth. Wiring a gateway
 * later means implementing its `initiate` and flipping `available` — no
 * checkout changes.
 */
function placeholder(
  method: PaymentMethod,
  labelEn: string,
  labelBn: string,
): PaymentProvider {
  return {
    method,
    labelEn,
    labelBn,
    available: false,
    async initiate() {
      throw new Error(`${method} gateway is not configured`);
    },
  };
}

const PROVIDERS: readonly PaymentProvider[] = [
  codProvider,
  placeholder("BKASH", "bKash", "বিকাশ"),
  placeholder("NAGAD", "Nagad", "নগদ"),
  placeholder("ROCKET", "Rocket", "রকেট"),
  placeholder("SSLCOMMERZ", "Card / Mobile Banking", "কার্ড / মোবাইল ব্যাংকিং"),
];

export function getPaymentProvider(method: PaymentMethod): PaymentProvider {
  const provider = PROVIDERS.find((entry) => entry.method === method);
  if (!provider) throw new Error(`Unknown payment method: ${method}`);
  return provider;
}

export function getAvailablePaymentMethods(): Array<{
  method: PaymentMethod;
  labelEn: string;
  labelBn: string;
}> {
  return PROVIDERS.filter((provider) => provider.available).map((provider) => ({
    method: provider.method,
    labelEn: provider.labelEn,
    labelBn: provider.labelBn,
  }));
}

export function getComingSoonPaymentMethods(): Array<{
  method: PaymentMethod;
  labelEn: string;
  labelBn: string;
}> {
  return PROVIDERS.filter((provider) => !provider.available).map((provider) => ({
    method: provider.method,
    labelEn: provider.labelEn,
    labelBn: provider.labelBn,
  }));
}
