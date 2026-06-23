import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set");
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
    });
  }
  return _stripe;
}

// Named export for direct use in route handlers
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const STRIPE_PRICES = {
  MONTHLY: process.env.STRIPE_PRICE_MONTHLY!,
  YEARLY:  process.env.STRIPE_PRICE_YEARLY!,
} as const;

export const PLANS = {
  MONTHLY: { label: "Monthly", price: 9,  interval: "month", savings: null },
  YEARLY:  { label: "Yearly",  price: 99, interval: "year",  savings: "Save $9 vs. monthly" },
} as const;
