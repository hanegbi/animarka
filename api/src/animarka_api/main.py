import asyncio
import logging
import sys
import time
from collections.abc import Awaitable, Callable

import redis.asyncio as aioredis
from animarka_core.db import async_engine
from animarka_core.settings import get_settings
from fastapi import FastAPI, Request, Response
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from animarka_api.routers import catalog, files, jobs, posters, renders, reports

if sys.platform == "win32":
    # psycopg's async mode cannot use Windows' default event loop. Only matters for local runs.
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())  # type: ignore[attr-defined,unused-ignore]

app = FastAPI(title="animarka api", version="0.1.0")
app.add_middleware(GZipMiddleware, minimum_size=1024)
log = logging.getLogger("animarka.api")
QUIET = {"/healthz", "/readyz"}


@app.middleware("http")
async def access_log(
    request: Request, call_next: Callable[[Request], Awaitable[Response]]
) -> Response:
    """One structured line per request: method, path, status and time. Health probes stay quiet."""
    start = time.perf_counter()
    status = 500
    try:
        response = await call_next(request)
        status = response.status_code
        return response
    finally:
        if request.url.path not in QUIET:
            log.info(
                "request",
                extra={
                    "method": request.method,
                    "path": request.url.path,
                    "status": status,
                    "ms": round((time.perf_counter() - start) * 1000, 1),
                },
            )


app.include_router(catalog.router)
app.include_router(files.router)
app.include_router(reports.router)
app.include_router(posters.router)
app.include_router(jobs.router)
app.include_router(renders.router)


@app.get("/healthz")
async def healthz() -> dict[str, str]:
    """Liveness: the process answers."""
    return {"status": "ok"}


@app.get("/readyz")
async def readyz() -> JSONResponse:
    """Readiness: Postgres and Redis both answer. Compose uses this as the health check."""
    checks: dict[str, str] = {}
    try:
        async with async_engine().connect() as conn:
            await conn.execute(text("SELECT 1"))
        checks["db"] = "ok"
    except Exception as exc:  # noqa: BLE001 - any failure means not ready
        checks["db"] = exc.__class__.__name__
    try:
        r = aioredis.from_url(get_settings().redis_url, socket_timeout=2)
        await r.ping()
        await r.aclose()
        checks["redis"] = "ok"
    except Exception as exc:  # noqa: BLE001
        checks["redis"] = exc.__class__.__name__
    ok = all(v == "ok" for v in checks.values())
    return JSONResponse(
        {"status": "ok" if ok else "unavailable", **checks}, status_code=200 if ok else 503
    )
