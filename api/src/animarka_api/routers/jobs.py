"""Job status, polled by the web every second or so. Live progress comes from Redis."""

from typing import Annotated

import redis.asyncio as aioredis
from animarka_core.db import get_session
from animarka_core.models import Job
from animarka_core.settings import get_settings
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from animarka_api.schemas import JobOut

router = APIRouter(prefix="/api/v1")


async def live_progress(job_id: str) -> dict[str, str]:
    try:
        r = aioredis.from_url(get_settings().redis_url, decode_responses=True)
        got = await r.hgetall(f"job:{job_id}")
        raw = {str(k): str(v) for k, v in got.items()}
        await r.aclose()
    except Exception:
        return {}
    return raw


@router.get("/jobs/{job_id}", response_model=JobOut)
async def get_job(job_id: str, session: Annotated[AsyncSession, Depends(get_session)]) -> JobOut:
    job = await session.get(Job, job_id)
    if job is None:
        raise HTTPException(404, "No such job")
    progress = job.progress
    if job.status in ("queued", "running"):
        live = await live_progress(job_id)
        total = int(live.get("total") or 0)
        if total:
            progress = (int(live.get("done") or 0) + int(live.get("failed") or 0)) / total
    return JobOut(
        id=job.id,
        type=job.type,
        status=job.status,
        progress=progress,
        result=job.result,
        error=job.error,
    )
