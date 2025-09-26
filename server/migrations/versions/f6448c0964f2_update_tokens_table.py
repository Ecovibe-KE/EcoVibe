"""Update tokens table

Revision ID: f6448c0964f2
Revises: cea4d948af0d
Create Date: 2025-09-26 14:08:55.370260

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "f6448c0964f2"
down_revision = "cea4d948af0d"
branch_labels = None
depends_on = None


def upgrade():
    # 0) Ensure pgcrypto is available
    op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto;")

    # 1) Backfill NULL expiry_time
    op.execute(
        """
        UPDATE tokens
        SET expiry_time = COALESCE(expiry_time, NOW())
        WHERE expiry_time IS NULL
        """
    )

    # 2) Backfill NULL values
    op.execute(
        """
        UPDATE tokens
        SET value = gen_random_uuid()::text
        WHERE value IS NULL
        """
    )

    # 3) Deduplicate values before unique constraint
    op.execute(
        """
        WITH d AS (
          SELECT id
          FROM (
            SELECT id, value,
                   ROW_NUMBER() OVER (PARTITION BY value ORDER BY id) AS rn
            FROM tokens
            WHERE value IS NOT NULL
          ) t
          WHERE rn > 1
        )
        UPDATE tokens
        SET value = gen_random_uuid()::text
        WHERE id IN (SELECT id FROM d)
        """
    )

    # 4) Convert expiry_time to tz-aware, enforce NOT NULL
    op.alter_column(
        "tokens",
        "expiry_time",
        existing_type=postgresql.TIMESTAMP(),
        type_=sa.DateTime(timezone=True),
        postgresql_using="expiry_time AT TIME ZONE 'UTC'",
        nullable=False,
    )

    # 5) Enforce NOT NULL on value
    op.alter_column("tokens", "value", existing_type=sa.String(), nullable=False)

    # 6) Add UNIQUE constraint on value
    op.create_unique_constraint("uq_tokens_value", "tokens", ["value"])


def downgrade():
    # Reverse unique
    op.drop_constraint("uq_tokens_value", "tokens", type_="unique")

    # Revert value to nullable
    op.alter_column("tokens", "value", existing_type=sa.String(), nullable=True)

    # Revert expiry_time to naive TIMESTAMP and nullable
    op.alter_column(
        "tokens",
        "expiry_time",
        existing_type=sa.DateTime(timezone=True),
        type_=postgresql.TIMESTAMP(),
        nullable=True,
    )
