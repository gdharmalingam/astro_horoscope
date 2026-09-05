"use client";

import { ChartDiagram } from "./ChartDiagram";
import { PlanetTable } from "./PlanetTable";
import { DasaTable } from "./DasaTable";
import { useNames } from "@/lib/names";

const REST: [string, string][] = [
  ["D2", "D-2 Hora"],
  ["D3", "D-3 Drekkana"],
  ["D7", "D-7 Saptamsa"],
  ["D10", "D-10 Dasamsa"],
  ["D12", "D-12 Dwadasamsa"],
];

interface Props {
  chart: any;
  name?: string;
  sex?: string;
  place?: string;
  style?: "north" | "south";
}

// Rendered only when printing (see .print-only). Structured for PDF export:
// page 1 = D1 + D9 side by side + positions; page 2 = dasa; page 3+ = other vargas.
export function PrintReport({ chart, name, sex, place, style = "north" }: Props) {
  const { sign, nak } = useNames();
  const div = chart.divisional || {};
  const moon = chart.planets?.find((p: any) => p.name === "Moon");

  return (
    <div className="print-only text-black">
      <div className="print-page">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold">{name || "Horoscope"}</h1>
        <p className="text-sm capitalize">
          {sex ? `${sex} · ` : ""}
          {moon ? `Moon ${sign(moon.sign)} (${nak(moon.nakshatra)}) · ` : ""}
          Asc {sign(chart.ascendant.sign)}
        </p>
        {place && <p className="text-xs">{place}</p>}
      </div>

      {/* Page 1: D-1 and D-9 adjacent, then planetary positions. */}
      <div className="print-chart-grid grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-1 text-center">D-1 Rasi</h3>
          <ChartDiagram
            planets={chart.planets}
            ascendant={chart.ascendant}
            houses={chart.houses}
            hideControls
            style={style}
            personName={name}
            vargaLabel="D-1 Rasi"
          />
        </div>
        <div>
          <h3 className="font-semibold mb-1 text-center">D-9 Navamsa</h3>
          {div.D9 && (
            <ChartDiagram
              planets={div.D9.planets}
              ascendant={div.D9.ascendant}
              houses={div.D9.houses}
              hideControls
              style={style}
              personName={name}
              vargaLabel="D-9 Navamsa"
            />
          )}
        </div>
      </div>

      <h3 className="font-semibold mt-5 mb-2">Planetary Positions</h3>
      <PlanetTable planets={chart.planets} ascendant={chart.ascendant} />
      </div>

      {/* Page 2: Vimshottari dasa. */}
      <div className="page-break print-page dasa-page">
        <h3 className="font-semibold mb-3">Vimshottari Dasa</h3>
        <DasaTable mahadashas={chart.dasa.mahadashas} />
      </div>

      {/* Page 3: remaining divisional charts (all five fit on one page). */}
      <div className="page-break print-page varga-page">
        <h3 className="font-semibold mb-3">Divisional Charts</h3>
        <div className="varga-grid grid grid-cols-2 gap-x-6 gap-y-3">
          {REST.map(([code, label]) =>
            div[code] ? (
              <div key={code} className="varga-cell">
                <h4 className="text-center text-sm font-semibold mb-1">{label}</h4>
                <ChartDiagram
                  planets={div[code].planets}
                  ascendant={div[code].ascendant}
                  houses={div[code].houses}
                  hideControls
                  style={style}
                  personName={name}
                  vargaLabel={label}
                />
              </div>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}
