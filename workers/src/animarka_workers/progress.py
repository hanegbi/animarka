"""Job progress in Redis, so the UI and the admin page can follow a job without the database."""

from functools import lru_cache
from typing import Any, Protocol, cast

import redis
from animarka_core.settings import get_settings

TTL_SECONDS = 7 * 24 * 3600


class RedisLike(Protocol):
    def hset(self, name: str, mapping: dict[str, Any]) -> Any: ...
    def hincrby(self, name: str, key: str, amount: int) -> int: ...
    def hgetall(self, name: str) -> dict[Any, Any]: ...
    def expire(self, name: str, time: int) -> Any: ...


@lru_cache
def get_redis() -> RedisLike:
    return cast(RedisLike, redis.Redis.from_url(get_settings().redis_url, decode_responses=True))


def key(job_id: str) -> str:
    return f"job:{job_id}"


def start(job_id: str, total: int, r: RedisLike | None = None) -> None:
    r = r or get_redis()
    r.hset(key(job_id), mapping={"status": "running", "total": total, "done": 0, "failed": 0})
    r.expire(key(job_id), TTL_SECONDS)


def advance(
    job_id: str, done: int = 0, failed: int = 0, r: RedisLike | None = None
) -> dict[str, Any]:
    """Add finished and failed units atomically. Returns the new state."""
    r = r or get_redis()
    if done:
        r.hincrby(key(job_id), "done", done)
    if failed:
        r.hincrby(key(job_id), "failed", failed)
    return read(job_id, r)


def finish(job_id: str, status: str, r: RedisLike | None = None) -> None:
    r = r or get_redis()
    r.hset(key(job_id), mapping={"status": status})


def read(job_id: str, r: RedisLike | None = None) -> dict[str, Any]:
    r = r or get_redis()
    raw = r.hgetall(key(job_id))
    if not raw:
        return {}
    total = int(raw.get("total", 0))
    done = int(raw.get("done", 0))
    failed = int(raw.get("failed", 0))
    return {
        "status": raw.get("status", "unknown"),
        "total": total,
        "done": done,
        "failed": failed,
        "progress": (done + failed) / total if total else 0.0,
    }
