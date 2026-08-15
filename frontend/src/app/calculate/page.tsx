"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { PlanetTable } from "@/components/PlanetTable";
import { DasaTree } from "@/components/DasaTree";
import { ChartDiagram } from "@/components/ChartDiagram";
import { LocationPicker, type LocationValue } from "@/components/LocationPicker";

export default function CalculatePage() {
  const [birthDateTime, setBirthDateTime] = useState("1990-05-14T08:30");
  const [location, setLocation] = useState<LocationValue>({
    latitude: 12.9716,
    longitude: 77.5946,
    timezone: "Asia/Kolkata",
    place_name: "Bengaluru, India",
  });
  const [chart, setChart] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await api.calculate({
        birth_datetime_local: birthDateTime + ":00",
        timezone: location.timezone,
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
      });
      setChart(result);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-accent">Calculate Horoscope</h1>
        <Link href="/" className="underline opacity-70">
          Home
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black/20 p-4 rounded-lg"
      >
        <label className="flex flex-col text-sm gap-1 sm:col-span-2">
          Birth date &amp; time (local time at birth place)
          <input
            type="datetime-local"
            value={birthDateTime}
            onChange={(e) => setBirthDateTime(e.target.value)}
            className="px-3 py-2 rounded bg-black/30 border border-white/10"
          />
        </label>

        <LocationPicker value={location} onChange={setLocation} />

        <button
          type="submit"
          disabled={loading}
          className="sm:col-span-2 px-4 py-3 rounded-lg bg-accent text-cosmic font-semibold disabled:opacity-50"
        >
          {loading ? "Calculating…" : "Calculate"}
        </button>
      </form>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {chart && (
        <div className="space-y-8">
          <section className="bg-black/20 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-3">Rasi Chart (D-1)</h2>
            <ChartDiagram
              planets={chart.planets}
              ascendant={chart.ascendant}
              houses={chart.houses}
            />
          </section>

          <section className="bg-black/20 p-4 rounded-lg overflow-x-auto">
            <h2 className="text-lg font-semibold mb-3">Planetary Positions</h2>
            <PlanetTable planets={chart.planets} ascendant={chart.ascendant} />
          </section>

          <section className="bg-black/20 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-1">Vimshottari Dasa</h2>
            {chart.dasa.current && (
              <p className="text-sm opacity-80 mb-3">
                Current: {chart.dasa.current.lord}
                {chart.dasa.current.sub
                  ? ` / ${chart.dasa.current.sub.lord}`
                  : ""}
              </p>
            )}
            <DasaTree mahadashas={chart.dasa.mahadashas} />
          </section>
        </div>
      )}
    </main>
  );
}
