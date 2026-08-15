"""Swiss Ephemeris interface for sidereal (Vedic) calculations.

Wraps pyswisseph to produce sidereal planetary longitudes, the ascendant,
and derived rasi / nakshatra data using the Lahiri ayanamsa.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from zoneinfo import ZoneInfo

import swisseph as swe

from app.astro.constants import (
    NAKSHATRA_LORDS,
    NAKSHATRA_SPAN,
    NAKSHATRAS,
    PADA_SPAN,
    SIGNS,
)
from app.core.config import settings

# Planet identifiers used by pyswisseph. Rahu is the mean lunar node; Ketu is
# derived as the point exactly opposite Rahu.
_PLANET_IDS = {
    "Sun": swe.SUN,
    "Moon": swe.MOON,
    "Mars": swe.MARS,
    "Mercury": swe.MERCURY,
    "Jupiter": swe.JUPITER,
    "Venus": swe.VENUS,
    "Saturn": swe.SATURN,
    "Rahu": swe.MEAN_NODE,
}

_AYANAMSA_MODES = {
    "lahiri": swe.SIDM_LAHIRI,
    "raman": swe.SIDM_RAMAN,
    "krishnamurti": swe.SIDM_KRISHNAMURTI,
}

_initialised = False


def init_ephemeris(ayanamsa: str = "lahiri") -> None:
    """Point pyswisseph at the ephemeris data and select the sidereal mode."""
    global _initialised
    swe.set_ephe_path(settings.ephemeris_path)
    swe.set_sid_mode(_AYANAMSA_MODES.get(ayanamsa, swe.SIDM_LAHIRI), 0, 0)
    _initialised = True


def _ensure_initialised(ayanamsa: str) -> None:
    if not _initialised:
        init_ephemeris(ayanamsa)
    else:
        swe.set_sid_mode(_AYANAMSA_MODES.get(ayanamsa, swe.SIDM_LAHIRI), 0, 0)


def to_julian_day_ut(birth_datetime_local: str, timezone: str) -> float:
    """Convert a naive local birth datetime + IANA timezone to Julian Day (UT)."""
    local_dt = datetime.fromisoformat(birth_datetime_local)
    if local_dt.tzinfo is None:
        local_dt = local_dt.replace(tzinfo=ZoneInfo(timezone))
    utc_dt = local_dt.astimezone(ZoneInfo("UTC"))
    hour_decimal = utc_dt.hour + utc_dt.minute / 60.0 + utc_dt.second / 3600.0
    return swe.julday(utc_dt.year, utc_dt.month, utc_dt.day, hour_decimal, swe.GREG_CAL)


@dataclass
class PlanetPosition:
    name: str
    longitude: float  # sidereal ecliptic longitude in degrees [0, 360)
    sign: str
    sign_index: int
    degree_in_sign: float
    nakshatra: str
    nakshatra_index: int
    pada: int
    nakshatra_lord: str
    retrograde: bool

    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "longitude": round(self.longitude, 6),
            "sign": self.sign,
            "sign_index": self.sign_index,
            "degree_in_sign": round(self.degree_in_sign, 6),
            "nakshatra": self.nakshatra,
            "nakshatra_index": self.nakshatra_index,
            "pada": self.pada,
            "nakshatra_lord": self.nakshatra_lord,
            "retrograde": self.retrograde,
        }


def describe_longitude(name: str, longitude: float, retrograde: bool = False) -> PlanetPosition:
    """Derive sign, nakshatra and pada from a sidereal longitude."""
    longitude = longitude % 360.0
    sign_index = int(longitude // 30)
    degree_in_sign = longitude - sign_index * 30
    nak_index = int(longitude // NAKSHATRA_SPAN)
    pada = int((longitude % NAKSHATRA_SPAN) // PADA_SPAN) + 1
    return PlanetPosition(
        name=name,
        longitude=longitude,
        sign=SIGNS[sign_index],
        sign_index=sign_index,
        degree_in_sign=degree_in_sign,
        nakshatra=NAKSHATRAS[nak_index],
        nakshatra_index=nak_index,
        pada=pada,
        nakshatra_lord=NAKSHATRA_LORDS[nak_index],
        retrograde=retrograde,
    )


def _calc(jd_ut: float, planet_id: int) -> tuple:
    """Calculate a planet, preferring Swiss files and falling back to Moshier."""
    base = swe.FLG_SIDEREAL | swe.FLG_SPEED
    values, retflag = swe.calc_ut(jd_ut, planet_id, base | swe.FLG_SWIEPH)
    if retflag < 0:
        # Swiss Ephemeris data files unavailable; use the built-in Moshier model.
        values, retflag = swe.calc_ut(jd_ut, planet_id, base | swe.FLG_MOSEPH)
    return values


def compute_planets(
    jd_ut: float, ayanamsa: str = "lahiri", node: str = "mean"
) -> list[PlanetPosition]:
    """Compute sidereal positions for the nine grahas (planets + Rahu/Ketu).

    ``node`` selects the lunar node model for Rahu/Ketu: "mean" or "true".
    """
    _ensure_initialised(ayanamsa)
    node_id = swe.TRUE_NODE if node == "true" else swe.MEAN_NODE
    positions: list[PlanetPosition] = []

    for name, planet_id in _PLANET_IDS.items():
        pid = node_id if name == "Rahu" else planet_id
        values = _calc(jd_ut, pid)
        longitude = values[0]
        speed = values[3]
        # Nodes are always treated as retrograde in Vedic convention.
        retro = speed < 0 or name == "Rahu"
        positions.append(describe_longitude(name, longitude, retrograde=retro))

    # Ketu is exactly opposite Rahu.
    rahu = next(p for p in positions if p.name == "Rahu")
    positions.append(describe_longitude("Ketu", rahu.longitude + 180.0, retrograde=True))
    return positions


def compute_ascendant(
    jd_ut: float, latitude: float, longitude: float, ayanamsa: str = "lahiri"
) -> PlanetPosition:
    """Compute the sidereal ascendant (Lagna)."""
    _ensure_initialised(ayanamsa)
    # 'W' = whole-sign; ascmc[0] is the ascendant longitude regardless of house system.
    _, ascmc = swe.houses_ex(
        jd_ut, latitude, longitude, b"W", swe.FLG_SIDEREAL
    )
    return describe_longitude("Ascendant", ascmc[0])
