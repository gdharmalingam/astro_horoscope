"""Public API service: chart & dasa calculation authenticated via X-API-Key."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_api_key_client
from app.astro.chart import BirthData, compute_chart
from app.db.session import get_db
from app.models.api_key import ApiKey, ApiUsage
from app.schemas.astro import BirthDataIn

router = APIRouter(prefix="/public/v1", tags=["public-api"])


def _log_usage(db: Session, api_key: ApiKey, endpoint: str, status_code: int = 200) -> None:
    db.add(ApiUsage(api_key_id=api_key.id, endpoint=endpoint, status_code=status_code))
    db.commit()


@router.post("/chart")
def public_chart(
    payload: BirthDataIn,
    db: Session = Depends(get_db),
    api_key: ApiKey = Depends(get_api_key_client),
) -> dict:
    birth = BirthData(
        birth_datetime_local=payload.birth_datetime_local,
        timezone=payload.timezone,
        latitude=payload.latitude,
        longitude=payload.longitude,
    )
    chart = compute_chart(birth, ayanamsa=payload.ayanamsa, dasa_depth=payload.dasa_depth)
    _log_usage(db, api_key, "/public/v1/chart")
    return chart


@router.post("/dasa")
def public_dasa(
    payload: BirthDataIn,
    db: Session = Depends(get_db),
    api_key: ApiKey = Depends(get_api_key_client),
) -> dict:
    birth = BirthData(
        birth_datetime_local=payload.birth_datetime_local,
        timezone=payload.timezone,
        latitude=payload.latitude,
        longitude=payload.longitude,
    )
    chart = compute_chart(birth, ayanamsa=payload.ayanamsa, dasa_depth=payload.dasa_depth)
    _log_usage(db, api_key, "/public/v1/dasa")
    return {"meta": chart["meta"], "dasa": chart["dasa"]}
