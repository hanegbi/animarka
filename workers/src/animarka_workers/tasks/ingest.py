"""Celery tasks for the catalog ingest.

animarka.ingest.catalog plans the run and fans out one animarka.ingest.batch task per 25 species.
Each batch commits on its own, so a failure loses at most one batch, and a rerun skips what is done.
"""

import logging
import uuid
from typing import Any

from animarka_core.db import sync_session
from animarka_core.models import Job
from animarka_core.storage import get_storage

from animarka_workers import progress
from animarka_workers.app import app
from animarka_workers.ingest.run import artwork, plan
from animarka_workers.ingest.sources import (
    TreeEntry,
    default_fetcher,
    load_manual_faces,
    load_sources,
)

log = logging.getLogger(__name__)
BATCH = 25


@app.task(name="animarka.ingest.catalog")
def ingest_catalog(limit: int | None = None) -> dict[str, Any]:
    sources = load_sources()
    job_id = str(uuid.uuid4())
    with sync_session() as session:
        p = plan(session, default_fetcher(), sources)
        matches = p.matches[:limit] if limit else p.matches
        items = [
            [m.slug, style, e.path, e.sha] for m in matches for style, e in sorted(m.files.items())
        ]
        session.add(
            Job(
                id=job_id,
                type="ingest",
                status="running",
                input_hash=f"{sources['styles']['fg']['ref'][:12]}-{job_id}",
                result=p.counts,
            )
        )
    progress.start(job_id, len(items))
    for i in range(0, len(items), BATCH):
        ingest_batch.delay(job_id, items[i : i + BATCH])
    log.info("ingest %s: %s artworks queued, counts %s", job_id, len(items), p.counts)
    return {"job_id": job_id, **p.counts, "queued": len(items)}


@app.task(name="animarka.ingest.batch", bind=True, max_retries=3, default_retry_delay=10)
def ingest_batch(self: Any, job_id: str, items: list[list[str]]) -> dict[str, int]:
    sources = load_sources()["styles"]
    faces = load_manual_faces()
    storage = get_storage()
    fetcher = default_fetcher()
    stats = {"stored": 0, "skipped": 0, "failed": 0}
    for slug, style, path, sha in items:
        try:
            with sync_session() as session:
                result = artwork(
                    session,
                    storage,
                    fetcher,
                    sources[style],
                    style,
                    slug,
                    TreeEntry(path, sha),
                    faces,
                )
            stats[result] += 1
        except Exception:
            log.exception("ingest %s: %s %s failed", job_id, style, slug)
            stats["failed"] += 1
    state = progress.advance(
        job_id, done=stats["stored"] + stats["skipped"], failed=stats["failed"]
    )
    if state and state["done"] + state["failed"] >= state["total"]:
        final = "done" if state["failed"] == 0 else "done_with_errors"
        progress.finish(job_id, final)
        with sync_session() as session:
            job = session.get(Job, job_id)
            if job:
                job.status = final
                job.progress = 1.0
                job.result = {**(job.result or {}), "failed": state["failed"]}
    return stats
