"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { ChartDiagram } from "./ChartDiagram";
import { PlanetTable } from "./PlanetTable";
import { LocationField, type LocationValue } from "./LocationField";

export function Transit() {
  const { t } = useI18n();
  const [location, setLocation] = useState<LocationValue>({
    latitude: 0,
    longitude: 0,
    timezone: "",
    place_name: "",
  });
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function compute() {
    if (!location.place_name) {
      setError("Please choose a location.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      setData(await api.transit(Number(location.latitude), Number(location.longitude)));
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-black/20 p-4 rounded-xl space-y-3 max-w-2xl">
        <LocationField value={location} onChange={setLocation} />
        <button
          onClick={compute}
          disabled={loading}
          className="w-full px-4 py-3 rounded-lg bg-accent text-cosmic font-semibold disabled:opacity-50"
        >
          {loading ? "…" : t("computeTransit")}
        </button>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {data && (
        <div className="space-y-6">
          <p className="text-sm opacity-70">
            {t("currentTransit")} · {data.meta.datetime_utc} UTC · Asc{" "}
            {data.ascendant.sign}
          </p>
          <section className="bg-black/20 p-4 rounded-lg">
            <ChartDiagram
              planets={data.planets}
              ascendant={data.ascendant}
              houses={data.houses}
            />
          </section>
          <section className="bg-black/20 p-4 rounded-lg overflow-x-auto">
            <h3 className="text-lg font-semibold mb-3">{t("positions")}</h3>
            <PlanetTable planets={data.planets} ascendant={data.ascendant} />
          </section>
        </div>
      )}
    </div>
  );
}
