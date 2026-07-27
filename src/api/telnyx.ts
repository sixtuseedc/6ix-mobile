// src/api/telnyx.ts
// Thin wrapper around the Telnyx REST API (Numbers, Messaging, Call Control).
//
// SECURITY NOTE: shipping a raw Telnyx API key inside a mobile/web client is
// only acceptable for local development/testing. In production, proxy these
// calls through the Render backend (see /server) so the API key never ships
// inside the installed app or web bundle.

import { CONFIG, TELNYX_API_BASE } from "../constants/config";
import type { AvailableNumber } from "../types/models";

function authHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${CONFIG.TELNYX_API_KEY}`,
    "Content-Type": "application/json",
  };
}

async function telnyxRequest<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${TELNYX_API_BASE}${path}`, {
    ...options,
    headers: {
      ...authHeaders(),
      ...(options.headers as Record<string, string> | undefined),
    },
  });

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      json?.errors?.[0]?.detail || `Telnyx request failed (${response.status})`;
    throw new Error(message);
  }

  return json as T;
}

/* ------------------------------ Numbers API ------------------------------ */

export async function searchAvailableNumbers(params: {
  countryCode?: string;
  areaCode?: string;
  limit?: number;
  features?: string[];
} = {}): Promise<AvailableNumber[]> {
  const {
    countryCode = "US",
    areaCode = "",
    limit = 20,
    features = ["sms", "voice"],
  } = params;

  const query = new URLSearchParams({
    "filter[country_code]": countryCode,
    "filter[limit]": String(limit),
    "filter[features][]": features.join(","),
  });
  if (areaCode) query.set("filter[national_destination_code]", areaCode);

  const json = await telnyxRequest<{ data: any[] }>(`/available_phone_numbers?${query.toString()}`);

  return (json?.data || []).map((entry) => ({
    phoneNumber: entry.phone_number,
    region: entry.region_information?.[0]?.region_name ?? "",
    features: entry.features?.map((f: any) => f.name) ?? [],
    monthlyCost: entry.cost_information?.monthly_cost ?? null,
    upfrontCost: entry.cost_information?.upfront_cost ?? null,
  }));
}

export async function provisionNumber(phoneNumber: string) {
  const order = await telnyxRequest<{ data: any }>("/number_orders", {
    method: "POST",
    body: JSON.stringify({
      phone_numbers: [{ phone_number: phoneNumber }],
      messaging_profile_id: CONFIG.TELNYX_MESSAGING_PROFILE_ID || undefined,
      connection_id: CONFIG.TELNYX_CONNECTION_ID || undefined,
    }),
  });

  const purchased = order?.data?.phone_numbers?.[0];

  return {
    telnyxNumberId: purchased?.id as string | undefined,
    phoneNumber: (purchased?.phone_number ?? phoneNumber) as string,
    status: (order?.data?.status ?? "pending") as string,
  };
}

export async function releaseNumber(telnyxNumberId: string) {
  await telnyxRequest(`/phone_numbers/${telnyxNumberId}`, { method: "DELETE" });
  return true;
}

/* ------------------------------ Messaging API ------------------------------ */

export async function sendSms(params: { from: string; to: string; text: string }) {
  const json = await telnyxRequest<{ data: any }>("/messages", {
    method: "POST",
    body: JSON.stringify({
      from: params.from,
      to: params.to,
      text: params.text,
      messaging_profile_id: CONFIG.TELNYX_MESSAGING_PROFILE_ID || undefined,
    }),
  });

  return {
    telnyxMessageId: json?.data?.id as string | undefined,
    status: (json?.data?.to?.[0]?.status ?? "queued") as string,
  };
}

export function parseInboundMessageWebhook(payload: any) {
  const message = payload?.data?.payload;
  if (!message) return null;

  return {
    telnyxMessageId: message.id as string,
    fromNumber: message.from?.phone_number as string,
    toNumber: message.to?.[0]?.phone_number as string,
    body: message.text as string,
    receivedAt: message.received_at as string,
  };
}

/* -------------------------------- Voice API -------------------------------- */

export async function startCall(params: { from: string; to: string }) {
  const json = await telnyxRequest<{ data: any }>("/calls", {
    method: "POST",
    body: JSON.stringify({
      connection_id: CONFIG.TELNYX_CONNECTION_ID,
      from: params.from,
      to: params.to,
    }),
  });

  return {
    callControlId: json?.data?.call_control_id as string | undefined,
    callSessionId: json?.data?.call_session_id as string | undefined,
  };
}

export async function hangupCall(callControlId: string) {
  await telnyxRequest(`/calls/${callControlId}/actions/hangup`, {
    method: "POST",
    body: JSON.stringify({}),
  });
  return true;
}

export async function muteCall(callControlId: string, currentlyMuted: boolean) {
  const action = currentlyMuted ? "unmute" : "mute";
  await telnyxRequest(`/calls/${callControlId}/actions/${action}`, {
    method: "POST",
    body: JSON.stringify({}),
  });
  return true;
}

export function parseInboundCallWebhook(payload: any) {
  const call = payload?.data?.payload;
  if (!call) return null;

  return {
    callControlId: call.call_control_id as string,
    fromNumber: call.from as string,
    toNumber: call.to as string,
    state: call.state as string,
  };
}
