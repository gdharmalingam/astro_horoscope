"""FastAPI dependencies for Supabase-authenticated users and API-key clients."""
from __future__ import annotations

from datetime import datetime, timezone

from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import decode_access_token, hash_api_key
from app.core.config import settings
from app.db.session import get_db
from app.models.api_key import ApiKey
from app.models.user import User

_bearer = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")
    payload = decode_access_token(credentials.credentials)
    if payload is None or "sub" not in payload or not payload.get("email"):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token")
    user = db.scalar(select(User).where(User.supabase_user_id == payload["sub"]))
    if user is None:
        email = str(payload["email"])
        user = db.scalar(select(User).where(User.email == email))
        if user is None:
            user = User(email=email, supabase_user_id=payload["sub"])
            db.add(user)
        else:
            user.supabase_user_id = payload["sub"]
        user.display_name = payload.get("user_metadata", {}).get("full_name") or user.display_name
        user.photo_url = payload.get("user_metadata", {}).get("avatar_url") or user.photo_url
        if email.lower() in settings.admin_email_set:
            user.is_admin = True
        db.commit()
        db.refresh(user)
    if not user.is_active:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found")
    return user


def get_api_key_client(
    x_api_key: str | None = Header(default=None, alias="X-API-Key"),
    db: Session = Depends(get_db),
) -> ApiKey:
    if not x_api_key:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Missing X-API-Key header")
    hashed = hash_api_key(x_api_key)
    api_key = db.scalar(select(ApiKey).where(ApiKey.hashed_key == hashed))
    if api_key is None or api_key.revoked_at is not None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or revoked API key")
    api_key.last_used_at = datetime.now(timezone.utc)
    db.commit()
    return api_key
