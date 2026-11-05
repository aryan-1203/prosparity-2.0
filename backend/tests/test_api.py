import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app import mail
from app.config import Settings, get_settings
from app.db import get_session
from app.main import app, csv_safe
from app.models import Base, Lead, LeadType
from app.security import limiter

PHONE = "9876543210"
VALID = {
    "dealer": {"businessName": "Shree EV", "city": "Bhopal", "state": "mp", "brands": "Mahindra", "monthlyEvSales": "12", "name": "A", "phone": PHONE},
    "battery": {"company": "Cell Co", "name": "A", "phone": PHONE, "email": "a@example.com"},
    "lender": {"institution": "Bank", "institutionType": "bank", "name": "A", "phone": PHONE, "email": "a@example.com"},
    "investor": {"name": "A", "firm": "Fund", "email": "a@example.com"},
    "callback": {"name": "A", "phone": PHONE, "city": "Indore", "vehicleType": "e3w", "preferredLanguage": "hi"},
    "contact": {"name": "A", "email": "a@example.com", "topic": "other", "message": "Hello"},
    "newsletter": {"email": "a@example.com"},
}


def body(kind="callback", **extra):
    return {"type": kind, "locale": "en", "source_page": "/lending", "consent": True, "payload": VALID[kind], **extra}


@pytest.fixture
def settings():
    return Settings(_env_file=None, database_url="sqlite://", export_api_key="secret", ip_hash_salt="salt", rate_limit_per_minute=100)


@pytest.fixture
def session():
    engine = create_engine("sqlite://", poolclass=StaticPool, connect_args={"check_same_thread": False})
    Base.metadata.create_all(engine)
    with Session(engine, expire_on_commit=False) as s:
        yield s


@pytest.fixture
def client(session, settings):
    limiter.reset()
    app.dependency_overrides[get_session] = lambda: session
    app.dependency_overrides[get_settings] = lambda: settings
    yield TestClient(app)
    app.dependency_overrides.clear()


def leads(session):
    return session.scalars(select(Lead)).all()


def test_health(client):
    assert client.get("/health").json() == {"status": "ok"}


@pytest.mark.parametrize("kind", VALID)
def test_every_form_is_stored(client, session, kind):
    assert client.post("/leads", json=body(kind, utm_source="mail")).status_code == 201
    row = leads(session)[0]
    assert row.type == LeadType(kind) and row.utm_source == "mail" and row.consent_at


def test_raw_ip_is_never_stored(client, session):
    client.post("/leads", json=body())
    row = leads(session)[0]
    assert len(row.ip_hash) == 64 and "testclient" not in row.ip_hash


@pytest.mark.parametrize("phone", ["12345", "5876543210", "98765432101"])
def test_bad_phone_is_rejected(client, session, phone):
    data = body()
    data["payload"] = {**VALID["callback"], "phone": phone}
    assert client.post("/leads", json=data).status_code == 422
    assert leads(session) == []


@pytest.mark.parametrize("phone", ["+91 98765 43210", "098765-43210", "9876543210"])
def test_indian_phone_formats_are_accepted(client, phone):
    data = body()
    data["payload"] = {**VALID["callback"], "phone": phone}
    assert client.post("/leads", json=data).status_code == 201


def test_missing_required_field(client):
    data = body()
    data["payload"] = {k: v for k, v in VALID["callback"].items() if k != "city"}
    assert client.post("/leads", json=data).status_code == 422


def test_unknown_field_is_rejected(client):
    data = body()
    data["payload"] = {**VALID["callback"], "extra": "x"}
    assert client.post("/leads", json=data).status_code == 422


def test_consent_is_required(client):
    assert client.post("/leads", json=body(consent=False)).status_code == 422


def test_honeypot_looks_accepted_but_stores_nothing(client, session):
    assert client.post("/leads", json=body(website="http://spam")).status_code == 201
    assert leads(session) == []


def test_rate_limit(client, settings):
    settings.rate_limit_per_minute = 2
    codes = [client.post("/leads", json=body()).status_code for _ in range(3)]
    assert codes == [201, 201, 429]


def test_turnstile_required_when_configured(client, settings, session):
    settings.turnstile_secret = "x"
    assert client.post("/leads", json=body()).status_code == 400
    assert leads(session) == []


def test_email_failure_keeps_the_lead(client, session, settings, monkeypatch):
    settings.email_provider, settings.leads_notify_email = "smtp", "team@example.com"

    def boom(*_):
        raise OSError("mail down")

    monkeypatch.setattr(mail, "send", boom)
    assert client.post("/leads", json=body()).status_code == 201
    row = leads(session)[0]
    assert row.notified_at is None


def test_export_needs_the_key(client):
    assert client.get("/leads/export").status_code == 401
    assert client.get("/leads/export", headers={"x-api-key": "wrong"}).status_code == 401


def test_export_returns_csv(client):
    client.post("/leads", json=body("contact"))
    response = client.get("/leads/export", headers={"x-api-key": "secret"})
    assert response.status_code == 200 and "text/csv" in response.headers["content-type"]
    assert "contact" in response.text and "a@example.com" in response.text and "ip_hash" not in response.text


def test_csv_formula_is_neutralised():
    assert csv_safe("=HYPERLINK(1)") == "'=HYPERLINK(1)" and csv_safe("plain") == "plain"
