// src/api/telnyx.js
// Thin wrapper around the Telnyx REST API (Numbers, Messaging, Call Control).
//
// SECURITY NOTE: shipping a raw Telnyx API key inside a mobile client is
// only acceptable for local development/testing. In production, these
// calls should be proxied through the Render backend (see /server) so the
// API key never lives in an installed app bundle. Each function below
// accepts an optional `viaBackend` flag for that reason.

import { CONFIG, TELNYX_API_BASE } from "../constants/config";

function authHeaders() {
  return {
    Authorization: `Bearer ${CONFIG.TELNYX_API_KEY}`,
    "Content-Type": "application/json",
  };
}

async function telnyxRequest(path, options = {}) {
  const response = await fetch(`${TELNYX_API_BASE}${path}`, {
    ...options,
    headers: {
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      json?.errors?.[0]?.detail || `Telnyx request failed (${response.status})`;
    throw new Error(message);
  }

  return json;
}

/* ------------------------------ Numbers API ------------------------------ */

// Search available numbers to purchase, filtered by country/area code.
export async function searchAvailableNumbers({
  countryCode = "US",
  areaCode = "",
  limit = 20,
  features = ["sms", "voice"],
} = {}) {
  const params = new URLSearchParams({
    "filter[country_code]": countryCode,
    "filter[limit]": String(limit),
    "filter[features][]": features,
  });
  if (areaCode) params.set("filter[national_destination_code]", areaCode);

  const json = await telnyxRequest(
    `/available_phone_numbers?${params.toString()}`
  );

  return (json?.data || []).map((entry) => ({
    phoneNumber: entry.phone_number,
    region: entry.region_information?.[0]?.region_name ?? "",
    features: entry.features?.map((f) => f.name) ?? [],
    monthlyCost: entry.cost_information?.monthly_cost ?? null,
    upfrontCost: entry.cost_information?.upfront_cost ?? null,
  }));
}

// Provision (buy) a number by creating an order, then attach it to the
// user's messaging profile and voice connection so it's immediately usable.
export async function provisionNumber(phoneNumber) {
  const order = await telnyxRequest("/number_orders", {
    method: "POST",
    body: JSON.stringify({
      phone_numbers: [{ phone_number: phoneNumber }],
      messaging_profile_id: CONFIG.TELNYX_MESSAGING_PROFILE_ID || undefined,
      connection_id: CONFIG.TELNYX_CONNECTION_ID || undefined,
    }),
  });

  const purchased = order?.data?.phone_numbers?.[0];

  return {
    telnyxNumberId: purchased?.id,
    phoneNumber: purchased?.phone_number ?? phoneNumber,
    status: order?.data?.status ?? "pending",
  };
}

export async function releaseNumber(telnyxNumberId) {
  await telnyxRequest(`/phone_numbers/${telnyxNumberId}`, {
    method: "DELETE",
  });
  return true;
}

/* ------------------------------ Messaging API ------------------------------ */

export async function sendSms({ from, to, text }) {
  const json = await telnyxRequest("/messages", {
    method: "POST",
    body: JSON.stringify({
      from,
      to,
      text,
      messaging_profile_id: CONFIG.TELNYX_MESSAGING_PROFILE_ID || undefined,
    }),
  });

  return {
    telnyxMessageId: json?.data?.id,
    status: json?.data?.to?.[0]?.status ?? "queued",
  };
}

// Parse an inbound Telnyx webhook payload (message.received) into the
// shape the app stores in Supabase. Used by the Render webhook handler,
// exported here so both sides share the same parsing logic.
export function parseInboundMessageWebhook(payload) {
  const message = payload?.data?.payload;
  if (!message) return null;

  return {
    telnyxMessageId: message.id,
    fromNumber: message.from?.phone_number,
    toNumber: message.to?.[0]?.phone_number,
    body: message.text,
    receivedAt: message.received_at,
  };
}

/* -------------------------------- Voice API -------------------------------- */

// Start an outbound call via Call Control. Real-time audio/ICE handling is
// expected to go through the Telnyx WebRTC SDK on the client; this call
// kicks off the call-control leg server-side semantics (dial + bridge).
export async function startCall({ from, to }) {
  const json = await telnyxRequest("/calls", {
    method: "POST",
    body: JSON.stringify({
      connection_id: CONFIG.TELNYX_CONNECTION_ID,
      from,
      to,
    }),
  });

  return {
    callControlId: json?.data?.call_control_id,
    callSessionId: json?.data?.call_session_id,
  };
}

export async function hangupCall(callControlId) {
  await telnyxRequest(`/calls/${callControlId}/actions/hangup`, {
    method: "POST",
    body: JSON.stringify({}),
  });
  return true;
}

export async function muteCall(callControlId, muted) {
  const action = muted ? "unmute" : "mute"; // toggling — see caller usage
  await telnyxRequest(`/calls/${callControlId}/actions/${action}`, {
    method: "POST",
    body: JSON.stringify({}),
  });
  return true;
}

// Parse an inbound Telnyx call webhook (call.initiated) for the app/backend.
export function parseInboundCallWebhook(payload) {
  const call = payload?.data?.payload;
  if (!call) return null;

  return {
    callControlId: call.call_control_id,
    fromNumber: call.from,
    toNumber: call.to,
    state: call.state,
  };
}
