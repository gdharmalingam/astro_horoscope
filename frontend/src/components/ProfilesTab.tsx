"use client";

import { useEffect, useState } from "react";
import { api, type Profile } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

import { BirthEntry, type BirthValue } from "./BirthEntry";
import type { LocationValue } from "./LocationField";

const emptyLocation: LocationValue = {
  latitude: 0,
  longitude: 0,
  timezone: "",
  place_name: "",
};

const emptyEntry: BirthValue = {
  name: "",
  date: "",
  time: "",
  location: { ...emptyLocation },
};

// Two profiles are "the same" when their birth inputs match (rounded coords).
function sameProfile(p: Profile, v: BirthValue): boolean {
  const round = (n: number) => Math.round(n * 1e4) / 1e4;
  return (
    p.birth_datetime_local === `${v.date}T${v.time}:00` &&
    round(p.latitude) === round(Number(v.location.latitude)) &&
    round(p.longitude) === round(Number(v.location.longitude))
  );
}

export function ProfilesTab() {
  const { t } = useI18n();
  const { user, openSignIn } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [entry, setEntry] = useState<BirthValue>({ ...emptyEntry });
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      setProfiles([]);
      return;
    }
    api.listProfiles().then(setProfiles).catch(() => setProfiles([]));
  }, [user]);

  const full = profiles.length >= 5;

  async function save() {
    setMsg("");
    if (!entry.date || !entry.time || !entry.location.timezone) {
      setMsg(t("fillBirthFirst"));
      return;
    }
    if (profiles.some((p) => sameProfile(p, entry))) {
      setMsg(t("alreadySaved"));
      return;
    }
    if (full) {
      setMsg(t("profileLimitReached"));
      return;
    }
    setSaving(true);
    try {
      const created = await api.createProfile({
        name: entry.name || entry.location.place_name || "Profile",
        sex: entry.sex || null,
        birth_datetime_local: `${entry.date}T${entry.time}:00`,
        timezone: entry.location.timezone,
        latitude: Number(entry.location.latitude),
        longitude: Number(entry.location.longitude),
        place_name: entry.location.place_name || null,
      });
      setProfiles((prev) => [...prev, created]);
      setEntry({ ...emptyEntry, location: { ...emptyLocation } });
    } catch (err) {
      setMsg(String(err).replace(/^Error:\s*\d+:\s*/, ""));
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm(t("confirmDeleteProfile"))) return;
    try {
      await api.deleteProfile(id);
      setProfiles((prev) => prev.filter((p) => p.id !== id));
    } catch {
      /* ignore */
    }
  }

  if (!user) {
    return (
      <div className="max-w-lg mx-auto bg-black/20 p-8 rounded-xl text-center space-y-3">
        <div className="text-4xl">👤</div>
        <h2 className="text-xl font-semibold">{t("profilesTab")}</h2>
        <p className="opacity-80 text-sm">{t("signInToSaveProfiles")}</p>
        <button
          onClick={openSignIn}
          className="px-4 py-2 rounded-lg bg-accent text-cosmic font-semibold text-sm"
        >
          {t("signIn")}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <section className="bg-black/20 p-4 sm:p-5 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {t("savedProfiles")}{" "}
            <span className="opacity-60 text-sm">({profiles.length}/5)</span>
          </h2>
        </div>
        {profiles.length === 0 ? (
          <p className="text-sm opacity-60">{t("noProfilesYet")}</p>
        ) : (
          <ul className="space-y-2">
            {profiles.map((p) => (
              <li
                key={p.id}
                className="rounded-lg border border-white/10 bg-white/[0.03] p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="font-medium truncate">{p.name}</div>
                  <div className="text-xs opacity-60 truncate">
                    {p.birth_datetime_local.replace("T", " · ")}
                    {p.place_name ? ` · ${p.place_name}` : ""}
                  </div>
                </div>
                <button
                  onClick={() => remove(p.id)}
                  aria-label={t("deleteProfile")}
                  title={t("deleteProfile")}
                  className="shrink-0 w-9 h-9 grid place-items-center rounded-lg border border-white/15 opacity-70 hover:opacity-100 hover:bg-white/10"
                >
                  🗑️
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bg-black/20 p-4 sm:p-5 rounded-xl space-y-4">
        <h3 className="font-semibold">{t("addProfile")}</h3>
        <BirthEntry value={entry} onChange={setEntry} />
        {msg && <p className="text-sm text-red-400">{msg}</p>}
        <button
          onClick={save}
          disabled={saving || full}
          className="w-full px-4 py-2.5 rounded-lg bg-accent text-cosmic font-semibold text-sm disabled:opacity-50"
        >
          {full ? t("profileLimitReached") : saving ? "…" : t("saveProfile")}
        </button>
      </section>
    </div>
  );
}
