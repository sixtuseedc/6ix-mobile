// src/constants/config.js
// Single place that reads process.env so the rest of the app never touches
// EXPO_PUBLIC_* strings directly. Makes it trivial to swap in a config
// service later without hunting through every screen.

export const CONFIG = {
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",

  TELNYX_API_KEY: process.env.EXPO_PUBLIC_TELNYX_API_KEY ?? "",
  TELNYX_CONNECTION_ID: process.env.EXPO_PUBLIC_TELNYX_CONNECTION_ID ?? "",
  TELNYX_MESSAGING_PROFILE_ID:
    process.env.EXPO_PUBLIC_TELNYX_MESSAGING_PROFILE_ID ?? "",

  WEBHOOK_BASE_URL: process.env.EXPO_PUBLIC_WEBHOOK_BASE_URL ?? "",

  STRIPE_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
  PAYSTACK_PUBLIC_KEY: process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "",
};

export const TELNYX_API_BASE = "https://api.telnyx.com/v2";

// Feature flags — flip these as backend pieces come online.
export const FEATURES = {
  PAYMENTS_ENABLED: false, // flip on once a real gateway is wired into /payment
  VOICE_CALLS_ENABLED: true,
};
