"""Birth data profile: the raw inputs required to compute a horoscope."""
from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.db.types import GUID


class BirthProfile(Base):
    __tablename__ = "birth_profiles"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    sex: Mapped[str | None] = mapped_column(String(16), nullable=True)
    # Local date/time of birth as an ISO string (naive local time at birth place).
    birth_datetime_local: Mapped[str] = mapped_column(String(32), nullable=False)
    # IANA timezone, e.g. "Asia/Kolkata". Resolved from coordinates if omitted.
    timezone: Mapped[str] = mapped_column(String(64), nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    place_name: Mapped[str | None] = mapped_column(String(255), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="profiles")
    horoscopes: Mapped[list["Horoscope"]] = relationship(
        back_populates="profile", cascade="all, delete-orphan"
    )
