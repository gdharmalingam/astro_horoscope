"""Geocoding and timezone lookup for birth-location entry.

- Timezone from coordinates uses ``timezonefinder`` (fully offline).
- Place search / reverse geocoding proxies OpenStreetMap Nominatim (no API key).
  Requests are made server-side so we can send a proper User-Agent and keep the
  frontend free of third-party keys.
"""
from __future__ import annotations

import httpx
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from timezonefinder import TimezoneFinder

router = APIRouter(prefix="/geo", tags=["geo"])

# TimezoneFinder loads its data once; reuse a single instance.
_tf = TimezoneFinder()

_NOMINATIM = "https://nominatim.openstreetmap.org"
# Nominatim's usage policy requires an identifying User-Agent.
_HEADERS = {"User-Agent": "VedicHoroscopeApp/1.0 (birth-location lookup)"}
_TIMEOUT = httpx.Timeout(10.0)


class GeoResult(BaseModel):
    display_name: str
    latitude: float
    longitude: float
    timezone: str | None = None


class TimezoneResult(BaseModel):
    latitude: float
    longitude: float
    timezone: str | None = None


def _timezone_at(lat: float, lon: float) -> str | None:
    tz = _tf.timezone_at(lat=lat, lng=lon)
    if tz is None:
        tz = _tf.certain_timezone_at(lat=lat, lng=lon)
    return tz


@router.get("/timezone", response_model=TimezoneResult)
def timezone_at(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
) -> TimezoneResult:
    """Resolve the IANA timezone for a coordinate (offline, no network)."""
    return TimezoneResult(latitude=lat, longitude=lon, timezone=_timezone_at(lat, lon))


@router.get("/search", response_model=list[GeoResult])
async def search(
    q: str = Query(..., min_length=2, max_length=200),
    limit: int = Query(default=5, ge=1, le=10),
) -> list[GeoResult]:
    """Forward-geocode a place name to candidate coordinates + timezone."""
    params = {"q": q, "format": "jsonv2", "limit": limit, "addressdetails": 0}
    try:
        async with httpx.AsyncClient(timeout=_TIMEOUT, headers=_HEADERS) as client:
            resp = await client.get(f"{_NOMINATIM}/search", params=params)
            resp.raise_for_status()
            rows = resp.json()
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"Geocoding service error: {exc}") from exc

    results: list[GeoResult] = []
    for row in rows:
        try:
            lat = float(row["lat"])
            lon = float(row["lon"])
        except (KeyError, ValueError):
            continue
        results.append(
            GeoResult(
                display_name=row.get("display_name", q),
                latitude=lat,
                longitude=lon,
                timezone=_timezone_at(lat, lon),
            )
        )
    return results


@router.get("/reverse", response_model=GeoResult)
async def reverse(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
) -> GeoResult:
    """Reverse-geocode a coordinate to a place name + timezone."""
    tz = _timezone_at(lat, lon)
    params = {"lat": lat, "lon": lon, "format": "jsonv2"}
    display_name = f"{lat:.4f}, {lon:.4f}"
    try:
        async with httpx.AsyncClient(timeout=_TIMEOUT, headers=_HEADERS) as client:
            resp = await client.get(f"{_NOMINATIM}/reverse", params=params)
            resp.raise_for_status()
            display_name = resp.json().get("display_name", display_name)
    except httpx.HTTPError:
        # Coordinates + timezone are still useful even if naming fails.
        pass
    return GeoResult(display_name=display_name, latitude=lat, longitude=lon, timezone=tz)
