"use client";

import { useNames } from "@/lib/names";

interface Period {
  lord: string;
  start: string;
  end: string;
  years: number;
  sub_periods?: Period[];
}

function d(date: string): string {
  // "1986-07-10" -> "10/07/86" (2-digit year keeps the range compact and airy)
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(date);
  if (m) return `${m[3]}/${m[2]}/${m[1].slice(2)}`;
  return date;
}

// Card layout: three mahadashas per row, each a titled block with its antardashas.
export function DasaTable({ mahadashas }: { mahadashas: Period[] }) {
  const { planet } = useNames();
  return (
    <div className="dasa-grid grid grid-cols-1 sm:grid-cols-3 gap-x-5 gap-y-5 text-sm">
      {mahadashas.map((m, i) => (
        <div
          key={i}
          className="dasa-card rounded-lg overflow-hidden border border-white/10 bg-white/[0.03]"
        >
          <div className="dasa-card-head flex items-baseline justify-between px-3 py-1.5 bg-accent/10">
            <span className="font-semibold text-accent text-base">{planet(m.lord)}</span>
            <span className="text-xs opacity-60">{m.years.toFixed(2)}y</span>
          </div>
          <div className="px-3 py-2 space-y-1.5">
            <div className="text-xs opacity-70 tabular-nums tracking-widest">
              {d(m.start)} – {d(m.end)}
            </div>
            {m.sub_periods && m.sub_periods.length > 0 && (
              <div className="space-y-1 border-t border-white/5 pt-1.5">
                {m.sub_periods.map((s, j) => (
                  <div key={j} className="flex justify-between gap-2 text-xs">
                    <span className="opacity-80">{planet(s.lord)}</span>
                    <span className="opacity-55 tabular-nums tracking-widest">
                      {d(s.start)} – {d(s.end)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
