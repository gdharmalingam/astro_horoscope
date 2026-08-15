"use client";

import { useEffect, useRef, useState } from "react";
import { api, type GeoResult } from "@/lib/api";

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

// Load Leaflet from CDN once (avoids bundler/React-19 peer-dep issues).
let leafletPromise: Promise<any> | null = null;
function loadLeaflet(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if ((window as any).L) return Promise.resolve((window as any).L);
  if (leafletPromise) return leafletPromise;
  leafletPromise = new Promise((resolve, reject) => {
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(css);
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => {
      const L = (window as any).L;
      L.Icon.Default.imagePath = "https://unpkg.com/leaflet@1.9.4/dist/images/";
      resolve(L);
    };
    script.onerror = () => reject(new Error("Failed to load map library"));
    document.head.appendChild(script);
  });
  return leafletPromise;
}

export function LocationPicker({ value, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [status, setStatus] = useState("");

  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const valueRef = useRef(value);
  valueRef.current = value;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Apply a picked coordinate: update parent, move the map, resolve timezone.
  async function applyPick(
    lat: number,
    lon: number,
    tz?: string | null,
    place?: string
  ) {
    const next: LocationValue = {
      latitude: lat,
      longitude: lon,
      timezone: tz ?? valueRef.current.timezone,
      place_name: place ?? valueRef.current.place_name,
    };
    onChangeRef.current(next);
    moveMap(lat, lon);
    if (!tz) {
      try {
        const r = await api.geoTimezone(lat, lon);
        if (r.timezone) {
          onChangeRef.current({ ...valueRef.current, timezone: r.timezone });
        }
      } catch {
        /* timezone stays as-is */
      }
    }
  }

  function moveMap(lat: number, lon: number) {
    const L = (window as any).L;
    if (!mapRef.current || !L) return;
    mapRef.current.setView([lat, lon], Math.max(mapRef.current.getZoom(), 6));
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lon]);
    } else {
      markerRef.current = L.marker([lat, lon]).addTo(mapRef.current);
    }
  }

  // Initialise the map once.
  useEffect(() => {
    let cancelled = false;
    loadLeaflet()
      .then((L) => {
        if (cancelled || !mapDivRef.current || mapRef.current) return;
        const { latitude, longitude } = valueRef.current;
        const map = L.map(mapDivRef.current).setView([latitude, longitude], 5);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(map);
        markerRef.current = L.marker([latitude, longitude]).addTo(map);
        map.on("click", (e: any) => {
          applyPick(e.latlng.lat, e.latlng.lng);
        });
        mapRef.current = map;
      })
      .catch(() => setStatus("Map could not be loaded (offline?)."));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced place search.
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    const handle = setTimeout(async () => {
      try {
        const rows = await api.geoSearch(query.trim());
        setResults(rows);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(handle);
  }, [query]);

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setStatus("Geolocation is not supported by this browser.");
      return;
    }
    setStatus("Locating…");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let place: string | undefined;
        try {
          const rev = await api.geoReverse(latitude, longitude);
          place = rev.display_name;
          await applyPick(latitude, longitude, rev.timezone, place);
        } catch {
          await applyPick(latitude, longitude);
        }
        setStatus("");
      },
      (err) => setStatus(`Could not get location: ${err.message}`),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className="sm:col-span-2 space-y-3">
      <div className="relative">
        <label className="flex flex-col text-sm gap-1">
          Search location (city, town, place)
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Bengaluru, India"
            className="px-3 py-2 rounded bg-black/30 border border-white/10"
          />
        </label>
        {(searching || results.length > 0) && (
          <ul className="absolute z-[1000] mt-1 w-full bg-cosmic border border-white/15 rounded-lg max-h-60 overflow-auto shadow-xl">
            {searching && (
              <li className="px-3 py-2 text-sm opacity-60">Searching…</li>
            )}
            {results.map((r, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => {
                    setQuery(r.display_name);
                    setResults([]);
                    applyPick(r.latitude, r.longitude, r.timezone, r.display_name);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-white/10"
                >
                  {r.display_name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={useCurrentLocation}
          className="px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-sm hover:bg-white/20"
        >
          📍 Use current location
        </button>
        <span className="text-xs opacity-70">
          …or click anywhere on the map to drop a pin.
        </span>
        {status && <span className="text-xs text-amber-300">{status}</span>}
      </div>

      <div
        ref={mapDivRef}
        className="h-64 w-full rounded-lg overflow-hidden border border-white/10"
        style={{ background: "#0b1020" }}
      />

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
            onBlur={(e) =>
              applyPick(Number(e.target.value), value.longitude)
            }
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
            onBlur={(e) =>
              applyPick(value.latitude, Number(e.target.value))
            }
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
    </div>
  );
}
