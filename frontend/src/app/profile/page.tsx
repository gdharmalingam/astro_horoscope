"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getSupabaseClient } from "@/lib/supabase";

export default function ProfilePage() {
  const { user, ready, openSignIn } = useAuth();
  const [resetMessage, setResetMessage] = useState("");
  const [resettingPassword, setResettingPassword] = useState(false);
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (window.location.hash.includes("type=recovery")) setPasswordRecovery(true);
    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setPasswordRecovery(true);
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  if (!ready) return <p className="opacity-60">Loading…</p>;

  if (passwordRecovery) {
    return (
      <main className="max-w-lg mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-accent">Set new password</h1>
        <form onSubmit={updatePassword} className="bg-black/20 p-5 rounded-xl space-y-3">
          <input
            type="password"
            required
            minLength={6}
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="New password"
            className="w-full px-4 py-2.5 rounded-lg bg-black/30 border border-white/10"
          />
          <button
            type="submit"
            disabled={resettingPassword}
            className="px-4 py-2 rounded-lg bg-accent text-cosmic font-semibold disabled:opacity-50"
          >
            {resettingPassword ? "Updating..." : "Update password"}
          </button>
          {resetMessage && <p className="text-sm opacity-80">{resetMessage}</p>}
        </form>
      </main>
    );
  }

  if (!user) {
    return (
      <div className="text-center space-y-3">
        <p>Please sign in to view your profile.</p>
        <button
          onClick={openSignIn}
          className="px-4 py-2 rounded-lg bg-accent text-cosmic font-semibold"
        >
          Sign In
        </button>
      </div>
    );
  }

  const name = user.email;

  async function resetPassword() {
    if (!user) return;
    setResetMessage("");
    setResettingPassword(true);
    try {
      const { error } = await getSupabaseClient().auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/profile`,
      });
      if (error) throw error;
      setResetMessage("Password reset link sent. Check your email.");
    } catch (error) {
      setResetMessage(error instanceof Error ? error.message : "Unable to send reset link.");
    } finally {
      setResettingPassword(false);
    }
  }

  async function updatePassword(event: React.FormEvent) {
    event.preventDefault();
    setResetMessage("");
    setResettingPassword(true);
    try {
      const { error } = await getSupabaseClient().auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword("");
      setPasswordRecovery(false);
      window.history.replaceState(null, "", "/profile");
      setResetMessage("Password updated successfully.");
    } catch (error) {
      setResetMessage(error instanceof Error ? error.message : "Unable to update password.");
    } finally {
      setResettingPassword(false);
    }
  }

  return (
    <main className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-accent">Profile</h1>
      <div className="bg-black/20 p-5 rounded-xl flex items-center gap-4">
        <span className="w-14 h-14 rounded-full bg-accent text-cosmic grid place-items-center text-2xl font-bold">
          {name.charAt(0).toUpperCase()}
        </span>
        <div>
          <div className="text-lg font-semibold break-all">{name}</div>
          <span className="text-xs mt-1 inline-block px-2 py-0.5 rounded bg-white/10">
            {user.is_admin ? "Admin" : "User"}
          </span>
        </div>
      </div>
      <section className="bg-black/20 p-5 rounded-xl space-y-3">
        <h2 className="text-lg font-semibold">Password</h2>
        <p className="text-sm opacity-70">
          Send a secure password-reset link to your email address.
        </p>
        <button
          type="button"
          onClick={resetPassword}
          disabled={resettingPassword}
          className="px-4 py-2 rounded-lg bg-accent text-cosmic font-semibold disabled:opacity-50"
        >
          {resettingPassword ? "Sending..." : "Change password"}
        </button>
        {resetMessage && <p className="text-sm opacity-80">{resetMessage}</p>}
      </section>
    </main>
  );
}
