"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase";

export interface AuthUser {
  id: string;
  email: string;
  display_name?: string;
  photo_url?: string;
  is_admin?: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  ready: boolean;
  signInOpen: boolean;
  openSignIn: () => void;
  closeSignIn: () => void;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (email: string, password: string) => Promise<void>;
  signInProvider: (provider: "google" | "facebook") => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email ?? "",
    display_name: user.user_metadata.full_name ?? user.user_metadata.name,
    photo_url: user.user_metadata.avatar_url ?? user.user_metadata.picture,
    is_admin: user.app_metadata.is_admin === true,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseClient();
    void supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ? toAuthUser(data.session.user) : null);
      setReady(true);
    });
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? toAuthUser(session.user) : null);
      setReady(true);
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  const signInEmail = useCallback(
    async (email: string, password: string) => {
      const { error } = await getSupabaseClient().auth.signInWithPassword({ email, password });
      if (error) throw error;
      setSignInOpen(false);
    },
    []
  );

  const signUpEmail = useCallback(
    async (email: string, password: string) => {
      const { error } = await getSupabaseClient().auth.signUp({ email, password });
      if (error) throw error;
    },
    []
  );

  const signInProvider = useCallback(
    async (provider: "google" | "facebook") => {
      const { error } = await getSupabaseClient().auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    },
    []
  );

  const signOut = useCallback(async () => {
    await getSupabaseClient().auth.signOut();
    setUser(null);
    // Hard reset to home so all in-memory form/chart fields are cleared.
    if (typeof window !== "undefined") window.location.assign("/");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        ready,
        signInOpen,
        openSignIn: () => setSignInOpen(true),
        closeSignIn: () => setSignInOpen(false),
        signInEmail,
        signUpEmail,
        signInProvider,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
