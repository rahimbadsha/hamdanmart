import type { PaymentInitResult, PaymentProvider } from "./types";

/** Cash on Delivery — the default, always-available method. */
export const codProvider: PaymentProvider = {
  method: "COD",
  labelEn: "Cash on Delivery",
  labelBn: "ক্যাশ অন ডেলিভারি",
  available: true,
  async initiate(): Promise<PaymentInitResult> {
    // Payment is collected by the courier; nothing to do online.
    return { initialStatus: "PENDING" };
  },
};
