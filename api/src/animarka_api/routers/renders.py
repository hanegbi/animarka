"""Start a render. The same poster and options return the same job, so a finished file is reused."""

import uuid
from datetime import UTC, datetime, timedelta
from functools import lru_cache
from typing import Annotated, Literal

from animarka_core.db import get_session
from animarka_core.models import Job, Poster
from animarka_core.queues import build_queues
from animarka_core.render import cache_key, preview_width
from animarka_core.settings import get_settings
from celery import Celery
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/api/v1")


class RenderIn(BaseModel):
    poster_id: str
    kind: Literal["preview", "print"] = "preview"


class RenderOut(BaseModel):
    job_id: str
    status: str


@lru_cache
def celery_client() -> Celery:
    """A sending client with the worker's queue definitions, dead letter queues included."""
    client = Celery(broker=get_settings().broker_url)
    client.conf.task_queues = build_queues()
    return client


def enqueue(job_id: str, poster_id: str, width: int, kind: str) -> None:
    """Send the task by name, so the API does not import the worker package."""
    celery_client().send_task(
        "animarka.render",
        args=[job_id, poster_id, width, kind],
        queue="render",
    )


STALE_AFTER = timedelta(minutes=10)


def stale_before() -> datetime:
    return datetime.now(UTC) - STALE_AFTER


def send_or_fail(job_id: str, poster_id: str, width: int, kind: str) -> None:
    try:
        enqueue(job_id, poster_id, width, kind)
    except Exception as exc:
        raise HTTPException(
            503, "The render queue is not reachable. Try again in a minute."
        ) from exc


@router.post("/renders", response_model=RenderOut, status_code=202)
async def start_render(
    body: RenderIn, session: Annotated[AsyncSession, Depends(get_session)]
) -> RenderOut:
    if body.kind == "print":
        raise HTTPException(402, "Print files come with a purchase. Payments open soon.")
    poster = await session.get(Poster, body.poster_id)
    if poster is None:
        raise HTTPException(404, "No such poster")
    width = preview_width(str(poster.state.get("size", "3:4")))
    key = cache_key(body.kind, poster.state, width)
    existing = await session.scalar(select(Job).where(Job.type == "render", Job.input_hash == key))
    if existing and existing.status == "queued" and existing.created_at < stale_before():
        # Queued long ago and never picked up (a lost message): send it again.
        send_or_fail(existing.id, poster.id, width, body.kind)
        return RenderOut(job_id=existing.id, status=existing.status)
    if existing and existing.status != "failed":
        return RenderOut(job_id=existing.id, status=existing.status)
    if existing:
        await session.delete(existing)
        await session.flush()
    job = Job(id=str(uuid.uuid4()), type="render", status="queued", input_hash=key)
    session.add(job)
    await session.commit()
    try:
        send_or_fail(job.id, poster.id, width, body.kind)
    except HTTPException:
        # Never leave a job that nothing will ever run.
        await session.delete(job)
        await session.commit()
        raise
    return RenderOut(job_id=job.id, status="queued")
