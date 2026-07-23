// src/payment/plansConfig.js
// Placeholder pricing config. Replace `priceId` values with real
// Stripe Price IDs or Paystack plan codes once a gateway is connected,
// and flip FEATURES.PAYMENTS_ENABLED in src/constants/config.js.

export const CREDIT_PACKS = [
  {
    id: "credits_small",
    label: "Top Up",
    credits: 500,
    priceLabel: "$5.00",
    priceId: "REPLACE_WITH_STRIPE_OR_PAYSTACK_PRICE_ID",
  },
  {
    id: "credits_medium",
    label: "Top Up",
    credits: 1200,
    priceLabel: "$10.00",
    priceId: "REPLACE_WITH_STRIPE_OR_PAYSTACK_PRICE_ID",
  },
  {
    id: "credits_large",
    label: "Top Up",
    credits: 3000,
    priceLabel: "$20.00",
    priceId: "REPLACE_WITH_STRIPE_OR_PAYSTACK_PRICE_ID",
  },
];

export const SUBSCRIPTION_PLANS = [
  {
    id: "plan_basic",
    name: "Basic Line",
    description: "1 virtual number, SMS + calling",
    priceLabel: "$4.99/mo",
    priceId: "REPLACE_WITH_STRIPE_OR_PAYSTACK_PRICE_ID",
  },
  {
    id: "plan_pro",
    name: "Pro",
    description: "3 virtual numbers, priority routing",
    priceLabel: "$12.99/mo",
    priceId: "REPLACE_WITH_STRIPE_OR_PAYSTACK_PRICE_ID",
  },
];

export default { CREDIT_PACKS, SUBSCRIPTION_PLANS };
