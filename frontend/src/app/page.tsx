"use client";

import { useState } from "react";
import { api, type Profile } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { useAppNav } from "@/lib/appnav";
import { PlanetTable } from "@/components/PlanetTable";
import { ChartDiagram } from "@/components/ChartDiagram";
import { DasaTable } from "@/components/DasaTable";
import { ClockTimePicker } from "@/components/ClockTimePicker";
import { DateField } from "@/components/DateField";
import { MatchMaking } from "@/components/MatchMaking";
import { Transit } from "@/components/Transit";
import { ProfilesTab } from "@/components/ProfilesTab";
import { ProfileQuickButton } from "@/components/ProfileQuickButton";
import { PrintReport } from "@/components/PrintReport";
import { useNames } from "@/lib/names";
import { LocationField, type LocationValue } from "@/components/LocationField";

const VARGAS: [string, string][] = [
  ["D1", "D-1 Rasi"],
  ["D9", "D-9 Navamsa"],
  ["D2", "D-2 Hora"],
  ["D3", "D-3 Drekkana"],
  ["D7", "D-7 Saptamsa"],
  ["D10", "D-10 Dasamsa"],
  ["D12", "D-12 Dwadasamsa"],
];

export default function HomePage() {
  const { t } = useI18n();
  const { sign, nak, planet } = useNames();
  const { tab, setTab } = useAppNav();

  const [name, setName] = useState("");
  const [sex, setSex] = useState<"male" | "female" | "">("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [location, setLocation] = useState<LocationValue>({
    latitude: 0,
    longitude: 0,
    timezone: "",
    place_name: "",
  });
  const [chart, setChart] = useState<any>(null);
  const [varga, setVarga] = useState("D1");
  const [chartStyle, setChartStyle] = useState<"north" | "south">("north");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [predsTab, setPredsTab] = useState<"character" | "dasa">("character");
  const [ayanamsa, setAyanamsa] = useState("lahiri");
  const [node, setNode] = useState<"mean" | "true">("mean");
  const [showAdv, setShowAdv] = useState(false);

  function applyProfile(p: Profile) {
    setName(p.name || "");
    setSex(p.sex === "male" || p.sex === "female" ? p.sex : "");
    const [d, tm] = (p.birth_datetime_local || "").split("T");
    setBirthDate(d || "");
    setBirthTime(tm ? tm.slice(0, 5) : "");
    setLocation({
      latitude: p.latitude,
      longitude: p.longitude,
      timezone: p.timezone,
      place_name: p.place_name || "",
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!birthDate || !birthTime || !location.place_name || !location.timezone) {
      setError("Please enter birth date, time and place.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await api.calculate({
        name: name || undefined,
        sex,
        birth_datetime_local: `${birthDate}T${birthTime}:00`,
        timezone: location.timezone,
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
        ayanamsa,
        node,
        dasa_depth: 2,
      });
      setVarga("D1");
      setChart(result);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  function downloadPdf() {
    window.print();
  }

  const moon = chart?.planets?.find((p: any) => p.name === "Moon");
  const activeChart =
    varga === "D1"
      ? {
          planets: chart?.planets,
          ascendant: chart?.ascendant,
          houses: chart?.houses,
        }
      : chart?.divisional?.[varga];

  return (
    <main className="space-y-8">
      {tab === "horoscope" && (
        <header className="text-center space-y-1 no-print">
          <h1 className="text-2xl sm:text-3xl font-bold text-accent">
            {t("appTitle")}
          </h1>
          <p className="opacity-80 text-sm">{t("tagline")}</p>
        </header>
      )}

      {tab === "match" && <MatchMaking />}
      {tab === "transit" && <Transit />}
      {tab === "profiles" && <ProfilesTab />}
      {tab === "ai" && (
        <div className="no-print max-w-lg mx-auto bg-black/20 p-8 rounded-xl text-center space-y-3">
          <div className="text-4xl">🔮</div>
          <h2 className="text-xl font-semibold">
            {t("aiTab")}{" "}
            <span className="text-accent">· {t("comingSoon")}</span>
          </h2>
          <p className="opacity-80 text-sm">{t("aiComingSoonDesc")}</p>
        </div>
      )}

      {tab === "horoscope" && (
      <form
        onSubmit={handleSubmit}
        className="no-print space-y-4 bg-black/20 p-4 sm:p-5 rounded-xl max-w-lg mx-auto"
      >
        <div className="text-sm">
          {t("name")}
          <div className="mt-1 flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("namePlaceholder")}
              className="flex-1 px-3 py-2 rounded bg-black/30 border border-white/10"
            />
            <ProfileQuickButton
              current={{ name, sex, date: birthDate, time: birthTime, location }}
              onLoad={applyProfile}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <span>{t("sex")}</span>
          <div className="inline-flex rounded-lg overflow-hidden border border-white/15">
            {(["male", "female"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSex(s)}
                className={`px-4 py-2 text-sm ${
                  sex === s
                    ? "bg-accent text-cosmic font-semibold"
                    : "bg-black/30 hover:bg-white/10"
                }`}
              >
                {t(s)}
              </button>
            ))}
          </div>
        </div>

        <div className="text-sm">
          {t("birthDate")} <span className="opacity-50 text-xs">(dd/mm/yyyy)</span>
          <div className="mt-1">
            <DateField value={birthDate} onChange={setBirthDate} />
          </div>
        </div>

        <div className="text-sm">
          {t("birthTime")}
          <div className="mt-1">
            <ClockTimePicker value={birthTime} onChange={setBirthTime} />
          </div>
        </div>

        <LocationField value={location} onChange={setLocation} />

        <div>
          <button
            type="button"
            onClick={() => setShowAdv((v) => !v)}
            className="text-xs opacity-70 hover:opacity-100"
          >
            {showAdv ? "− Advanced settings" : "+ Advanced settings (ayanamsa / node)"}
          </button>
          {showAdv && (
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block text-sm">
                Ayanamsa
                <select
                  value={ayanamsa}
                  onChange={(e) => setAyanamsa(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded bg-black/30 border border-white/10 text-[var(--fg)]"
                >
                  <option value="lahiri">Lahiri (default)</option>
                  <option value="krishnamurti">Krishnamurti (KP)</option>
                  <option value="raman">Raman</option>
                </select>
              </label>
              <label className="block text-sm">
                Rahu / Ketu node
                <select
                  value={node}
                  onChange={(e) => setNode(e.target.value as "mean" | "true")}
                  className="mt-1 w-full px-3 py-2 rounded bg-black/30 border border-white/10 text-[var(--fg)]"
                >
                  <option value="mean">Mean (default)</option>
                  <option value="true">True</option>
                </select>
              </label>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 rounded-lg bg-accent text-cosmic font-semibold disabled:opacity-50"
        >
          {loading ? t("generating") : t("generate")}
        </button>
      </form>
      )}

      {tab === "horoscope" && error && (
        <p className="text-red-400 text-sm text-center no-print">{error}</p>
      )}

      {tab === "horoscope" && chart && (
        <>
        <div id="result" className="space-y-8 no-print">
          <div className="text-center">
            <h2 className="text-2xl font-bold">
              {chart.meta?.name || name || "Horoscope"}
              <span className="text-base font-normal opacity-80">
                {moon ? ` · Moon ${sign(moon.sign)} (${nak(moon.nakshatra)})` : ""} · Asc{" "}
                {sign(chart.ascendant.sign)}
              </span>
            </h2>
            <p className="opacity-60 text-sm capitalize">
              {(chart.meta?.sex || sex) + " · "}
              {location.place_name}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 no-print">
            <div className="flex flex-wrap gap-2">
              {VARGAS.map(([code, label]) => (
                <button
                  key={code}
                  onClick={() => setVarga(code)}
                  disabled={code !== "D1" && !chart.divisional?.[code]}
                  className={`px-3 py-1.5 rounded-lg text-sm ${
                    varga === code
                      ? "bg-accent text-cosmic font-semibold"
                      : "bg-black/30 border border-white/15 hover:bg-white/10"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={downloadPdf}
              className="px-4 py-1.5 rounded-lg border border-accent text-accent text-sm"
            >
              ⬇ {t("downloadPdf")}
            </button>
          </div>

          <section className="bg-black/20 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">
              {VARGAS.find(([c]) => c === varga)?.[1] ?? t("chart")}
            </h3>
            {activeChart ? (
              <ChartDiagram
                planets={activeChart.planets}
                ascendant={activeChart.ascendant}
                houses={activeChart.houses}
                style={chartStyle}
                onStyleChange={setChartStyle}
                personName={chart.meta?.name || name}
                vargaLabel={VARGAS.find(([c]) => c === varga)?.[1]}
              />
            ) : (
              <p className="opacity-60 text-sm">Chart not available.</p>
            )}
          </section>

          <section className="bg-black/20 p-4 rounded-lg overflow-x-auto">
            <h3 className="text-lg font-semibold mb-3">{t("positions")}</h3>
            <PlanetTable planets={chart.planets} ascendant={chart.ascendant} />
          </section>

          <section className="bg-black/20 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-1">{t("dasa")}</h3>
            {chart.dasa.current && (
              <p className="text-sm opacity-80 mb-4">
                {t("current")}: {planet(chart.dasa.current.lord)}
                {chart.dasa.current.sub
                  ? ` / ${planet(chart.dasa.current.sub.lord)}`
                  : ""}
              </p>
            )}
            <DasaTable mahadashas={chart.dasa.mahadashas} />
          </section>

          {chart.predictions && (
            <section className="bg-black/20 p-4 rounded-lg space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-lg font-semibold">{t("interpretation")}</h3>
                <div className="no-print inline-flex rounded-lg overflow-hidden border border-white/15 text-sm">
                  {(["character", "dasa"] as const).map((k) => (
                    <button
                      key={k}
                      onClick={() => setPredsTab(k)}
                      className={`px-3 py-1 ${
                        predsTab === k
                          ? "bg-accent text-cosmic font-semibold"
                          : "bg-black/30 hover:bg-white/10"
                      }`}
                    >
                      {k === "character" ? t("character") : t("dasaPredictions")}
                    </button>
                  ))}
                </div>
              </div>
              {predsTab === "character" ? (
                <>
                  <p className="text-sm opacity-90">{chart.predictions.character}</p>
                  <p className="text-sm opacity-90">{chart.predictions.moon}</p>
                </>
              ) : (
                <p className="text-sm opacity-90">
                  {chart.predictions.dasa || "\u2014"}
                </p>
              )}
              <p className="text-xs opacity-50">
                Generic traditional significations — for guidance, not deterministic prediction.
              </p>
            </section>
          )}
        </div>
        <PrintReport
          chart={chart}
          name={chart.meta?.name || name}
          sex={chart.meta?.sex || sex}
          place={location.place_name}
          style={chartStyle}
        />
        </>
      )}
    </main>
  );
}
