"""Import all models so Alembic and metadata see them."""
from app.db.session import Base  # noqa: F401
from app.models.user import User  # noqa: F401
from app.models.birth_profile import BirthProfile  # noqa: F401
from app.models.horoscope import Horoscope  # noqa: F401
from app.models.api_key import ApiKey, ApiUsage  # noqa: F401
