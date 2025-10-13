"""changed the values of admin id

Revision ID: 83a05d63a677
Revises: dd2a386eeb0c
Create Date: 2025-10-13 11:10:20.004702
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "83a05d63a677"
down_revision = "dd2a386eeb0c"
branch_labels = None
depends_on = None


def upgrade():
    # Allow admin_id to be temporarily nullable
    op.alter_column("tickets", "admin_id", existing_type=sa.INTEGER(), nullable=True)

    # Create the new enum type if it doesn't exist
    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_enum') THEN
                CREATE TYPE role_enum AS ENUM ('CLIENT', 'ADMIN', 'SUPER_ADMIN');
            END IF;
        END $$;
        """
    )

    # Alter users.role to use the new enum type
    op.execute(
        """
        ALTER TABLE users 
        ALTER COLUMN role 
        TYPE role_enum 
        USING role::text::role_enum;
        """
    )


def downgrade():
    # Assign NULL admin_id tickets to a default admin before making column non-nullable
    op.execute(
        """
        DO $$
        DECLARE
            admin_user_id INTEGER;
        BEGIN
            SELECT id INTO admin_user_id FROM users WHERE role = 'ADMIN' LIMIT 1;
            IF admin_user_id IS NULL THEN
                RAISE EXCEPTION 'Downgrade failed: No ADMIN users exist to assign tickets.';
            END IF;
            UPDATE tickets
            SET admin_id = admin_user_id
            WHERE admin_id IS NULL;
        END $$;
        """
    )

    op.alter_column(
        "users",
        "role",
        existing_type=sa.Enum("CLIENT", "ADMIN", "SUPER_ADMIN", name="role_enum"),
        type_=postgresql.ENUM("CLIENT", "ADMIN", "SUPER_ADMIN", name="role_enum_old"),
        existing_nullable=False,
    )

    op.alter_column("tickets", "admin_id", existing_type=sa.INTEGER(), nullable=False)
