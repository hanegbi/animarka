"""Database engines and sessions.

The API uses the async engine, the Celery workers use the sync one.
Both use psycopg, so there is one driver. Engines are created on first use, so tests can point
ANIMARKA_DATABASE_URL at a test database first."""

from collections.abc import AsyncIterator, Iterator
from contextlib import contextmanager
from functools import lru_cache
from typing import Any

from sqlalchemy import JSON, Engine, create_engine
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from animarka_core.settings import get_settings

# JSON in tests on any engine, JSONB on Postgres.
JsonType = JSON().with_variant(JSONB(), "postgresql")


class Base(DeclarativeBase):
    type_annotation_map = {dict[str, Any]: JsonType, dict[str, str]: JsonType, list[str]: JsonType}


@lru_cache
def async_engine() -> AsyncEngine:
    return create_async_engine(get_settings().database_url, pool_pre_ping=True)


@lru_cache
def sync_engine() -> Engine:
    return create_engine(get_settings().database_url, pool_pre_ping=True)


def reset_engines() -> None:
    """Forget cached engines, for tests that switch databases."""
    async_engine.cache_clear()
    sync_engine.cache_clear()


async def get_session() -> AsyncIterator[AsyncSession]:
    """FastAPI dependency."""
    factory = async_sessionmaker(async_engine(), expire_on_commit=False)
    async with factory() as session:
        yield session


@contextmanager
def sync_session() -> Iterator[Session]:
    """For workers. Commits on success, rolls back on error."""
    factory = sessionmaker(sync_engine(), expire_on_commit=False)
    with factory() as session:
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
