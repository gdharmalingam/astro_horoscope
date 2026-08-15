"""CRUD endpoints for a user's birth profiles."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.birth_profile import BirthProfile
from app.models.user import User
from app.schemas.profile import ProfileCreate, ProfileOut, ProfileUpdate

router = APIRouter(prefix="/profiles", tags=["profiles"])

MAX_PROFILES_PER_USER = 5


def _get_owned_profile(db: Session, profile_id: uuid.UUID, user: User) -> BirthProfile:
    profile = db.get(BirthProfile, profile_id)
    if profile is None or profile.user_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Profile not found")
    return profile


@router.get("", response_model=list[ProfileOut])
def list_profiles(
    db: Session = Depends(get_db), user: User = Depends(get_current_user)
) -> list[BirthProfile]:
    return list(
        db.scalars(select(BirthProfile).where(BirthProfile.user_id == user.id)).all()
    )


@router.post("", response_model=ProfileOut, status_code=status.HTTP_201_CREATED)
def create_profile(
    payload: ProfileCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> BirthProfile:
    count = db.scalar(
        select(func.count())
        .select_from(BirthProfile)
        .where(BirthProfile.user_id == user.id)
    )
    if count is not None and count >= MAX_PROFILES_PER_USER:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"You can save up to {MAX_PROFILES_PER_USER} profiles.",
        )
    duplicate = db.scalar(
        select(BirthProfile).where(
            BirthProfile.user_id == user.id,
            BirthProfile.birth_datetime_local == payload.birth_datetime_local,
            BirthProfile.latitude == payload.latitude,
            BirthProfile.longitude == payload.longitude,
        )
    )
    if duplicate is not None:
        raise HTTPException(
            status.HTTP_409_CONFLICT, "This profile is already saved."
        )
    profile = BirthProfile(user_id=user.id, **payload.model_dump())
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.get("/{profile_id}", response_model=ProfileOut)
def get_profile(
    profile_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> BirthProfile:
    return _get_owned_profile(db, profile_id, user)


@router.put("/{profile_id}", response_model=ProfileOut)
def update_profile(
    profile_id: uuid.UUID,
    payload: ProfileUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> BirthProfile:
    profile = _get_owned_profile(db, profile_id, user)
    for field, value in payload.model_dump().items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile


@router.delete("/{profile_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_profile(
    profile_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    profile = _get_owned_profile(db, profile_id, user)
    db.delete(profile)
    db.commit()
