"""Authenticated horoscope endpoints: calculate, save, list, retrieve, delete."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.astro.chart import BirthData, compute_chart
from app.astro.ephemeris import compute_ascendant, compute_planets, to_julian_day_ut
from app.astro.matchmaking import guna_milan
from app.db.session import get_db
from app.models.birth_profile import BirthProfile
from app.models.horoscope import Horoscope
from app.models.user import User
from app.schemas.astro import BirthDataIn, ChartOut, MatchIn, TransitIn
from app.schemas.horoscope import HoroscopeOut, HoroscopeSummary

router = APIRouter(prefix="/horoscopes", tags=["horoscopes"])


def _moon_indices(payload: BirthDataIn) -> tuple[int, int]:
    """Return (nakshatra_index, sign_index) of the Moon for a birth payload."""
    jd = to_julian_day_ut(payload.birth_datetime_local, payload.timezone)
    moon = next(p for p in compute_planets(jd) if p.name == "Moon")
    return moon.nakshatra_index, moon.sign_index


@router.post("/calculate", response_model=ChartOut)
def calculate(payload: BirthDataIn) -> dict:
    """Compute a chart without persisting it. Public: no sign-in required."""
    birth = BirthData(
        birth_datetime_local=payload.birth_datetime_local,
        timezone=payload.timezone,
        latitude=payload.latitude,
        longitude=payload.longitude,
        name=payload.name,
        sex=payload.sex,
    )
    return compute_chart(
        birth, ayanamsa=payload.ayanamsa, dasa_depth=payload.dasa_depth, node=payload.node
    )


@router.post("/match")
def match(payload: MatchIn) -> dict:
    """Ashtakoota (Guna Milan) compatibility between two birth charts. Public."""
    boy_nak, boy_rasi = _moon_indices(payload.boy)
    girl_nak, girl_rasi = _moon_indices(payload.girl)
    result = guna_milan(boy_nak, boy_rasi, girl_nak, girl_rasi)
    result["boy"]["name"] = payload.boy.name
    result["girl"]["name"] = payload.girl.name
    return result


@router.post("/transit")
def transit(payload: TransitIn) -> dict:
    """Current sidereal planetary positions and ascendant for a location. Public."""
    now = datetime.now(timezone.utc)
    jd = to_julian_day_ut(now.strftime("%Y-%m-%dT%H:%M:%S"), "UTC")
    ascendant = compute_ascendant(jd, payload.latitude, payload.longitude)
    planets = compute_planets(jd)
    planet_dicts = []
    for p in planets:
        data = p.to_dict()
        data["house"] = (p.sign_index - ascendant.sign_index) % 12 + 1
        planet_dicts.append(data)
    houses = [
        {"house": i + 1, "sign_index": (ascendant.sign_index + i) % 12} for i in range(12)
    ]
    return {
        "meta": {"datetime_utc": now.isoformat(timespec="minutes")},
        "ascendant": ascendant.to_dict(),
        "planets": planet_dicts,
        "houses": houses,
    }


@router.post("/from-profile/{profile_id}", response_model=HoroscopeOut, status_code=201)
def create_from_profile(
    profile_id: uuid.UUID,
    ayanamsa: str = "lahiri",
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Horoscope:
    """Compute and persist a horoscope for one of the user's birth profiles."""
    profile = db.get(BirthProfile, profile_id)
    if profile is None or profile.user_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Profile not found")

    chart = compute_chart(
        BirthData(
            birth_datetime_local=profile.birth_datetime_local,
            timezone=profile.timezone,
            latitude=profile.latitude,
            longitude=profile.longitude,
        ),
        ayanamsa=ayanamsa,
    )
    horoscope = Horoscope(profile_id=profile.id, ayanamsa=ayanamsa, chart=chart)
    db.add(horoscope)
    db.commit()
    db.refresh(horoscope)
    return horoscope


@router.get("", response_model=list[HoroscopeSummary])
def list_horoscopes(
    db: Session = Depends(get_db), user: User = Depends(get_current_user)
) -> list[Horoscope]:
    return list(
        db.scalars(
            select(Horoscope)
            .join(BirthProfile)
            .where(BirthProfile.user_id == user.id)
            .order_by(Horoscope.created_at.desc())
        ).all()
    )


@router.get("/{horoscope_id}", response_model=HoroscopeOut)
def get_horoscope(
    horoscope_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Horoscope:
    horoscope = db.get(Horoscope, horoscope_id)
    if horoscope is None or horoscope.profile.user_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Horoscope not found")
    return horoscope


@router.delete("/{horoscope_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_horoscope(
    horoscope_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    horoscope = db.get(Horoscope, horoscope_id)
    if horoscope is None or horoscope.profile.user_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Horoscope not found")
    db.delete(horoscope)
    db.commit()
