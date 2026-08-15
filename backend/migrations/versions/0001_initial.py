"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-08-07
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

from app.db.types import GUID, JSONType

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", GUID(), primary_key=True),
        sa.Column("firebase_uid", sa.String(length=128), nullable=True),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("display_name", sa.String(length=255), nullable=True),
        sa.Column("photo_url", sa.String(length=1024), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_firebase_uid", "users", ["firebase_uid"], unique=True)

    op.create_table(
        "birth_profiles",
        sa.Column("id", GUID(), primary_key=True),
        sa.Column("user_id", GUID(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("birth_datetime_local", sa.String(length=32), nullable=False),
        sa.Column("timezone", sa.String(length=64), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("place_name", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_birth_profiles_user_id", "birth_profiles", ["user_id"])

    op.create_table(
        "horoscopes",
        sa.Column("id", GUID(), primary_key=True),
        sa.Column("profile_id", GUID(), nullable=False),
        sa.Column("ayanamsa", sa.String(length=32), nullable=False, server_default="lahiri"),
        sa.Column("house_system", sa.String(length=32), nullable=False, server_default="whole_sign"),
        sa.Column("chart", JSONType, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["profile_id"], ["birth_profiles.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_horoscopes_profile_id", "horoscopes", ["profile_id"])

    op.create_table(
        "api_keys",
        sa.Column("id", GUID(), primary_key=True),
        sa.Column("user_id", GUID(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("prefix", sa.String(length=16), nullable=False),
        sa.Column("hashed_key", sa.String(length=128), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_used_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_api_keys_user_id", "api_keys", ["user_id"])
    op.create_index("ix_api_keys_prefix", "api_keys", ["prefix"], unique=True)

    op.create_table(
        "api_usage",
        sa.Column("id", GUID(), primary_key=True),
        sa.Column("api_key_id", GUID(), nullable=False),
        sa.Column("endpoint", sa.String(length=128), nullable=False),
        sa.Column("status_code", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["api_key_id"], ["api_keys.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_api_usage_api_key_id", "api_usage", ["api_key_id"])
    op.create_index("ix_api_usage_created_at", "api_usage", ["created_at"])


def downgrade() -> None:
    op.drop_table("api_usage")
    op.drop_table("api_keys")
    op.drop_table("horoscopes")
    op.drop_table("birth_profiles")
    op.drop_table("users")
