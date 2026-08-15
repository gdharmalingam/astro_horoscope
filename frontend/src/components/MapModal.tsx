"use client";

import { useEffect, useRef, useState } from "react";
import { api, type GeoResult } from "@/lib/api";
import { loadLeaflet } from "@/lib/leaflet";
import type { LocationValue } from "./LocationField";

interface Props {
  value: LocationValue;
  onChange: (value: LocationValue) => void;
  onClose: () => void;
}

export function MapModal({ value, onChange, onClose }: Props) {
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const valueRef = useRef(value);
  valueRef.current = value;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [searching, setSearching] = useState(false);

  async function pick(lat: number, lon: number) {
    onChangeRef.current({ ...valueRef.current, latitude: lat, longitude: lon });
    const L = (window as any).L;
    if (mapRef.current) {
      if (markerRef.current) markerRef.current.setLatLng([lat, lon]);
      else if (L) markerRef.current = L.marker([lat, lon]).addTo(mapRef.current);
      mapRef.current.panTo([lat, lon]);
    }
    try {
      const r = await api.geoReverse(lat, lon);
      onChangeRef.current({
        ...valueRef.current,
        timezone: r.timezone ?? valueRef.current.timezone,
        place_name: r.display_name,
      });
    } catch {
      // Timezone-only fallback if reverse geocoding fails.
      try {
        const tz = await api.geoTimezone(lat, lon);
        if (tz.timezone)
          onChangeRef.current({ ...valueRef.current, timezone: tz.timezone });
      } catch {
        /* keep current timezone */
      }
    }
  }

  function selectResult(r: GeoResult) {
    setResults([]);
    setQuery(r.display_name);
    onChangeRef.current({
      latitude: r.latitude,
      longitude: r.longitude,
      timezone: r.timezone ?? valueRef.current.timezone,
      place_name: r.display_name,
    });
    if (mapRef.current) {
      mapRef.current.setView([r.latitude, r.longitude], 11);
      const L = (window as any).L;
      if (markerRef.current) markerRef.current.setLatLng([r.latitude, r.longitude]);
      else if (L) markerRef.current = L.marker([r.latitude, r.longitude]).addTo(mapRef.current);
    }
  }

  // Debounced place search inside the map.
  useEffect(() => {
    if (query.trim().length < 2) {
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
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    loadLeaflet()
      .then((L) => {
        if (cancelled || !mapDivRef.current || mapRef.current) return;
        const { latitude, longitude } = valueRef.current;
        const unset = latitude === 0 && longitude === 0;
        const map = L.map(mapDivRef.current).setView(
          unset ? [20, 0] : [latitude, longitude],
          unset ? 2 : 6
        );
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(map);
        if (!unset) markerRef.current = L.marker([latitude, longitude]).addTo(map);
        map.on("click", (e: any) => pick(e.latlng.lat, e.latlng.lng));
        mapRef.current = map;
        // Leaflet needs a resize nudge inside a freshly-shown modal.
        setTimeout(() => map.invalidateSize(), 50);
      })
      .catch(() => setStatus("Map could not be loaded (offline?)."));
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-2xl bg-cosmic border border-white/15 rounded-2xl p-5 space-y-4 shadow-2xl">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-accent">Pick location on map</h2>
          <button
            onClick={onClose}
            className="opacity-60 hover:opacity-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <p className="text-xs opacity-70">
          Search a place or click anywhere on the map to drop a pin.
        </p>

        <div className="relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search city, town or place…"
            className="w-full px-3 py-2 rounded bg-black/30 border border-white/10"
          />
          {(searching || results.length > 0) && (
            <ul className="absolute z-[1000] mt-1 w-full bg-cosmic border border-white/15 rounded-lg max-h-52 overflow-auto shadow-xl">
              {searching && (
                <li className="px-3 py-2 text-sm opacity-60">Searching…</li>
              )}
              {results.map((r, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => selectResult(r)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-white/10"
                  >
                    {r.display_name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div
          ref={mapDivRef}
          className="h-72 w-full rounded-lg overflow-hidden border border-white/10"
          style={{ background: "var(--chart-bg)" }}
        />
        {status && <p className="text-xs text-amber-300">{status}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="flex flex-col text-sm gap-1">
            Latitude
            <input
              type="number"
              step="any"
              value={value.latitude}
              onChange={(e) =>
                onChange({ ...value, latitude: Number(e.target.value) })
              }
              onBlur={(e) => pick(Number(e.target.value), value.longitude)}
              className="px-3 py-2 rounded bg-black/30 border border-white/10"
            />
          </label>
          <label className="flex flex-col text-sm gap-1">
            Longitude
            <input
              type="number"
              step="any"
              value={value.longitude}
              onChange={(e) =>
                onChange({ ...value, longitude: Number(e.target.value) })
              }
              onBlur={(e) => pick(value.latitude, Number(e.target.value))}
              className="px-3 py-2 rounded bg-black/30 border border-white/10"
            />
          </label>
          <label className="flex flex-col text-sm gap-1">
            Timezone (IANA)
            <input
              value={value.timezone}
              onChange={(e) => onChange({ ...value, timezone: e.target.value })}
              className="px-3 py-2 rounded bg-black/30 border border-white/10"
            />
          </label>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-accent text-cosmic font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
