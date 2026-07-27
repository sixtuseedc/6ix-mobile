// src/context/AuthContext.tsx
// Wraps Supabase auth session state so screens just call useAuth().

import React, { createContext, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import {
  getSession,
  onAuthStateChange,
  signInWithEmail,
  signUpWithEmail,
  signOut as supabaseSignOut,
} from "../api/supabase";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  initializing: boolean;
  signIn: typeof signInWithEmail;
  signUp: typeof signUpWithEmail;
  signOut: typeof supabaseSignOut;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let unsub: { unsubscribe: () => void } | undefined;

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

  const value: AuthContextValue = {
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
