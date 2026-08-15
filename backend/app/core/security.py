"""Security helpers: Supabase JWT verification and API key generation/hashing."""
from __future__ import annotations

import hashlib
import secrets
from functools import lru_cache
from typing import Any

import httpx
from jose import JWTError, jwt

from app.core.config import settings

_API_KEY_PREFIX = "hk"


@lru_cache
def _supabase_jwks() -> dict[str, Any]:
    if not settings.supabase_url:
        raise RuntimeError("SUPABASE_URL must be configured to verify user tokens")
    response = httpx.get(
        f"{settings.supabase_url.rstrip('/')}/auth/v1/.well-known/jwks.json", timeout=10.0
    )
    response.raise_for_status()
    return response.json()


def decode_access_token(token: str) -> dict[str, Any] | None:
    """Return verified Supabase claims, or ``None`` when the token is invalid."""
    try:
        header = jwt.get_unverified_header(token)
        key_id = header.get("kid")
        signing_key = next(
            (key for key in _supabase_jwks().get("keys", []) if key.get("kid") == key_id), None
        )
        if signing_key is None:
            _supabase_jwks.cache_clear()
            signing_key = next(
                (key for key in _supabase_jwks().get("keys", []) if key.get("kid") == key_id), None
            )
        if signing_key is None:
            return None
        issuer = f"{settings.supabase_url.rstrip('/')}/auth/v1"
        return jwt.decode(
            token,
            signing_key,
            algorithms=["RS256", "ES256"],
            audience=settings.supabase_jwt_audience,
            issuer=issuer,
        )
    except (httpx.HTTPError, JWTError, RuntimeError):
        return None


def generate_api_key() -> tuple[str, str, str]:
    """Return (full_key, prefix, hashed_key). The full key is shown only once."""
    secret = secrets.token_urlsafe(32)
    short = secrets.token_hex(3)
    prefix = f"{_API_KEY_PREFIX}_{short}"
    full_key = f"{prefix}.{secret}"
    hashed = hash_api_key(full_key)
    return full_key, prefix, hashed


def hash_api_key(full_key: str) -> str:
    return hashlib.sha256(full_key.encode("utf-8")).hexdigest()
