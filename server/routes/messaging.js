// server/routes/messaging.js
// Handles Telnyx messaging webhooks: message.received (inbound SMS) and
// message.sent / message.finalized (delivery status updates).

const express = require("express");
const { supabaseAdmin } = require("../supabaseAdmin");

const router = express.Router();

router.post("/", async (req, res) => {
  const event = req.body?.data;
  const eventType = event?.event_type;

  try {
    if (eventType === "message.received") {
      await handleInbound(event.payload);
    } else if (eventType === "message.finalized" || eventType === "message.sent") {
      await handleStatusUpdate(event.payload);
    }
    res.status(200).json({ received: true });
  } catch (err) {
    console.error("messaging webhook error:", err.message);
    res.status(200).json({ received: true, error: err.message });
  }
});

async function handleInbound(payload) {
  const toNumber = payload?.to?.[0]?.phone_number;
  const fromNumber = payload?.from?.phone_number;
  const body = payload?.text;
  const telnyxMessageId = payload?.id;

  if (!toNumber || !fromNumber) return;

  const { data: numberRow } = await supabaseAdmin
    .from("numbers")
    .select("id, user_id")
    .eq("phone_number", toNumber)
    .single();

  if (!numberRow) return;

  let { data: thread } = await supabaseAdmin
    .from("threads")
    .select("id")
    .eq("number_id", numberRow.id)
    .eq("contact_number", fromNumber)
    .maybeSingle();

  if (!thread) {
    const { data: newThread } = await supabaseAdmin
      .from("threads")
      .insert({
        number_id: numberRow.id,
        contact_number: fromNumber,
        last_message_at: new Date().toISOString(),
        last_message_preview: body,
        unread_count: 1,
      })
      .select()
      .single();
    thread = newThread;
  } else {
    const { data: current } = await supabaseAdmin
      .from("threads")
      .select("unread_count")
      .eq("id", thread.id)
      .single();

    await supabaseAdmin
      .from("threads")
      .update({
        last_message_at: new Date().toISOString(),
        last_message_preview: body,
        unread_count: (current?.unread_count ?? 0) + 1,
      })
      .eq("id", thread.id);
  }

  await supabaseAdmin.from("messages").insert({
    thread_id: thread.id,
    number_id: numberRow.id,
    to_number: toNumber,
    from_number: fromNumber,
    body,
    direction: "inbound",
    telnyx_message_id: telnyxMessageId,
    status: "received",
  });
}

async function handleStatusUpdate(payload) {
  const telnyxMessageId = payload?.id;
  const status = payload?.to?.[0]?.status;
  if (!telnyxMessageId || !status) return;

  await supabaseAdmin
    .from("messages")
    .update({ status })
    .eq("telnyx_message_id", telnyxMessageId);
}

module.exports = router;
