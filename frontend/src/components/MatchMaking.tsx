"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { useNames } from "@/lib/names";
import { BirthEntry, toBirthData, type BirthValue } from "./BirthEntry";
import type { LocationValue } from "./LocationField";

const emptyLocation: LocationValue = {
  latitude: 0,
  longitude: 0,
  timezone: "",
  place_name: "",
};

export function MatchMaking() {
  const { t } = useI18n();
  const { sign, nak } = useNames();
  const [boy, setBoy] = useState<BirthValue>({
    name: "",
    date: "",
    time: "",
    location: { ...emptyLocation },
  });
  const [girl, setGirl] = useState<BirthValue>({
    name: "",
    date: "",
    time: "",
    location: { ...emptyLocation },
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function incomplete(p: BirthValue) {
    return !p.date || !p.time || !p.location.place_name || !p.location.timezone;
  }

  async function check() {
    if (incomplete(boy) || incomplete(girl)) {
      setError("Please enter birth date, time and place for both persons.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      setResult(await api.match(toBirthData(boy), toBirthData(girl)));
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-black/20 p-4 rounded-xl space-y-3">
          <h3 className="font-semibold text-accent">🤵 {t("boy")}</h3>
          <BirthEntry value={boy} onChange={setBoy} showSex={false} showProfileButton />
        </div>
        <div className="bg-black/20 p-4 rounded-xl space-y-3">
          <h3 className="font-semibold text-accent">👰 {t("girl")}</h3>
          <BirthEntry value={girl} onChange={setGirl} showSex={false} showProfileButton />
        </div>
      </div>

      <button
        onClick={check}
        disabled={loading}
        className="w-full px-4 py-3 rounded-lg bg-accent text-cosmic font-semibold disabled:opacity-50"
      >
        {loading ? "…" : t("checkMatch")}
      </button>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {result && (
        <div className="bg-black/20 p-5 rounded-xl space-y-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-accent">
              {result.total}
              <span className="text-xl opacity-60"> / {result.max}</span>
            </div>
            <div className="opacity-80">{result.verdict}</div>
            <div className="text-xs opacity-60 mt-1">
              {sign(result.boy.rasi)} ({nak(result.boy.nakshatra)}) ×{" "}
              {sign(result.girl.rasi)} ({nak(result.girl.nakshatra)})
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
            {result.kootas.map((k: any, i: number) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-white/5 pb-1"
              >
                <span>
                  {k.name}
                  {k.note ? (
                    <span className="opacity-50 text-xs"> · {k.note}</span>
                  ) : null}
                </span>
                <span
                  className={
                    k.obtained === 0 && k.max >= 6 ? "text-red-300" : "text-accent"
                  }
                >
                  {k.obtained} / {k.max}
                </span>
              </div>
            ))}
          </div>

          {result.doshas.length > 0 && (
            <p className="text-amber-300 text-sm">
              ⚠ Dosha present: {result.doshas.join(", ")}
            </p>
          )}
          <p className="text-xs opacity-50">
            Ashtakoota (Guna Milan). 18+/36 is traditionally considered acceptable.
          </p>
        </div>
      )}
    </div>
  );
}
