"use client";

import { useState } from "react";
import { useNames } from "@/lib/names";

interface Planet {
  name: string;
  sign_index: number;
  degree_in_sign?: number;
  house?: number;
  retrograde?: boolean;
}

interface Ascendant {
  sign_index: number;
  degree_in_sign: number;
  sign?: string;
}

interface HouseEntry {
  house: number;
  sign_index: number;
}

interface Props {
  planets: Planet[];
  ascendant: Ascendant;
  houses?: HouseEntry[];
  hideControls?: boolean;
  initialStyle?: "north" | "south";
  style?: "north" | "south";
  onStyleChange?: (s: "north" | "south") => void;
  personName?: string;
  vargaLabel?: string;
}

const S = 320;
const HALF = S / 2;

// North Indian: house-fixed. Label anchor (centroid) for each of the 12 houses.
const NORTH_CENTROIDS: Record<number, [number, number]> = {
  1: [0.5, 0.24],
  2: [0.25, 0.11],
  3: [0.11, 0.25],
  4: [0.25, 0.5],
  5: [0.11, 0.75],
  6: [0.25, 0.89],
  7: [0.5, 0.76],
  8: [0.75, 0.89],
  9: [0.89, 0.75],
  10: [0.75, 0.5],
  11: [0.89, 0.25],
  12: [0.75, 0.11],
};

// South Indian: sign-fixed 4x4 grid. Grid cell [row,col] -> sign index.
const SOUTH_CELLS: { row: number; col: number; sign: number }[] = [
  { row: 0, col: 0, sign: 11 },
  { row: 0, col: 1, sign: 0 },
  { row: 0, col: 2, sign: 1 },
  { row: 0, col: 3, sign: 2 },
  { row: 1, col: 3, sign: 3 },
  { row: 2, col: 3, sign: 4 },
  { row: 3, col: 3, sign: 5 },
  { row: 3, col: 2, sign: 6 },
  { row: 3, col: 1, sign: 7 },
  { row: 3, col: 0, sign: 8 },
  { row: 2, col: 0, sign: 9 },
  { row: 1, col: 0, sign: 10 },
];

interface Tok {
  abbr: string;
  retro: boolean;
  suffix: string;
  degree: number;
}

const TOKEN_OFFSETS: [number, number][] = [
  [0, 0],
  [-15, -10],
  [15, -10],
  [-15, 10],
  [15, 10],
  [0, -18],
  [0, 18],
  [-23, 0],
  [23, 0],
];

function tokenOffset(index: number, count: number, hasHeader: boolean): [number, number] {
  if (count === 1) return [0, hasHeader ? 8 : 0];
  const [x, y] = TOKEN_OFFSETS[index % TOKEN_OFFSETS.length];
  return [x, y + (hasHeader ? 8 : 0)];
}

function StackedTokens({
  cx,
  cy,
  header,
  tokens,
  highlight,
}: {
  cx: number;
  cy: number;
  header?: string;
  tokens: Tok[];
  highlight?: boolean;
}) {
  if (!header && tokens.length === 0) return null;
  const orderedTokens = [...tokens].sort((left, right) => left.degree - right.degree);
  return (
    <g textAnchor="middle" fontSize={11} fill={highlight ? "var(--chart-accent)" : "var(--chart-text)"}>
      {header && (
        <text x={cx} y={cy - 16} fontWeight={700} fill={highlight ? "var(--chart-accent)" : "var(--chart-muted)"}>
          {header}
        </text>
      )}
      {orderedTokens.map((tk, index) => {
        const [offsetX, offsetY] = tokenOffset(index, orderedTokens.length, !!header);
        return (
          <text key={`${tk.abbr}-${tk.degree}-${index}`} x={cx + offsetX} y={cy + offsetY}>
            {tk.abbr}
            {tk.retro && (
              <tspan fontSize={9} fill="var(--chart-accent)">
                *
              </tspan>
            )}
            {tk.suffix}
          </text>
        );
      })}
    </g>
  );
}

export function ChartDiagram({
  planets,
  ascendant,
  hideControls = false,
  initialStyle = "north",
  style: controlledStyle,
  onStyleChange,
  personName,
  vargaLabel,
}: Props) {
  const [internalStyle, setInternalStyle] = useState<"north" | "south">(initialStyle);
  const style = controlledStyle ?? internalStyle;
  const setStyle = (s: "north" | "south") =>
    onStyleChange ? onStyleChange(s) : setInternalStyle(s);
  const { planetShort, lagnaShort, vargaName } = useNames();

  // Split "D-1 Rasi" -> number "D-1" + name "Rasi" for the South-chart centre.
  let chartNum = "";
  let chartName = "";
  if (vargaLabel) {
    const m = /^(D-?\d+)\s+(.+)$/.exec(vargaLabel.trim());
    if (m) {
      chartNum = m[1];
      chartName = m[2];
    } else {
      chartName = vargaLabel;
    }
  }
  const centerLines = [personName, vargaName(chartName || "Rasi"), chartNum].filter(
    Boolean
  ) as string[];

  const tok = (p: Planet): Tok => ({
    abbr: planetShort(p.name),
    retro: !!p.retrograde,
    suffix: p.degree_in_sign == null ? "" : ` ${Math.round(p.degree_in_sign)}\u00b0`,
    degree: p.degree_in_sign ?? 0,
  });

  const ascSign = ascendant.sign_index;

  const planetsByHouse: Record<number, Planet[]> = {};
  const planetsBySign: Record<number, Planet[]> = {};
  for (const p of planets) {
    const h = p.house ?? ((p.sign_index - ascSign + 12) % 12) + 1;
    (planetsByHouse[h] ??= []).push(p);
    (planetsBySign[p.sign_index] ??= []).push(p);
  }

  return (
    <div className="space-y-3">
      {!hideControls && (
        <div className="flex items-center gap-2 no-print">
          <span className="text-sm opacity-70">Chart style:</span>
          <div className="inline-flex rounded-lg overflow-hidden border border-white/15">
            {(["north", "south"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStyle(s)}
                className={`px-3 py-1.5 text-sm capitalize ${
                  style === s
                    ? "bg-accent text-cosmic font-semibold"
                    : "bg-black/30 hover:bg-white/10"
                }`}
              >
                {s} Indian
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-black/20 p-4 rounded-lg flex justify-center">
        <svg
          viewBox={`0 0 ${S} ${S}`}
          className="w-full max-w-md"
          role="img"
          aria-label={`${style} Indian rasi chart`}
        >
          <rect
            x={0}
            y={0}
            width={S}
            height={S}
            fill="var(--chart-bg)"
            stroke="var(--chart-line)"
            strokeWidth={1.5}
          />

          {style === "north" ? (
            <>
              {/* Diagonals + inner diamond */}
              <line x1={0} y1={0} x2={S} y2={S} stroke="var(--chart-line)" strokeWidth={1} />
              <line x1={S} y1={0} x2={0} y2={S} stroke="var(--chart-line)" strokeWidth={1} />
              <polygon
                points={`${HALF},0 ${S},${HALF} ${HALF},${S} 0,${HALF}`}
                fill="none"
                stroke="var(--chart-line)"
                strokeWidth={1}
              />
              {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => {
                const [fx, fy] = NORTH_CENTROIDS[h];
                const tokens = (planetsByHouse[h] ?? []).map(tok);
                return (
                  <StackedTokens
                    key={h}
                    cx={fx * S}
                    cy={fy * S}
                    header={h === 1 ? lagnaShort() : ""}
                    tokens={tokens}
                    highlight={h === 1}
                  />
                );
              })}
            </>
          ) : (
            <>
              {/* Outer ring separators; the centre 2x2 is left merged. */}
              <line x1={S / 4} y1={0} x2={S / 4} y2={S} stroke="var(--chart-grid)" strokeWidth={1} />
              <line x1={(3 * S) / 4} y1={0} x2={(3 * S) / 4} y2={S} stroke="var(--chart-grid)" strokeWidth={1} />
              <line x1={0} y1={S / 4} x2={S} y2={S / 4} stroke="var(--chart-grid)" strokeWidth={1} />
              <line x1={0} y1={(3 * S) / 4} x2={S} y2={(3 * S) / 4} stroke="var(--chart-grid)" strokeWidth={1} />
              <line x1={HALF} y1={0} x2={HALF} y2={S / 4} stroke="var(--chart-grid)" strokeWidth={1} />
              <line x1={HALF} y1={(3 * S) / 4} x2={HALF} y2={S} stroke="var(--chart-grid)" strokeWidth={1} />
              <line x1={0} y1={HALF} x2={S / 4} y2={HALF} stroke="var(--chart-grid)" strokeWidth={1} />
              <line x1={(3 * S) / 4} y1={HALF} x2={S} y2={HALF} stroke="var(--chart-grid)" strokeWidth={1} />
              {SOUTH_CELLS.map(({ row, col, sign }) => {
                const cell = S / 4;
                const cx = col * cell + cell / 2;
                const cy = row * cell + cell / 2;
                const isAsc = sign === ascSign;
                const tokens = (planetsBySign[sign] ?? []).map(tok);
                return (
                  <g key={sign}>
                    {isAsc && (
                      <rect
                        x={col * cell + 1.5}
                        y={row * cell + 1.5}
                        width={cell - 3}
                        height={cell - 3}
                        fill="none"
                        stroke="var(--chart-accent)"
                        strokeWidth={1.5}
                      />
                    )}
                    <StackedTokens
                      cx={cx}
                      cy={cy}
                      header={isAsc ? lagnaShort() : ""}
                      tokens={tokens}
                      highlight={isAsc}
                    />
                  </g>
                );
              })}
              {/* Centre block: person name, chart name, varga number */}
              <text
                textAnchor="middle"
                fill="var(--chart-muted)"
                fontWeight={600}
                fontSize={12}
              >
                {centerLines.map((line, i) => (
                  <tspan
                    key={i}
                    x={HALF}
                    y={HALF - ((centerLines.length - 1) * 15) / 2 + i * 15}
                  >
                    {line}
                  </tspan>
                ))}
              </text>
            </>
          )}
        </svg>
      </div>
      <p className="text-xs opacity-60 no-print">
        La = Lagna (Ascendant). Planets shown with degrees in sign; ᵣ marks
        retrograde. North Indian is house-fixed (Lagna always top); South Indian
        is sign-fixed.
      </p>
    </div>
  );
}
