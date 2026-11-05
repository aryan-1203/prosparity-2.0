import logging
import smtplib
import uuid
from email.message import EmailMessage

import httpx
from sqlalchemy import update
from sqlalchemy.orm import sessionmaker

from .config import Settings
from .db import get_engine
from .models import Lead, LeadType, now

log = logging.getLogger(__name__)


def body_for(lead_type: LeadType, payload: dict[str, str], source_page: str) -> tuple[str, str]:
    lines = [f"{key}: {value}" for key, value in payload.items() if value]
    return f"New {lead_type.value} lead", "\n".join([*lines, f"page: {source_page}"])


def send(settings: Settings, subject: str, text: str) -> None:
    if settings.email_provider == "resend":
        httpx.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {settings.resend_api_key}"},
            json={"from": settings.email_from, "to": [settings.leads_notify_email], "subject": subject, "text": text},
            timeout=10,
        ).raise_for_status()
    elif settings.email_provider == "smtp":
        message = EmailMessage()
        message["From"], message["To"], message["Subject"] = settings.email_from, settings.leads_notify_email, subject
        message.set_content(text)
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as client:
            if settings.smtp_user:
                client.starttls()
                client.login(settings.smtp_user, settings.smtp_password)
            client.send_message(message)


def notify(settings: Settings, lead_id: uuid.UUID, lead_type: LeadType, payload: dict[str, str], source_page: str) -> None:
    """Runs after the lead is committed. A failure leaves notified_at empty, so it can be found and resent."""
    if settings.email_provider == "none" or not settings.leads_notify_email:
        return
    try:
        send(settings, *body_for(lead_type, payload, source_page))
    except Exception:
        log.exception("Lead notification failed for %s", lead_id)
        return
    with sessionmaker(bind=get_engine())() as session:
        session.execute(update(Lead).where(Lead.id == lead_id).values(notified_at=now()))
        session.commit()
