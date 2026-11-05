from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://prosparity:prosparity@localhost:5432/prosparity"
    site_origin: str = "http://localhost:3000"
    ip_hash_salt: str = "change-me"
    export_api_key: str = ""
    leads_notify_email: str = ""
    email_from: str = ""
    email_provider: Literal["resend", "smtp", "none"] = "none"
    resend_api_key: str = ""
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    turnstile_secret: str = ""
    rate_limit_per_minute: int = 5
    trust_proxy: bool = False


@lru_cache
def get_settings() -> Settings:
    return Settings()
