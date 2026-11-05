"""Create leads"""
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB

revision = "0001"
down_revision = None

lead_type = sa.Enum("dealer", "battery", "lender", "investor", "callback", "contact", name="lead_type")


def upgrade() -> None:
    op.create_table(
        "leads",
        sa.Column("id", sa.Uuid, primary_key=True),
        sa.Column("type", lead_type, nullable=False),
        sa.Column("payload", sa.JSON().with_variant(JSONB, "postgresql"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("locale", sa.String(5), nullable=False),
        sa.Column("source_page", sa.String(300), nullable=False),
        sa.Column("utm_source", sa.String(200)),
        sa.Column("utm_medium", sa.String(200)),
        sa.Column("utm_campaign", sa.String(200)),
        sa.Column("utm_term", sa.String(200)),
        sa.Column("utm_content", sa.String(200)),
        sa.Column("consent_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("ip_hash", sa.String(64), nullable=False),
        sa.Column("notified_at", sa.DateTime(timezone=True)),
    )
    op.create_index("ix_leads_type", "leads", ["type"])
    op.create_index("ix_leads_created_at", "leads", ["created_at"])


def downgrade() -> None:
    op.drop_table("leads")
    lead_type.drop(op.get_bind(), checkfirst=True)
