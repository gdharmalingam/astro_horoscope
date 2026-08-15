"use client";

import { useEffect, useState } from "react";
import { api, type GeoResult } from "@/lib/api";
import { MapModal } from "./MapModal";

export interface LocationValue {
  latitude: number;
  longitude: number;
  timezone: string;
  place_name?: string;
}

interface Props {
  value: LocationValue;
  onChange: (value: LocationValue) => void;
}

export function LocationField({ value, onChange }: Props) {
  const [query, setQuery] = useState(value.place_name ?? "");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);

  // Reflect an externally-set place (map pick, reverse geocode, saved profile)
  // back into the search bar. Fires only when the selected place actually
  // changes, so it never clobbers what the user is currently typing.
  useEffect(() => {
    setQuery(value.place_name ?? "");
  }, [value.place_name]);

  useEffect(() => {
    if (query.trim().length < 2 || !open) {
      setResults([]);
      return;
    }
    setSearching(true);
    const handle = setTimeout(async () => {
      try {
        setResults(await api.geoSearch(query.trim()));
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(handle);
  }, [query, open]);

  function select(r: GeoResult) {
    setQuery(r.display_name);
    setResults([]);
    setOpen(false);
    onChange({
      latitude: r.latitude,
      longitude: r.longitude,
      timezone: r.timezone ?? value.timezone,
      place_name: r.display_name,
    });
  }

  return (
    <div>
      <label className="text-sm">Place of birth</label>
      <div className="relative mt-1 flex gap-2">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          placeholder="Search city, town or place…"
          className="flex-1 px-3 py-2 rounded bg-black/30 border border-white/10"
        />
        <button
          type="button"
          onClick={() => setMapOpen(true)}
          title="Pick / adjust on map"
          aria-label="Pick on map"
          className="shrink-0 px-3 rounded-lg bg-white/10 border border-white/15 hover:bg-white/20"
        >
          🗺️
        </button>
        {open && (searching || results.length > 0) && (
          <ul className="absolute z-[1000] top-full left-0 right-0 mt-1 bg-cosmic border border-white/15 rounded-lg max-h-60 overflow-auto shadow-xl">
            {searching && (
              <li className="px-3 py-2 text-sm opacity-60">Searching…</li>
            )}
            {results.map((r, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => select(r)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-white/10"
                >
                  {r.display_name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {mapOpen && (
        <MapModal
          value={value}
          onChange={onChange}
          onClose={() => setMapOpen(false)}
        />
      )}
    </div>
  );
}
