// src/context/AuthContext.js
// Wraps Supabase auth session state so screens just call useAuth().

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getSession,
  onAuthStateChange,
  signInWithEmail,
  signUpWithEmail,
  signOut as supabaseSignOut,
} from "../api/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let unsub;

    getSession().then(({ data }) => {
      setSession(data?.session ?? null);
      setInitializing(false);
    });

    const { data: listener } = onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    unsub = listener?.subscription;

    return () => unsub?.unsubscribe();
  }, []);

  const value = {
    session,
    user: session?.user ?? null,
    initializing,
    signIn: signInWithEmail,
    signUp: signUpWithEmail,
    signOut: supabaseSignOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
