// server/routes/voice.js
// Handles Telnyx Call Control webhooks: call.initiated (inbound ring),
// call.hangup. Logs call state into Supabase so call history stays
// accurate even for calls placed/received outside the app's own request
// lifecycle.

const express = require("express");
const { supabaseAdmin } = require("../supabaseAdmin");

const router = express.Router();

router.post("/", async (req, res) => {
  const event = req.body?.data;
  const eventType = event?.event_type;
  const payload = event?.payload;

  try {
    if (eventType === "call.initiated" && payload?.direction === "incoming") {
      await handleInboundRinging(payload);
    } else if (eventType === "call.hangup") {
      await handleHangup(payload);
    }
    res.status(200).json({ received: true });
  } catch (err) {
    console.error("voice webhook error:", err.message);
    res.status(200).json({ received: true, error: err.message });
  }
});

async function handleInboundRinging(payload) {
  const toNumber = payload?.to;
  const fromNumber = payload?.from;
  const callControlId = payload?.call_control_id;

  if (!toNumber) return;

  const { data: numberRow } = await supabaseAdmin
    .from("numbers")
    .select("id")
    .eq("phone_number", toNumber)
    .single();

  if (!numberRow) return;

  await supabaseAdmin.from("call_logs").insert({
    number_id: numberRow.id,
    to_number: fromNumber,
    direction: "inbound",
    status: "ringing",
    telnyx_call_control_id: callControlId,
    duration_seconds: 0,
  });
}

async function handleHangup(payload) {
  const callControlId = payload?.call_control_id;
  if (!callControlId) return;

  await supabaseAdmin
    .from("call_logs")
    .update({
      status: "completed",
      duration_seconds: payload?.call_duration_secs ?? 0,
    })
    .eq("telnyx_call_control_id", callControlId);
}

module.exports = router;
