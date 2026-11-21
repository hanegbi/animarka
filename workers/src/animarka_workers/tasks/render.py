"""Render a saved poster to a PNG with a real browser, so the file matches the builder exactly."""

import logging
from typing import Any

from animarka_core.db import sync_session
from animarka_core.models import Job
from animarka_core.render import sign
from animarka_core.settings import get_settings
from animarka_core.storage import get_storage

from animarka_workers import progress
from animarka_workers.app import app

log = logging.getLogger(__name__)
READY_TIMEOUT_MS = 60_000


def render_png(poster_id: str, width: int, kind: str) -> bytes:
    from playwright.sync_api import sync_playwright  # heavy import, only in the render worker

    url = (
        f"{get_settings().web_origin}/render/{poster_id}"
        f"?w={width}&kind={kind}&t={sign(poster_id, width, kind)}"
    )
    with sync_playwright() as pw:
        browser = pw.chromium.launch(args=["--disable-dev-shm-usage"])
        try:
            page = browser.new_page(
                viewport={"width": width, "height": width * 2}, device_scale_factor=1
            )
            res = page.goto(url, wait_until="networkidle", timeout=READY_TIMEOUT_MS)
            if res is None or not res.ok:
                raise RuntimeError(f"render page answered {res.status if res else 'nothing'}")
            page.wait_for_selector("body[data-render-ready=true]", timeout=READY_TIMEOUT_MS)
            png: bytes = page.locator("[data-render-root]").screenshot(type="png")
            return png
        finally:
            browser.close()


@app.task(name="animarka.render", bind=True, max_retries=2, default_retry_delay=5)
def render(self: Any, job_id: str, poster_id: str, width: int, kind: str) -> dict[str, Any]:
    progress.start(job_id, 1)
    with sync_session() as session:
        job = session.get(Job, job_id)
        if job is None:
            raise RuntimeError(f"no job {job_id}")
        if job.status == "done" and job.result:
            return job.result  # a duplicate delivery does no double work
        job.status = "running"
    try:
        png = render_png(poster_id, width, kind)
    except Exception as exc:
        if self.request.retries < self.max_retries:
            raise self.retry(exc=exc) from exc
        log.exception("render %s failed", job_id)
        with sync_session() as session:
            job = session.get(Job, job_id)
            if job:
                job.status, job.error = "failed", "The render did not finish. Try again."
        progress.finish(job_id, "failed")
        raise
    key = f"renders/{job_id}.png"
    storage = get_storage()
    storage.put(key, png)
    result = {"png": storage.url(key), "width": width, "kind": kind}
    with sync_session() as session:
        job = session.get(Job, job_id)
        if job:
            job.status, job.progress, job.result = "done", 1.0, result
    progress.advance(job_id, done=1)
    progress.finish(job_id, "done")
    return result
