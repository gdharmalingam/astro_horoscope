"""Vimshottari dasa computation derived from the Moon's nakshatra position."""
from __future__ import annotations

from datetime import datetime, timedelta

from app.astro.constants import (
    NAKSHATRA_SPAN,
    VIMSHOTTARI_SEQUENCE,
    VIMSHOTTARI_TOTAL_YEARS,
)

# Length of a solar year in days used to convert dasa years to calendar dates.
DAYS_PER_YEAR = 365.25

_LORD_ORDER = [lord for lord, _ in VIMSHOTTARI_SEQUENCE]
_LORD_YEARS = dict(VIMSHOTTARI_SEQUENCE)


def _sequence_from(lord: str) -> list[str]:
    """Return the 9-lord Vimshottari order starting from the given lord."""
    start = _LORD_ORDER.index(lord)
    return [_LORD_ORDER[(start + i) % 9] for i in range(9)]


def _add_years(start: datetime, years: float) -> datetime:
    return start + timedelta(days=years * DAYS_PER_YEAR)


def _sub_periods(parent_lord: str, parent_years: float, start: datetime, depth: int) -> list[dict]:
    """Recursively build antar / pratyantar sub-periods within a parent period."""
    if depth == 0:
        return []
    periods: list[dict] = []
    cursor = start
    for lord in _sequence_from(parent_lord):
        span_years = parent_years * _LORD_YEARS[lord] / VIMSHOTTARI_TOTAL_YEARS
        end = _add_years(cursor, span_years)
        periods.append(
            {
                "lord": lord,
                "start": cursor.date().isoformat(),
                "end": end.date().isoformat(),
                "years": round(span_years, 4),
                "sub_periods": _sub_periods(lord, span_years, cursor, depth - 1),
            }
        )
        cursor = end
    return periods


def compute_vimshottari(moon_longitude: float, birth_dt: datetime, depth: int = 2) -> list[dict]:
    """Compute the Vimshottari mahadasa sequence with nested sub-periods.

    depth=1 -> mahadasa + antardasa; depth=2 -> also pratyantardasa.
    """
    moon_longitude = moon_longitude % 360.0
    nak_index = int(moon_longitude // NAKSHATRA_SPAN)
    start_lord = _LORD_ORDER[nak_index % 9]

    position_in_nak = moon_longitude - nak_index * NAKSHATRA_SPAN
    fraction_elapsed = position_in_nak / NAKSHATRA_SPAN

    # The first mahadasa is only the unelapsed balance of the birth-nakshatra lord.
    balance_years = _LORD_YEARS[start_lord] * (1 - fraction_elapsed)

    mahadashas: list[dict] = []
    cursor = birth_dt
    order = _sequence_from(start_lord)

    for i, lord in enumerate(order):
        years = balance_years if i == 0 else float(_LORD_YEARS[lord])
        end = _add_years(cursor, years)
        mahadashas.append(
            {
                "lord": lord,
                "start": cursor.date().isoformat(),
                "end": end.date().isoformat(),
                "years": round(years, 4),
                "sub_periods": _sub_periods(lord, years, cursor, depth),
            }
        )
        cursor = end

    return mahadashas


def current_dasa(mahadashas: list[dict], on_date: datetime | None = None) -> dict | None:
    """Return the maha/antar/pratyantar lords active on a given date."""
    on = (on_date or datetime.utcnow()).date().isoformat()

    def find_active(periods: list[dict]) -> dict | None:
        for period in periods:
            if period["start"] <= on < period["end"]:
                result = {"lord": period["lord"], "start": period["start"], "end": period["end"]}
                if period.get("sub_periods"):
                    result["sub"] = find_active(period["sub_periods"])
                return result
        return None

    return find_active(mahadashas)
