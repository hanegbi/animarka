"""JSON responses with a strong ETag. A matching If-None-Match gets an empty 304."""

import hashlib
import json
from collections.abc import Sequence
from typing import Any

from fastapi import Request, Response
from pydantic import BaseModel

# Clients may use a copy for 5 minutes, then revalidate. A stale copy is fine for a day if offline.
CACHE = "public, max-age=300, stale-while-revalidate=86400"


def etag_json(
    request: Request, body: BaseModel | Sequence[BaseModel], cache: str = CACHE
) -> Response:
    data: Any = (
        [b.model_dump(by_alias=True) for b in body]
        if not isinstance(body, BaseModel)
        else body.model_dump(by_alias=True)
    )
    raw = json.dumps(data, ensure_ascii=False, separators=(",", ":"), sort_keys=True).encode()
    tag = '"' + hashlib.sha256(raw).hexdigest()[:32] + '"'
    headers = {"ETag": tag, "Cache-Control": cache, "Vary": "Accept-Encoding"}
    match = request.headers.get("if-none-match", "")
    if tag in [t.strip().removeprefix("W/") for t in match.split(",")]:
        return Response(status_code=304, headers=headers)
    return Response(raw, media_type="application/json", headers=headers)
