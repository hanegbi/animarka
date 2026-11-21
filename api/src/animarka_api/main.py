import asyncio
import sys

from fastapi import FastAPI
from fastapi.middleware.gzip import GZipMiddleware

from animarka_api.routers import catalog, files, reports

if sys.platform == "win32":
    # psycopg's async mode cannot use Windows' default event loop. Only matters for local runs.
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())  # type: ignore[attr-defined,unused-ignore]

app = FastAPI(title="animarka api", version="0.1.0")
app.add_middleware(GZipMiddleware, minimum_size=1024)
app.include_router(catalog.router)
app.include_router(files.router)
app.include_router(reports.router)


@app.get("/healthz")
async def healthz() -> dict[str, str]:
    return {"status": "ok"}
