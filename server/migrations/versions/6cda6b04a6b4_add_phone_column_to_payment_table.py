"""Add phone column to payment table

Revision ID: 6cda6b04a6b4
Revises: bc4d5c7c607e
Create Date: 2025-09-30 13:02:20.929643

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '6cda6b04a6b4'
down_revision = 'bc4d5c7c607e'
branch_labels = None
depends_on = None


def upgrade():
    # Add column with a temporary default so existing rows pass NOT NULL check
    op.add_column(
        'mpesa_transactions',
        sa.Column('phone_number', sa.String(length=15), nullable=False, server_default='')
    )

    # Remove the server default so new rows must explicitly set phone_number
    op.alter_column(
        'mpesa_transactions',
        'phone_number',
        server_default=None
    )


def downgrade():
    op.drop_column('mpesa_transactions', 'phone_number')
