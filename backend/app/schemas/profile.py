"""Birth profile schemas."""
from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ProfileBase(BaseModel):
    name: str = Field(..., max_length=255)
    sex: str | None = Field(default=None, max_length=16)
    birth_datetime_local: str = Field(..., description="ISO local datetime")
    timezone: str = Field(..., max_length=64)
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    place_name: str | None = Field(default=None, max_length=255)


class ProfileCreate(ProfileBase):
    pass


class ProfileUpdate(ProfileBase):
    pass


class ProfileOut(ProfileBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
