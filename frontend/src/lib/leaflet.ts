"use client";

// Loads Leaflet from CDN once (avoids bundler/React-19 peer-dep issues).
let leafletPromise: Promise<any> | null = null;

export function loadLeaflet(): Promise<any> {
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
