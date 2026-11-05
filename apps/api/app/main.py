import csv
import io
import secrets
from typing import Annotated

from fastapi import BackgroundTasks, Depends, FastAPI, Header, HTTPException, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError
from sqlalchemy import select, text
from sqlalchemy.orm import Session

from .config import Settings, get_settings
from .db import get_session
from .mail import notify
from .models import Lead, now
from .schemas import PAYLOADS, LeadAccepted, LeadIn
from .security import client_ip, hash_ip, limiter, verify_turnstile

app = FastAPI(title="ProsParity API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[get_settings().site_origin],
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type"],
)

SessionDep = Annotated[Session, Depends(get_session)]
SettingsDep = Annotated[Settings, Depends(get_settings)]


@app.get("/health")
def health(session: SessionDep) -> dict[str, str]:
    session.execute(text("select 1"))
    return {"status": "ok"}


@app.post("/leads", status_code=status.HTTP_201_CREATED)
def create_lead(lead: LeadIn, request: Request, tasks: BackgroundTasks, session: SessionDep, settings: SettingsDep) -> LeadAccepted:
    # A filled honeypot gets the normal response, so a bot learns nothing.
    if lead.website:
        return LeadAccepted()

    ip = client_ip(request, settings)
    ip_hash = hash_ip(ip, settings.ip_hash_salt)
    if not limiter.allow(ip_hash, settings.rate_limit_per_minute):
        raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, "Too many requests")
    if not verify_turnstile(lead.turnstile_token, ip, settings.turnstile_secret):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Verification failed")

    try:
        payload = PAYLOADS[lead.type].model_validate(lead.payload).model_dump(mode="json")
    except ValidationError as error:
        fields = [{"field": str(e["loc"][0]) if e["loc"] else "", "type": e["type"]} for e in error.errors()]
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, fields) from error

    row = Lead(
        type=lead.type,
        payload=payload,
        locale=lead.locale,
        source_page=lead.source_page,
        utm_source=lead.utm_source,
        utm_medium=lead.utm_medium,
        utm_campaign=lead.utm_campaign,
        utm_term=lead.utm_term,
        utm_content=lead.utm_content,
        consent_at=now(),
        ip_hash=ip_hash,
    )
    session.add(row)
    session.commit()
    tasks.add_task(notify, settings, row.id, row.type, payload, row.source_page)
    return LeadAccepted()


def csv_safe(value: object) -> str:
    """Stops a submitted value from running as a formula when the export is opened in a spreadsheet."""
    cell = "" if value is None else str(value)
    return f"'{cell}" if cell[:1] in ("=", "+", "-", "@", "\t", "\r") else cell


@app.get("/leads/export", response_class=Response)
def export_leads(session: SessionDep, settings: SettingsDep, x_api_key: Annotated[str, Header()] = "") -> Response:
    if not settings.export_api_key or not secrets.compare_digest(x_api_key, settings.export_api_key):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid API key")

    rows = session.scalars(select(Lead).order_by(Lead.created_at)).all()
    payload_keys = sorted({key for row in rows for key in row.payload})
    columns = ["id", "type", "created_at", "locale", "source_page", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "consent_at", "notified_at"]
    out = io.StringIO()
    writer = csv.writer(out)
    writer.writerow([*columns, *payload_keys])
    for row in rows:
        fixed = [getattr(row, column) for column in columns]
        fixed[1] = row.type.value
        writer.writerow([csv_safe(v) for v in fixed] + [csv_safe(row.payload.get(key)) for key in payload_keys])
    return Response(out.getvalue(), media_type="text/csv", headers={"Content-Disposition": 'attachment; filename="leads.csv"'})
