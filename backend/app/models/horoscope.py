"""Stored computed horoscope (chart + dasa) linked to a birth profile."""
from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.db.types import GUID, JSONType


class Horoscope(Base):
    __tablename__ = "horoscopes"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    profile_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("birth_profiles.id", ondelete="CASCADE"), index=True
    )
    ayanamsa: Mapped[str] = mapped_column(String(32), default="lahiri", nullable=False)
    house_system: Mapped[str] = mapped_column(String(32), default="whole_sign", nullable=False)
    # Full computed chart payload (planets, ascendant, houses, nakshatra, dasa tree).
    chart: Mapped[dict] = mapped_column(JSONType, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    profile: Mapped["BirthProfile"] = relationship(back_populates="horoscopes")
