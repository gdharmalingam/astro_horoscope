"""High-level chart assembly: combines ephemeris, houses and dasa into one payload."""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

from app.astro.dasa import compute_vimshottari, current_dasa
from app.astro.ephemeris import (
    compute_ascendant,
    compute_planets,
    to_julian_day_ut,
)
from app.astro.predictions import build_predictions
from app.astro.varga import compute_divisionals


@dataclass
class BirthData:
    birth_datetime_local: str  # ISO local datetime, e.g. "1990-05-14T08:30:00"
    timezone: str  # IANA tz, e.g. "Asia/Kolkata"
    latitude: float
    longitude: float
    name: str | None = None
    sex: str | None = None


def _whole_sign_house(planet_sign_index: int, asc_sign_index: int) -> int:
    """House number (1-12) using the whole-sign system."""
    return (planet_sign_index - asc_sign_index) % 12 + 1


def compute_chart(birth: BirthData, ayanamsa: str = "lahiri", dasa_depth: int = 2, node: str = "mean") -> dict:
    """Compute a complete sidereal chart with planets, houses and Vimshottari dasa."""
    jd_ut = to_julian_day_ut(birth.birth_datetime_local, birth.timezone)

    ascendant = compute_ascendant(jd_ut, birth.latitude, birth.longitude, ayanamsa)
    planets = compute_planets(jd_ut, ayanamsa, node)

    planet_dicts = []
    for planet in planets:
        data = planet.to_dict()
        data["house"] = _whole_sign_house(planet.sign_index, ascendant.sign_index)
        planet_dicts.append(data)

    moon = next(p for p in planets if p.name == "Moon")
    birth_dt = datetime.fromisoformat(birth.birth_datetime_local)
    mahadashas = compute_vimshottari(moon.longitude, birth_dt, depth=dasa_depth)
    dasa_current = current_dasa(mahadashas)

    # Whole-sign houses: 12 signs anchored on the ascendant sign.
    houses = [
        {
            "house": i + 1,
            "sign_index": (ascendant.sign_index + i) % 12,
        }
        for i in range(12)
    ]

    divisional = compute_divisionals(ascendant.longitude, planets)
    predictions = build_predictions(
        ascendant.sign, moon.sign, dasa_current.get("lord") if dasa_current else None
    )

    return {
        "meta": {
            "ayanamsa": ayanamsa,
            "node": node,
            "house_system": "whole_sign",
            "julian_day_ut": round(jd_ut, 8),
            "birth_datetime_local": birth.birth_datetime_local,
            "timezone": birth.timezone,
            "latitude": birth.latitude,
            "longitude": birth.longitude,
            "name": birth.name,
            "sex": birth.sex,
        },
        "ascendant": ascendant.to_dict(),
        "planets": planet_dicts,
        "houses": houses,
        "dasa": {
            "system": "vimshottari",
            "mahadashas": mahadashas,
            "current": dasa_current,
        },
        "divisional": divisional,
        "predictions": predictions,
    }
