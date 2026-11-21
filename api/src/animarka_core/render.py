"""Shared render rules for the API and the worker: sizes, cache keys and signed links."""

import hashlib
import hmac
import json
from typing import Any

from animarka_core.settings import get_settings

PREVIEW_LONG_EDGE = 1600
DPI = 300
# Print sizes at launch, in inches (width, height) for portrait.
PRINT_SIZES: dict[str, tuple[float, float]] = {
    "18x24": (18, 24),
    "12x16": (12, 16),
    "a2": (16.54, 23.39),
    "a3": (11.69, 16.54),
}
ASPECT = {"3:4": 3 / 4, "2:3": 2 / 3, "4:5": 4 / 5}


def secret() -> str:
    return get_settings().render_secret or "dev-only-render-secret"


def sign(poster_id: str, width: int, kind: str) -> str:
    msg = f"{poster_id}.{width}.{kind}".encode()
    return hmac.new(secret().encode(), msg, hashlib.sha256).hexdigest()


def preview_width(size: str) -> int:
    """Preview: the long edge is 1600 px, portrait, so the width follows the poster shape."""
    return round(PREVIEW_LONG_EDGE * ASPECT.get(size, 0.75))


def cache_key(kind: str, state: dict[str, Any], width: int) -> str:
    raw = json.dumps(
        {"kind": kind, "state": state, "w": width}, sort_keys=True, separators=(",", ":")
    )
    return hashlib.sha256(raw.encode()).hexdigest()
