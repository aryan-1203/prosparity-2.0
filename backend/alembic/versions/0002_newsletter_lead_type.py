"""Add newsletter lead type"""
from alembic import op

revision = "0002"
down_revision = "0001"


def upgrade() -> None:
    if op.get_bind().dialect.name == "postgresql":
        op.execute("ALTER TYPE lead_type ADD VALUE IF NOT EXISTS 'newsletter'")


def downgrade() -> None:
    # Postgres cannot drop an enum value, and the extra value is harmless.
    pass
