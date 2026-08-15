"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  value: string; // ISO "yyyy-mm-dd" or ""
  onChange: (iso: string) => void;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function isoToDisplay(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "";
}

function displayToIso(s: string): string | null {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s.trim());
  if (!m) return null;
  const d = +m[1], mo = +m[2], y = +m[3];
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d)
    return null;
  return `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function DateField({ value, onChange }: Props) {
  const [text, setText] = useState(isoToDisplay(value));
  const [open, setOpen] = useState(false);
  const base = value ? new Date(value) : new Date();
  const [viewY, setViewY] = useState(base.getFullYear());
  const [viewM, setViewM] = useState(base.getMonth());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setText(isoToDisplay(value));
    if (value) {
      const dt = new Date(value);
      setViewY(dt.getFullYear());
      setViewM(dt.getMonth());
    }
  }, [value]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  function commitText(s: string) {
    setText(s);
    const iso = displayToIso(s);
    if (iso) {
      onChange(iso);
      const dt = new Date(iso);
      setViewY(dt.getFullYear());
      setViewM(dt.getMonth());
    }
  }

  function pick(day: number) {
    const iso = `${viewY}-${String(viewM + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    onChange(iso);
    setOpen(false);
  }

  function shiftMonth(delta: number) {
    let m = viewM + delta;
    let y = viewY;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setViewM(m);
    setViewY(y);
  }

  const firstWeekday = new Date(viewY, viewM, 1).getDay();
  const daysInMonth = new Date(viewY, viewM + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="relative" ref={ref}>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => commitText(e.target.value)}
          placeholder="dd/mm/yyyy"
          inputMode="numeric"
          className="flex-1 px-3 py-2 rounded bg-black/30 border border-white/10"
        />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Open calendar"
          className="shrink-0 px-3 rounded-lg bg-white/10 border border-white/15 hover:bg-white/20"
        >
          📅
        </button>
      </div>

      {open && (
        <div className="absolute z-[1000] mt-1 p-3 rounded-xl bg-cosmic border border-white/15 shadow-2xl w-64">
          <div className="flex items-center justify-between mb-2 text-sm">
            <button type="button" onClick={() => shiftMonth(-1)} className="px-2">
              ‹
            </button>
            <div className="flex gap-1 items-center">
              <select
                value={viewM}
                onChange={(e) => setViewM(+e.target.value)}
                className="bg-black/30 border border-white/10 rounded px-1 text-[var(--fg)]"
              >
                {MONTHS.map((mm, i) => (
                  <option key={i} value={i} className="text-black">
                    {mm}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={viewY}
                onChange={(e) => setViewY(+e.target.value)}
                className="w-16 bg-black/30 border border-white/10 rounded px-1"
              />
            </div>
            <button type="button" onClick={() => shiftMonth(1)} className="px-2">
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs opacity-60 mb-1">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div key={i}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {cells.map((c, i) =>
              c === null ? (
                <div key={i} />
              ) : (
                <button
                  key={i}
                  type="button"
                  onClick={() => pick(c)}
                  className={`rounded py-1 hover:bg-white/10 ${
                    value ===
                    `${viewY}-${String(viewM + 1).padStart(2, "0")}-${String(c).padStart(2, "0")}`
                      ? "bg-accent text-cosmic font-semibold"
                      : ""
                  }`}
                >
                  {c}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
