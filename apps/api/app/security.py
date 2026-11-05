import hashlib
import time
from collections import defaultdict, deque

import httpx
from fastapi import Request

from .config import Settings


def client_ip(request: Request, settings: Settings) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if settings.trust_proxy and forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def hash_ip(ip: str, salt: str) -> str:
    return hashlib.sha256(f"{salt}:{ip}".encode()).hexdigest()


class RateLimiter:
    """Per-process sliding window. Move to Redis if the API ever runs more than one instance."""

    def __init__(self) -> None:
        self._hits: dict[str, deque[float]] = defaultdict(deque)

    def allow(self, key: str, limit: int, window: float = 60.0) -> bool:
        now = time.monotonic()
        hits = self._hits[key]
        while hits and now - hits[0] > window:
            hits.popleft()
        if len(hits) >= limit:
            return False
        hits.append(now)
        return True

    def reset(self) -> None:
        self._hits.clear()


limiter = RateLimiter()


def verify_turnstile(token: str | None, ip: str, secret: str) -> bool:
    if not secret:
        return True
    if not token:
        return False
    try:
        response = httpx.post(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            data={"secret": secret, "response": token, "remoteip": ip},
            timeout=5,
        )
        return bool(response.json().get("success"))
    except (httpx.HTTPError, ValueError):
        return False
