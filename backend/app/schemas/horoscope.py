"""Horoscope schemas."""
from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class HoroscopeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    profile_id: uuid.UUID
    ayanamsa: str
    house_system: str
    chart: dict
    created_at: datetime


class HoroscopeSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    profile_id: uuid.UUID
    ayanamsa: str
    house_system: str
    created_at: datetime
