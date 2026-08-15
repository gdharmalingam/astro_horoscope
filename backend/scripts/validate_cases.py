"""Print a reference table of 10 timezone-diverse charts for cross-checking.

Run:  python scripts/validate_cases.py   (from the backend/ directory)

Compare the printed values against astrosage.com (Lahiri ayanamsa, whole-sign
houses, mean-node Rahu) for each birth entry.
"""
from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.astro.chart import BirthData, compute_chart  # noqa: E402

CASES = [
    ("Kanchipuram, IN", "1986-07-10T13:20:00", "Asia/Kolkata", 12.8342, 79.7036),
    ("New York, US", "1990-01-15T08:30:00", "America/New_York", 40.7128, -74.0060),
    ("London, UK", "1975-06-21T18:45:00", "Europe/London", 51.5074, -0.1278),
    ("Tokyo, JP", "2000-12-31T23:59:00", "Asia/Tokyo", 35.6762, 139.6503),
    ("Sydney, AU", "1995-03-10T05:15:00", "Australia/Sydney", -33.8688, 151.2093),
    ("Los Angeles, US", "1988-09-05T14:00:00", "America/Los_Angeles", 34.0522, -118.2437),
    ("Dubai, AE", "2010-02-28T11:11:00", "Asia/Dubai", 25.2048, 55.2708),
    ("Moscow, RU", "1969-11-11T02:20:00", "Europe/Moscow", 55.7558, 37.6173),
    ("Sao Paulo, BR", "1983-07-04T20:50:00", "America/Sao_Paulo", -23.5505, -46.6333),
    ("Johannesburg, ZA", "2005-05-19T09:45:00", "Africa/Johannesburg", -26.2041, 28.0473),
]


def main() -> None:
    for label, dt, tz, lat, lon in CASES:
        chart = compute_chart(
            BirthData(birth_datetime_local=dt, timezone=tz, latitude=lat, longitude=lon),
            dasa_depth=1,
        )
        asc = chart["ascendant"]
        moon = next(p for p in chart["planets"] if p["name"] == "Moon")
        sun = next(p for p in chart["planets"] if p["name"] == "Sun")
        md = chart["dasa"]["mahadashas"][0]
        cur = chart["dasa"]["current"]
        print(f"\n=== {label}  {dt}  {tz} ===")
        print(f"  Ascendant : {asc['sign']:11} {asc['degree_in_sign']:5.2f}   nak {asc['nakshatra']}")
        print(f"  Moon      : {moon['sign']:11} {moon['degree_in_sign']:5.2f}   nak {moon['nakshatra']} pada {moon['pada']}")
        print(f"  Sun       : {sun['sign']:11} {sun['degree_in_sign']:5.2f}")
        print("  Planets   : " + ", ".join(
            f"{p['name']} {p['sign']} {p['degree_in_sign']:.1f}{'(R)' if p['retrograde'] else ''}"
            for p in chart["planets"]
        ))
        print(f"  1st Dasa  : {md['lord']} balance until {md['end']}")
        print(f"  Current   : {cur['lord']} / {cur['sub']['lord'] if cur.get('sub') else '-'}")


if __name__ == "__main__":
    main()
