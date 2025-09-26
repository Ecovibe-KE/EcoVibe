"""update tokens table

Revision ID: a72acb425c5e
Revises: cea4d948af0d
Create Date: 2025-09-26 10:30:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


def upgrade():
    # Backfill NULL expiry_time values before enforcing NOT NULL
    op.execute(
        """
        UPDATE tokens
        SET expiry_time = COALESCE(expiry_time, created_at, NOW())
        WHERE expiry_time IS NULL
        """
    )

    # Backfill NULL value fields (if any) — since you now enforce NOT NULL
    op.execute(
        """
        UPDATE tokens
        SET value = gen_random_uuid()::text
        WHERE value IS NULL
        """
    )

    # Alter expiry_time column to timezone-aware
    op.alter_column(
        "tokens",
        "expiry_time",
        existing_type=postgresql.TIMESTAMP(),
        type_=sa.DateTime(timezone=True),
        postgresql_using="expiry_time AT TIME ZONE 'UTC'",
        nullable=False,
    )

    # Alter value to be NOT NULL
    op.alter_column("tokens", "value", nullable=False)

    # Add index (Alembic probably generated this already)
    op.create_index("ix_tokens_value", "tokens", ["value"])

    # If you want unique constraint too
    op.create_unique_constraint("uq_tokens_value", "tokens", ["value"])


def downgrade():
    op.drop_index("ix_tokens_value", table_name="tokens")
    op.drop_constraint("uq_tokens_value", "tokens", type_="unique")

    op.alter_column(
        "tokens",
        "value",
        existing_type=sa.String(),
        nullable=True,
    )

    op.alter_column(
        "tokens",
        "expiry_time",
        existing_type=sa.DateTime(timezone=True),
        type_=postgresql.TIMESTAMP(),
        nullable=True,
    )
