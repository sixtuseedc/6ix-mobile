// src/api/supabase.js
// Supabase client + thin data-access helpers used by screens/context.
// Keeping raw table/query logic here means screens never import
// @supabase/supabase-js directly.

import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { CONFIG } from "../constants/config";

export const supabase = createClient(
  CONFIG.SUPABASE_URL,
  CONFIG.SUPABASE_ANON_KEY,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

/* ---------------------------- Auth helpers ---------------------------- */

export async function signUpWithEmail(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function getSession() {
  return supabase.auth.getSession();
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}

/* --------------------------- Profile helpers --------------------------- */

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}

export async function upsertProfile(profile) {
  const { data, error } = await supabase
    .from("profiles")
    .upsert(profile)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* ------------------------- Virtual number helpers ----------------------- */

export async function getUserNumbers(userId) {
  const { data, error } = await supabase
    .from("numbers")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function saveProvisionedNumber({
  userId,
  phoneNumber,
  telnyxNumberId,
  countryCode,
  smsEnabled,
  voiceEnabled,
}) {
  const { data, error } = await supabase
    .from("numbers")
    .insert({
      user_id: userId,
      phone_number: phoneNumber,
      telnyx_number_id: telnyxNumberId,
      country_code: countryCode,
      sms_enabled: smsEnabled,
      voice_enabled: voiceEnabled,
      status: "active",
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function setActiveNumber(userId, numberId) {
  const { error } = await supabase
    .from("profiles")
    .update({ active_number_id: numberId })
    .eq("id", userId);
  if (error) throw error;
}

/* --------------------------- Messaging helpers -------------------------- */

export async function getThreadsForNumber(numberId) {
  const { data, error } = await supabase
    .from("threads")
    .select("*")
    .eq("number_id", numberId)
    .order("last_message_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getMessagesForThread(threadId) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function saveOutboundMessage({
  threadId,
  numberId,
  toNumber,
  body,
  telnyxMessageId,
}) {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      thread_id: threadId,
      number_id: numberId,
      to_number: toNumber,
      body,
      direction: "outbound",
      telnyx_message_id: telnyxMessageId,
      status: "sent",
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* ----------------------------- Call helpers ----------------------------- */

export async function getCallLogsForNumber(numberId) {
  const { data, error } = await supabase
    .from("call_logs")
    .select("*")
    .eq("number_id", numberId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function saveCallLog({
  numberId,
  toNumber,
  direction,
  status,
  telnyxCallControlId,
  durationSeconds,
}) {
  const { data, error } = await supabase
    .from("call_logs")
    .insert({
      number_id: numberId,
      to_number: toNumber,
      direction,
      status,
      telnyx_call_control_id: telnyxCallControlId,
      duration_seconds: durationSeconds ?? 0,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* ---------------------------- Realtime helper ---------------------------- */

// Subscribe to new inbound messages for a given number so MessagesScreen /
// ChatCallScreen can update live without polling.
export function subscribeToMessages(numberId, onInsert) {
  const channel = supabase
    .channel(`messages-number-${numberId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `number_id=eq.${numberId}`,
      },
      (payload) => onInsert(payload.new)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
