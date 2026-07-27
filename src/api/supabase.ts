// src/api/supabase.ts
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { CONFIG } from "../constants/config";
import type { CallLog, Message, NumberRow, Profile, Thread } from "../types/models";

let cachedSupabase: SupabaseClient | null = null;

export const getSupabase = () => {
  if (cachedSupabase) return cachedSupabase;

  const safeStorage = {
    getItem: (key: string) => {
      if (typeof window === "undefined") return Promise.resolve(null);
      return AsyncStorage.getItem(key);
    },
    setItem: (key: string, value: string) => {
      if (typeof window === "undefined") return Promise.resolve();
      return AsyncStorage.setItem(key, value);
    },
    removeItem: (key: string) => {
      if (typeof window === "undefined") return Promise.resolve();
      return AsyncStorage.removeItem(key);
    },
  };

  cachedSupabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, {
    auth: {
      storage: safeStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });

  return cachedSupabase;
};

// Proxy export so existing function calls across your app don't break
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const client = getSupabase();
    // @ts-ignore
    const value = client[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});

/* ---------------------------- Auth helpers ---------------------------- */

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
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

export function onAuthStateChange(
  callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]
) {
  return supabase.auth.onAuthStateChange(callback);
}

/* --------------------------- Profile helpers --------------------------- */

export async function getProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (error) throw error;
  return data as Profile;
}

export async function upsertProfile(profile: Partial<Profile> & { id: string }): Promise<Profile> {
  const { data, error } = await supabase.from("profiles").upsert(profile).select().single();
  if (error) throw error;
  return data as Profile;
}

/* ------------------------- Virtual number helpers ----------------------- */

export async function getUserNumbers(userId: string): Promise<NumberRow[]> {
  const { data, error } = await supabase
    .from("numbers")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as NumberRow[];
}

export async function saveProvisionedNumber(params: {
  userId: string;
  phoneNumber: string;
  telnyxNumberId?: string;
  countryCode: string;
  smsEnabled: boolean;
  voiceEnabled: boolean;
}): Promise<NumberRow> {
  const { data, error } = await supabase
    .from("numbers")
    .insert({
      user_id: params.userId,
      phone_number: params.phoneNumber,
      telnyx_number_id: params.telnyxNumberId,
      country_code: params.countryCode,
      sms_enabled: params.smsEnabled,
      voice_enabled: params.voiceEnabled,
      status: "active",
    })
    .select()
    .single();
  if (error) throw error;
  return data as NumberRow;
}

export async function setActiveNumber(userId: string, numberId: string) {
  const { error } = await supabase
    .from("profiles")
    .update({ active_number_id: numberId })
    .eq("id", userId);
  if (error) throw error;
}

/* --------------------------- Messaging helpers -------------------------- */

export async function getThreadsForNumber(numberId: string): Promise<Thread[]> {
  const { data, error } = await supabase
    .from("threads")
    .select("*")
    .eq("number_id", numberId)
    .order("last_message_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Thread[];
}

export async function getMessagesForThread(threadId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Message[];
}

export async function saveOutboundMessage(params: {
  threadId: string;
  numberId: string;
  toNumber: string;
  body: string;
  telnyxMessageId?: string;
}): Promise<Message> {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      thread_id: params.threadId,
      number_id: params.numberId,
      to_number: params.toNumber,
      body: params.body,
      direction: "outbound",
      telnyx_message_id: params.telnyxMessageId,
      status: "sent",
    })
    .select()
    .single();
  if (error) throw error;
  return data as Message;
}

/* ----------------------------- Call helpers ----------------------------- */

export async function getCallLogsForNumber(numberId: string): Promise<CallLog[]> {
  const { data, error } = await supabase
    .from("call_logs")
    .select("*")
    .eq("number_id", numberId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as CallLog[];
}

export async function saveCallLog(params: {
  numberId: string;
  toNumber: string;
  direction: "inbound" | "outbound";
  status: string;
  telnyxCallControlId?: string | null;
  durationSeconds?: number;
}): Promise<CallLog> {
  const { data, error } = await supabase
    .from("call_logs")
    .insert({
      number_id: params.numberId,
      to_number: params.toNumber,
      direction: params.direction,
      status: params.status,
      telnyx_call_control_id: params.telnyxCallControlId,
      duration_seconds: params.durationSeconds ?? 0,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Message as CallLog;
}

/* ---------------------------- Realtime helper ---------------------------- */

export function subscribeToMessages(numberId: string, onInsert: (message: Message) => void) {
  const client = getSupabase();
  const channel = client
    .channel(`messages-number-${numberId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `number_id=eq.${numberId}` },
      (payload) => onInsert(payload.new as Message)
    )
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
}
