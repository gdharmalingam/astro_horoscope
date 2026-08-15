"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  value: string; // "HH:mm" (24-hour)
  onChange: (value: string) => void;
}

function parse(value: string) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value || "");
  let h = m ? parseInt(m[1], 10) : 12;
  const min = m ? parseInt(m[2], 10) : 0;
  const ampm = h >= 12 ? "PM" : "AM";
  let h12 = h % 12;
  if (h12 === 0) h12 = 12;
  return { h12, min, ampm: ampm as "AM" | "PM" };
}

function to24(h12: number, min: number, ampm: "AM" | "PM"): string {
  let h = h12 % 12;
  if (ampm === "PM") h += 12;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

function format12(value: string): string {
  if (!value) return "";
  const { h12, min, ampm } = parse(value);
  return `${String(h12).padStart(2, "0")}:${String(min).padStart(2, "0")} ${ampm}`;
}

// Accepts "hh:mm am/pm" or 24-hour "HH:mm"; returns 24-hour "HH:mm" or null.
function parseTime(s: string): string | null {
  const t = s.trim().toLowerCase().replace(/\s+/g, " ");
  let m = /^(\d{1,2}):(\d{2})\s*(am|pm)$/.exec(t);
  if (m) {
    let h = parseInt(m[1], 10) % 12;
    if (m[3] === "pm") h += 12;
    const mm = parseInt(m[2], 10);
    if (mm > 59) return null;
    return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  }
  m = /^(\d{1,2}):(\d{2})$/.exec(t);
  if (m) {
    const h = parseInt(m[1], 10);
    const mm = parseInt(m[2], 10);
    if (h > 23 || mm > 59) return null;
    return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  }
  return null;
}

const R = 84;
const C = 110;

export function ClockTimePicker({ value, onChange }: Props) {
  const init = parse(value);
  const [open, setOpen] = useState(false);
  const [h12, setH12] = useState(init.h12);
  const [min, setMin] = useState(init.min);
  const [ampm, setAmpm] = useState<"AM" | "PM">(init.ampm);
  const [mode, setMode] = useState<"h" | "m">("h");
  const [text, setText] = useState(format12(value));
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const p = parse(value);
    setH12(p.h12);
    setMin(p.min);
    setAmpm(p.ampm);
    setText(format12(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function commit(nh = h12, nm = min, na = ampm) {
    onChange(to24(nh, nm, na));
  }

  // Selected angle for the hand.
  const sel = mode === "h" ? h12 % 12 : min / 5;
  const handAngle = (sel * 30 - 90) * (Math.PI / 180);
  const handX = C + R * 0.72 * Math.cos(handAngle);
  const handY = C + R * 0.72 * Math.sin(handAngle);

  const numbers =
    mode === "h"
      ? Array.from({ length: 12 }, (_, i) => i + 1)
      : Array.from({ length: 12 }, (_, i) => i * 5);

  return (
    <div className="relative" ref={ref}>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => {
            const s = e.target.value;
            setText(s);
            const v = parseTime(s);
            if (v) onChange(v);
          }}
          placeholder="hh:mm am/pm"
          className="flex-1 px-3 py-2 rounded bg-black/30 border border-white/10"
        />
        <button
          type="button"
          onClick={() => {
            setOpen((o) => !o);
            setMode("h");
          }}
          aria-label="Open clock"
          className="shrink-0 px-3 rounded-lg bg-white/10 border border-white/15 hover:bg-white/20"
        >
          🕐
        </button>
      </div>

      {open && (
        <div className="absolute z-[1000] mt-2 p-4 rounded-xl bg-cosmic border border-white/15 shadow-2xl">
          <div className="flex items-center justify-center gap-2 mb-2 text-lg font-semibold">
            <button
              onClick={() => setMode("h")}
              className={mode === "h" ? "text-accent" : "opacity-60"}
            >
              {String(h12).padStart(2, "0")}
            </button>
            <span>:</span>
            <button
              onClick={() => setMode("m")}
              className={mode === "m" ? "text-accent" : "opacity-60"}
            >
              {String(min).padStart(2, "0")}
            </button>
            <div className="ml-3 flex flex-col text-xs">
              {(["AM", "PM"] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => {
                    setAmpm(a);
                    commit(h12, min, a);
                  }}
                  className={`px-2 rounded ${
                    ampm === a ? "bg-accent text-cosmic" : "opacity-60"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div
            className="relative"
            style={{ width: 220, height: 220 }}
          >
            <svg width={220} height={220} className="absolute inset-0">
              <circle cx={C} cy={C} r={R + 18} fill="rgba(128,100,200,0.12)" />
              <line
                x1={C}
                y1={C}
                x2={handX}
                y2={handY}
                stroke="#c084fc"
                strokeWidth={2}
              />
              <circle cx={C} cy={C} r={3} fill="#c084fc" />
              <circle cx={handX} cy={handY} r={16} fill="rgba(192,132,252,0.35)" />
            </svg>
            {numbers.map((n, i) => {
              const angle = (i * 30 - 90) * (Math.PI / 180);
              const x = C + R * Math.cos(angle);
              const y = C + R * Math.sin(angle);
              const active =
                mode === "h" ? n === h12 : n === min;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    if (mode === "h") {
                      setH12(n);
                      commit(n, min, ampm);
                      setMode("m");
                    } else {
                      setMin(n);
                      commit(h12, n, ampm);
                    }
                  }}
                  style={{ left: x, top: y }}
                  className={`absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full text-sm grid place-items-center ${
                    active ? "bg-accent text-cosmic font-bold" : "hover:bg-white/10"
                  }`}
                >
                  {mode === "h" ? n : String(n).padStart(2, "0")}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-2 mt-3 text-sm">
            <span className="opacity-70">Minute</span>
            <button
              type="button"
              onClick={() => {
                const m = (min + 59) % 60;
                setMin(m);
                setMode("m");
                commit(h12, m, ampm);
              }}
              className="w-7 h-7 rounded bg-black/30 border border-white/15"
            >
              −
            </button>
            <input
              type="number"
              min={0}
              max={59}
              value={min}
              onChange={(e) => {
                let m = parseInt(e.target.value, 10);
                if (isNaN(m)) m = 0;
                m = Math.max(0, Math.min(59, m));
                setMin(m);
                commit(h12, m, ampm);
              }}
              className="w-14 text-center px-2 py-1 rounded bg-black/30 border border-white/10"
            />
            <button
              type="button"
              onClick={() => {
                const m = (min + 1) % 60;
                setMin(m);
                setMode("m");
                commit(h12, m, ampm);
              }}
              className="w-7 h-7 rounded bg-black/30 border border-white/15"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-2 w-full px-3 py-1.5 rounded-lg bg-accent text-cosmic text-sm font-semibold"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
