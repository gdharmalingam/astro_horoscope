"""Divisional (varga) chart sign placements from sidereal longitudes.

Each function maps an absolute sidereal longitude to a sign index (0-11) for a
given division, using classical Parashari rules.
"""
from __future__ import annotations

from app.astro.constants import SIGNS

# Divisions exposed to the API (D-1 is the main Rasi chart, handled separately).
DIVISIONS: list[tuple[str, int]] = [
    ("D2", 2),
    ("D3", 3),
    ("D7", 7),
    ("D9", 9),
    ("D10", 10),
    ("D12", 12),
]


def varga_sign(longitude: float, division: int) -> int:
    """Return the sign index (0-11) a longitude falls in for a given division."""
    longitude = longitude % 360.0
    s0 = int(longitude // 30)  # 0-indexed sign
    d = longitude - s0 * 30.0  # degrees into the sign
    odd = (s0 + 1) % 2 == 1  # odd sign number (Aries=1 is odd)

    if division == 1:
        return s0
    if division == 2:  # Hora — Cancer / Leo only
        first = d < 15
        if odd:
            return 4 if first else 3  # Leo, then Cancer
        return 3 if first else 4  # Cancer, then Leo
    if division == 3:  # Drekkana — 1st, 5th, 9th from the sign
        part = int(d // 10)
        return (s0 + 4 * part) % 12
    if division == 7:  # Saptamsa
        part = int(d // (30 / 7))
        start = s0 if odd else (s0 + 6) % 12
        return (start + part) % 12
    if division == 9:  # Navamsa — continuous 3°20' mapping
        return int(longitude // (10 / 3)) % 12
    if division == 10:  # Dasamsa
        part = int(d // 3)
        start = s0 if odd else (s0 + 8) % 12
        return (start + part) % 12
    if division == 12:  # Dwadasamsa
        part = int(d // 2.5)
        return (s0 + part) % 12
    return s0


def compute_divisionals(ascendant_longitude: float, planets: list) -> dict:
    """Build divisional charts for each configured division.

    ``planets`` is a list of objects exposing ``name`` and ``longitude``.
    Returns ``{ "D9": {ascendant, planets:[{name, sign_index, house}]}, ... }``.
    """
    charts: dict = {}
    for code, div in DIVISIONS:
        asc_sign = varga_sign(ascendant_longitude, div)
        planet_dicts = []
        for p in planets:
            sign_index = varga_sign(p.longitude, div)
            planet_dicts.append(
                {
                    "name": p.name,
                    "sign_index": sign_index,
                    "sign": SIGNS[sign_index],
                    "house": (sign_index - asc_sign) % 12 + 1,
                }
            )
        charts[code] = {
            "division": div,
            "ascendant": {"sign_index": asc_sign, "sign": SIGNS[asc_sign]},
            "planets": planet_dicts,
            "houses": [
                {"house": i + 1, "sign_index": (asc_sign + i) % 12} for i in range(12)
            ],
        }
    return charts
