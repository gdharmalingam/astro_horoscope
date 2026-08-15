"""Unit tests for the Vedic calculation engine."""
from datetime import datetime

import pytest

from app.astro.chart import BirthData, compute_chart
from app.astro.constants import VIMSHOTTARI_TOTAL_YEARS
from app.astro.dasa import compute_vimshottari
from app.astro.ephemeris import describe_longitude

# Reference birth: 14 May 1990, 08:30 local, Bengaluru, India.
REFERENCE = BirthData(
    birth_datetime_local="1990-05-14T08:30:00",
    timezone="Asia/Kolkata",
    latitude=12.9716,
    longitude=77.5946,
)


def test_describe_longitude_boundaries():
    aries_start = describe_longitude("X", 0.0)
    assert aries_start.sign == "Aries"
    assert aries_start.sign_index == 0
    assert aries_start.nakshatra == "Ashwini"
    assert aries_start.pada == 1

    # 360 wraps back to 0 (Aries / Ashwini).
    wrapped = describe_longitude("X", 360.0)
    assert wrapped.sign_index == 0
    assert wrapped.nakshatra_index == 0


def test_chart_structure():
    chart = compute_chart(REFERENCE)
    assert {"meta", "ascendant", "planets", "houses", "dasa"} <= set(chart)
    # Nine grahas: seven planets + Rahu + Ketu.
    assert len(chart["planets"]) == 9
    assert len(chart["houses"]) == 12
    names = {p["name"] for p in chart["planets"]}
    assert {"Sun", "Moon", "Rahu", "Ketu"} <= names


def test_ketu_opposite_rahu():
    chart = compute_chart(REFERENCE)
    rahu = next(p for p in chart["planets"] if p["name"] == "Rahu")
    ketu = next(p for p in chart["planets"] if p["name"] == "Ketu")
    diff = abs(rahu["longitude"] - ketu["longitude"]) % 360
    assert round(diff, 3) == 180.0


def test_house_placement_in_range():
    chart = compute_chart(REFERENCE)
    for planet in chart["planets"]:
        assert 1 <= planet["house"] <= 12
        assert 0 <= planet["sign_index"] <= 11
        assert 1 <= planet["pada"] <= 4


def test_vimshottari_totals_120_years():
    # Moon exactly at a nakshatra boundary => first period is a full (unelapsed) dasa.
    mahadashas = compute_vimshottari(0.0, datetime(1990, 5, 14), depth=1)
    assert len(mahadashas) == 9
    total = sum(m["years"] for m in mahadashas)
    assert total == pytest.approx(VIMSHOTTARI_TOTAL_YEARS, abs=1e-6)


def test_vimshottari_first_period_is_balance():
    # Mid-nakshatra Moon => first mahadasa is only the remaining balance.
    mahadashas = compute_vimshottari(75.0, datetime(1990, 5, 14), depth=1)
    total = sum(m["years"] for m in mahadashas)
    assert total < VIMSHOTTARI_TOTAL_YEARS


def test_vimshottari_subperiods_sum_to_parent():
    mahadashas = compute_vimshottari(75.0, datetime(1990, 5, 14), depth=1)
    for maha in mahadashas:
        sub_total = sum(s["years"] for s in maha["sub_periods"])
        # Allow small drift from rounding each sub-period to 4 decimals.
        assert sub_total == pytest.approx(maha["years"], abs=1e-2)


def test_current_dasa_present():
    chart = compute_chart(REFERENCE)
    current = chart["dasa"]["current"]
    assert current is not None
    assert "lord" in current
