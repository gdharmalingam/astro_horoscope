"use client";

import { useEffect, useRef, useState } from "react";
import { api, type Profile } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import type { LocationValue } from "./LocationField";

export interface QuickCurrent {
  name: string;
  sex?: "male" | "female" | "";
  date: string; // yyyy-mm-dd
  time: string; // HH:mm
  location: LocationValue;
}

function sameProfile(p: Profile, c: QuickCurrent): boolean {
  const round = (n: number) => Math.round(n * 1e4) / 1e4;
  return (
    p.birth_datetime_local === `${c.date}T${c.time}:00` &&
    round(p.latitude) === round(Number(c.location.latitude)) &&
    round(p.longitude) === round(Number(c.location.longitude))
  );
}

interface Props {
  current: QuickCurrent;
  onLoad: (p: Profile) => void;
}

// Compact save/load affordance placed next to a Name field.
export function ProfileQuickButton({ current, onLoad }: Props) {
  const { t } = useI18n();
  const { user, openSignIn } = useAuth();
  const [open, setOpen] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [msg, setMsg] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !open) return;
    setMsg("");
    api
      .listProfiles()
      .then(setProfiles)
      .catch((error) => {
        setProfiles([]);
        setMsg(
          error instanceof Error
            ? error.message.replace(/^Error:\s*\d+:\s*/, "")
            : "Unable to load saved profiles."
        );
      });
  }, [user, open]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const complete = Boolean(current.date && current.time && current.location.timezone);
  const dup = profiles.some((p) => sameProfile(p, current));
  const full = profiles.length >= 5;

  async function save() {
    setMsg("");
    if (!complete) return setMsg(t("fillBirthFirst"));
    if (dup) return setMsg(t("alreadySaved"));
    if (full) return setMsg(t("profileLimitReached"));
    try {
      const created = await api.createProfile({
        name: current.name || current.location.place_name || "Profile",
        sex: current.sex || null,
        birth_datetime_local: `${current.date}T${current.time}:00`,
        timezone: current.location.timezone,
        latitude: Number(current.location.latitude),
        longitude: Number(current.location.longitude),
        place_name: current.location.place_name || null,
      });
      setProfiles((prev) => [...prev, created]);
      setMsg("Profile saved.");
    } catch (err) {
      setMsg(String(err).replace(/^Error:\s*\d+:\s*/, ""));
    }
  }

  async function remove(id: string) {
    if (!window.confirm(t("confirmDeleteProfile"))) return;
    try {
      await api.deleteProfile(id);
      setProfiles((prev) => prev.filter((x) => x.id !== id));
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => (user ? setOpen((v) => !v) : openSignIn())}
        title={t("savedProfiles")}
        aria-label={t("savedProfiles")}
        className="shrink-0 h-full px-3 rounded-lg bg-white/10 border border-white/15 hover:bg-white/20"
      >
        💾
      </button>
      {open && user && (
        <div className="absolute right-0 z-[1000] mt-1 w-64 rounded-lg border border-white/15 bg-cosmic shadow-xl p-2 space-y-2">
          <div className="px-1 text-xs font-semibold uppercase tracking-wide opacity-70">
            {t("savedProfiles")} ({profiles.length}/5)
          </div>
          <button
            type="button"
            onClick={save}
            disabled={dup}
            title={dup ? t("alreadySaved") : undefined}
            className="w-full px-2 py-1.5 rounded border border-accent text-accent text-xs disabled:opacity-40 hover:bg-accent/10"
          >
            {t("saveCurrent")}
          </button>
          {msg && <p className="px-1 text-xs text-red-400">{msg}</p>}
          {profiles.length > 0 ? (
            <ul className="max-h-48 overflow-y-auto space-y-1">
              {profiles.map((p) => (
                <li key={p.id} className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      onLoad(p);
                      setOpen(false);
                    }}
                    title={p.place_name || ""}
                    className="flex-1 min-w-0 text-left px-2 py-1 rounded hover:bg-white/10"
                  >
                    <span className="block truncate text-sm">{p.name}</span>
                    <span className="block truncate text-[11px] opacity-50">
                      {p.birth_datetime_local.replace("T", " · ")}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(p.id)}
                    aria-label={t("deleteProfile")}
                    title={t("deleteProfile")}
                    className="w-7 h-7 shrink-0 grid place-items-center rounded hover:bg-white/10 opacity-60 hover:opacity-100"
                  >
                    🗑️
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-1 text-xs opacity-50">{t("noProfilesYet")}</p>
          )}
        </div>
      )}
    </div>
  );
}
