"""Where the art and the metadata come from.

Both repos are around 1.4 GB, so we never clone them. One GitHub API call per repo lists
every file with its blob hash, and each needed file is then downloaded on its own. Commits
are pinned in api/data/sources.json, so a run is reproducible and a rerun can skip files
whose hash has not changed.
"""

import json
import time
from collections.abc import Callable
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Protocol

import httpx
from animarka_core.settings import get_settings

DATA = Path(__file__).resolve().parents[4] / "api" / "data"


def load_sources() -> dict[str, Any]:
    sources: dict[str, Any] = json.loads((DATA / "sources.json").read_text(encoding="utf-8"))
    return sources


def load_aliases() -> dict[str, dict[str, str]]:
    """Per style: older scientific name of a file to the species.json name. Only woodblock today."""
    data: dict[str, Any] = json.loads((DATA / "wb_aliases.json").read_text(encoding="utf-8"))
    return {"wb": dict(data["aliases"])}


def load_manual_faces() -> dict[str, dict[str, str]]:
    faces: dict[str, dict[str, str]] = json.loads(
        (DATA / "faces_manual.json").read_text(encoding="utf-8")
    )
    return faces


@dataclass(frozen=True)
class TreeEntry:
    path: str
    sha: str


class Fetcher(Protocol):
    def tree(self, repo: str, ref: str) -> list[TreeEntry]: ...
    def raw(self, repo: str, ref: str, path: str) -> bytes: ...


class TransientError(Exception):
    """A failure worth trying again: a timeout, a dropped connection or a 5xx answer."""


def with_retries[T](
    fn: Callable[[], T],
    attempts: int = 4,
    base_delay: float = 0.5,
    sleep: Callable[[float], None] = time.sleep,
) -> T:
    """Call fn, retrying transient errors with exponential backoff: 0.5 s, 1 s, 2 s."""
    for i in range(attempts):
        try:
            return fn()
        except TransientError:
            if i == attempts - 1:
                raise
            sleep(base_delay * (2**i))
    raise AssertionError("unreachable")


class GitHubFetcher:
    def __init__(self, token: str = "", timeout: float = 60.0) -> None:
        headers = {"User-Agent": "animarka-ingest", "Accept": "application/vnd.github+json"}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        self.client = httpx.Client(headers=headers, timeout=timeout, follow_redirects=True)

    def _get(self, url: str) -> httpx.Response:
        try:
            res = self.client.get(url)
        except (httpx.TimeoutException, httpx.TransportError) as exc:
            raise TransientError(str(exc)) from exc
        if res.status_code >= 500 or res.status_code == 429:
            raise TransientError(f"{res.status_code} for {url}")
        res.raise_for_status()
        return res

    def tree(self, repo: str, ref: str) -> list[TreeEntry]:
        url = f"https://api.github.com/repos/{repo}/git/trees/{ref}?recursive=1"
        data = with_retries(lambda: self._get(url)).json()
        if data.get("truncated"):
            raise RuntimeError(f"file listing for {repo} was truncated")
        return [TreeEntry(t["path"], t["sha"]) for t in data["tree"] if t["type"] == "blob"]

    def raw(self, repo: str, ref: str, path: str) -> bytes:
        url = f"https://raw.githubusercontent.com/{repo}/{ref}/{path}"
        return with_retries(lambda: self._get(url)).content


def default_fetcher() -> Fetcher:
    return GitHubFetcher(get_settings().github_token)
