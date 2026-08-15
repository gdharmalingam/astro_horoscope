"""API key schemas for the public API service."""
from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ApiKeyCreate(BaseModel):
    name: str = Field(..., max_length=255)


class ApiKeyOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    prefix: str
    revoked_at: datetime | None = None
    last_used_at: datetime | None = None
    created_at: datetime


class ApiKeyCreated(ApiKeyOut):
    # The full plaintext key is returned only once, at creation time.
    api_key: str
