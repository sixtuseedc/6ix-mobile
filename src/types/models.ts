// src/types/models.ts
// Shared TypeScript interfaces for rows coming back from Supabase and
// Telnyx, so screens/components share one source of truth for shapes.

export interface Profile {
  id: string;
  email: string | null;
  credits: number;
  active_number_id: string | null;
  created_at: string;
}

export interface NumberRow {
  id: string;
  user_id: string;
  phone_number: string;
  telnyx_number_id: string | null;
  country_code: string | null;
  sms_enabled: boolean;
  voice_enabled: boolean;
  status: string;
  created_at: string;
}

export interface Thread {
  id: string;
  number_id: string;
  contact_number: string;
  contact_name: string | null;
  last_message_at: string | null;
  last_message_preview: string | null;
  unread_count: number;
  created_at: string;
}

export type MessageDirection = "inbound" | "outbound";

export interface Message {
  id: string;
  thread_id: string;
  number_id: string;
  to_number: string | null;
  from_number: string | null;
  body: string | null;
  direction: MessageDirection;
  telnyx_message_id: string | null;
  status: string;
  created_at: string;
}

export interface CallLog {
  id: string;
  number_id: string;
  to_number: string | null;
  direction: MessageDirection;
  status: string;
  telnyx_call_control_id: string | null;
  duration_seconds: number;
  created_at: string;
}

export interface AvailableNumber {
  phoneNumber: string;
  region: string;
  features: string[];
  monthlyCost: string | null;
  upfrontCost: string | null;
}

export interface CreditPack {
  id: string;
  label: string;
  credits: number;
  priceLabel: string;
  priceId: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  priceLabel: string;
  priceId: string;
}

// Generic shape PaymentModal accepts — either a credit pack, a
// subscription plan, or an ad-hoc one-off charge (e.g. number purchase).
export interface CheckoutItem {
  id?: string;
  name?: string;
  label?: string;
  description?: string;
  credits?: number;
  priceLabel: string;
  priceId?: string;
}
