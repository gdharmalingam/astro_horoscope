"""Pydantic schemas for chart calculation input and output."""
from __future__ import annotations

from pydantic import BaseModel, Field


class BirthDataIn(BaseModel):
    birth_datetime_local: str = Field(
        ..., description="Local birth datetime in ISO 8601, e.g. 1990-05-14T08:30:00"
    )
    timezone: str = Field(..., description="IANA timezone, e.g. Asia/Kolkata")
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    ayanamsa: str = Field(default="lahiri")
    node: str = Field(default="mean", description="Rahu/Ketu node model: mean | true")
    dasa_depth: int = Field(default=2, ge=1, le=3)
    name: str | None = Field(default=None, max_length=255)
    sex: str | None = Field(default=None, description="male | female | other")


class ChartOut(BaseModel):
    meta: dict
    ascendant: dict
    planets: list[dict]
    houses: list[dict]
    dasa: dict
    divisional: dict | None = None
    predictions: dict | None = None


class MatchIn(BaseModel):
    boy: BirthDataIn
    girl: BirthDataIn


class TransitIn(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
