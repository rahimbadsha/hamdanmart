import type { PaymentMethod } from "@/lib/constants";

/**
 * Payment provider abstraction.
 *
 * Every payment method implements this interface. COD is the only available
 * provider today; bKash/Nagad/Rocket/SSLCommerz are registered but report
 * `available: false` until their gateways are configured. Checkout never
 * references a concrete method — it works entirely through this contract.
 */
export interface PaymentInitResult {
  /** Payment status to record immediately after order placement. */
  readonly initialStatus: "PENDING" | "PAID";
  /** Optional URL to redirect the customer to (online gateways). */
  readonly redirectUrl?: string;
}

export interface PaymentContext {
  readonly orderNumber: string;
  readonly amountPoisha: number;
}

export interface PaymentProvider {
  readonly method: PaymentMethod;
  readonly labelEn: string;
  readonly labelBn: string;
  /** Whether this method can be selected at checkout right now. */
  readonly available: boolean;
  /**
   * Called after the order row exists. For COD this is a no-op returning a
   * PENDING payment; online gateways would initiate a session here.
   */
  initiate(context: PaymentContext): Promise<PaymentInitResult>;
}
