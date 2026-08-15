"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" />
    </svg>
  );
}

export function SignInModal() {
  const { signInOpen, closeSignIn, signInEmail, signUpEmail, signInProvider } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!signInOpen) return null;

  async function provider(p: "google" | "facebook") {
    setError("");
    try {
      await signInProvider(p);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function emailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (isSignUp) {
        await signUpEmail(email, password);
        setError("Check your email to confirm your new account.");
      } else {
        await signInEmail(email, password);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-md"
        onClick={closeSignIn}
      />
      <div className="relative z-10 w-full max-w-sm bg-cosmic border border-white/15 rounded-2xl p-6 space-y-4 shadow-2xl">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-accent">Sign in</h2>
          <button
            onClick={closeSignIn}
            className="opacity-60 hover:opacity-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <button
          onClick={() => provider("google")}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white text-gray-800 font-medium hover:bg-gray-100"
        >
          <GoogleIcon /> Continue with Google
        </button>
        <button
          onClick={() => provider("facebook")}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#1877F2] text-white font-medium hover:brightness-110"
        >
          <FacebookIcon /> Continue with Facebook
        </button>

        <div className="flex items-center gap-3 text-xs opacity-50">
          <div className="h-px flex-1 bg-white/15" />
          or
          <div className="h-px flex-1 bg-white/15" />
        </div>

        <form onSubmit={emailLogin} className="space-y-3">
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-black/30 border border-white/10"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-black/30 border border-white/10"
          />
          <button
            disabled={busy}
            type="submit"
            className="w-full px-4 py-2.5 rounded-lg bg-accent text-cosmic font-semibold disabled:opacity-50"
          >
            {busy ? "Please wait…" : isSignUp ? "Create account" : "Sign in with email"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setIsSignUp((current) => !current)}
          className="w-full text-sm text-accent hover:opacity-80"
        >
          {isSignUp ? "Already have an account? Sign in" : "New here? Create an account"}
        </button>

        {error && <p className="text-amber-300 text-xs">{error}</p>}
      </div>
    </div>
  );
}
