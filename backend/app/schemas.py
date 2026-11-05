"""Mirrored by frontend/src/lib/forms.ts. Change both together."""
import re
from typing import Annotated, Literal

from pydantic import AfterValidator, BaseModel, ConfigDict, EmailStr, Field, StringConstraints

from .models import LeadType

PHONE = re.compile(r"^(?:\+?91|0)?[6-9]\d{9}$")


def indian_phone(value: str) -> str:
    cleaned = re.sub(r"[\s-]", "", value)
    if not PHONE.match(cleaned):
        raise ValueError("Enter a 10-digit Indian mobile number")
    return cleaned


Text = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=200)]
Message = Annotated[str, StringConstraints(strip_whitespace=True, max_length=2000)]
Phone = Annotated[str, AfterValidator(indian_phone)]


def blank_to_none(value: object) -> object:
    return None if value == "" else value


class Payload(BaseModel):
    model_config = ConfigDict(extra="forbid")


class DealerLead(Payload):
    businessName: Text
    city: Text
    state: Literal["up", "mp", "cg", "other"]
    brands: Text
    monthlyEvSales: Annotated[str, StringConstraints(pattern=r"^\d{1,6}$")]
    name: Text
    phone: Phone
    email: EmailStr | Literal[""] = ""


class BatteryLead(Payload):
    company: Text
    name: Text
    phone: Phone
    email: EmailStr
    message: Message = ""


class LenderLead(Payload):
    institution: Text
    institutionType: Literal["bank", "nbfc", "fund", "other"]
    name: Text
    phone: Phone
    email: EmailStr
    message: Message = ""


class InvestorLead(Payload):
    name: Text
    firm: Text
    email: EmailStr
    phone: Phone | Literal[""] = ""
    message: Message = ""


class CallbackLead(Payload):
    name: Text
    phone: Phone
    city: Text
    vehicleType: Literal["e3w", "cargo", "e2w", "battery", "notSure"]
    preferredLanguage: Literal["hi", "en"]


class ContactLead(Payload):
    name: Text
    email: EmailStr
    phone: Phone | Literal[""] = ""
    topic: Literal["loanStatus", "payEmi", "updateDetails", "grievance", "dealer", "other"]
    message: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=2000)]


class NewsletterLead(Payload):
    email: EmailStr


PAYLOADS: dict[LeadType, type[Payload]] = {
    LeadType.dealer: DealerLead,
    LeadType.battery: BatteryLead,
    LeadType.lender: LenderLead,
    LeadType.investor: InvestorLead,
    LeadType.callback: CallbackLead,
    LeadType.contact: ContactLead,
    LeadType.newsletter: NewsletterLead,
}


class LeadIn(BaseModel):
    type: LeadType
    locale: Literal["en", "hi"]
    source_page: Annotated[str, StringConstraints(max_length=300)]
    consent: Literal[True]
    payload: dict[str, str]
    website: str = Field(default="", description="Honeypot. Must stay empty.")
    turnstile_token: str | None = None
    utm_source: str | None = Field(default=None, max_length=200)
    utm_medium: str | None = Field(default=None, max_length=200)
    utm_campaign: str | None = Field(default=None, max_length=200)
    utm_term: str | None = Field(default=None, max_length=200)
    utm_content: str | None = Field(default=None, max_length=200)


class LeadAccepted(BaseModel):
    status: Literal["received"] = "received"
