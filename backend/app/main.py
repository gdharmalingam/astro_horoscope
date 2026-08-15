"""FastAPI application entrypoint: middleware, rate limiting and router wiring."""
from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address

from app.api.routers import api_keys, auth, geo, horoscopes, profiles, public
from app.astro.ephemeris import init_ephemeris
from app.core.config import settings


def _rate_limit_key(request: Request) -> str:
    """Rate limit public API by API key, everything else by client IP."""
    return request.headers.get("X-API-Key") or get_remote_address(request)


limiter = Limiter(key_func=_rate_limit_key, default_limits=["120/minute"])


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_ephemeris()
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["health"])
def health() -> dict:
    return {"status": "ok", "service": settings.app_name, "environment": settings.environment}


_prefix = settings.api_v1_prefix
app.include_router(auth.router, prefix=_prefix)
app.include_router(profiles.router, prefix=_prefix)
app.include_router(horoscopes.router, prefix=_prefix)
app.include_router(api_keys.router, prefix=_prefix)
app.include_router(public.router, prefix=_prefix)
app.include_router(geo.router, prefix=_prefix)
