"""Shared pytest setup for api/ and workers/.

Database tests run against a real Postgres. The test database is dropped and created
fresh for each run and migrated with Alembic. If Postgres is not reachable the tests are
skipped, unless ANIMARKA_REQUIRE_DB=1 (set in CI), where they fail instead.
"""

import asyncio
import os
import sys
from collections.abc import Iterator
from pathlib import Path

import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session

ROOT = Path(__file__).resolve().parent
ADMIN_URL = os.environ.get(
    "ANIMARKA_TEST_ADMIN_URL", "postgresql+psycopg://animarka:animarka@localhost:5432/postgres"
)
TEST_URL = os.environ.get(
    "ANIMARKA_TEST_DATABASE_URL",
    "postgresql+psycopg://animarka:animarka@localhost:5432/animarka_test",
)

if sys.platform == "win32":
    # psycopg's async mode cannot use Windows' default event loop.
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())  # type: ignore[attr-defined,unused-ignore]


def alembic_config():  # type: ignore[no-untyped-def]
    from alembic.config import Config

    cfg = Config(str(ROOT / "api" / "alembic.ini"))
    cfg.set_main_option("script_location", str(ROOT / "api" / "alembic"))
    cfg.attributes["url"] = TEST_URL
    return cfg


@pytest.fixture(scope="session")
def database_url() -> Iterator[str]:
    admin = create_engine(ADMIN_URL, isolation_level="AUTOCOMMIT")
    try:
        conn = admin.connect()
    except OperationalError as exc:
        if os.environ.get("ANIMARKA_REQUIRE_DB") == "1":
            raise
        pytest.skip(f"Postgres is not reachable: {exc.__class__.__name__}")
    name = TEST_URL.rsplit("/", 1)[1]
    conn.execute(text(f'DROP DATABASE IF EXISTS "{name}" WITH (FORCE)'))
    conn.execute(text(f'CREATE DATABASE "{name}"'))
    conn.close()
    admin.dispose()

    os.environ["ANIMARKA_DATABASE_URL"] = TEST_URL
    from animarka_core.db import reset_engines
    from animarka_core.settings import get_settings

    get_settings.cache_clear()
    reset_engines()

    from alembic import command

    command.upgrade(alembic_config(), "head")
    yield TEST_URL
    reset_engines()


TABLES = [
    "reports",
    "artworks",
    "presets",
    "species",
    "backgrounds",
    "styles",
    "catalogs",
    "posters",
    "jobs",
]


@pytest.fixture
def db(database_url: str) -> Iterator[Session]:
    """A session on a clean database. Every table is emptied after the test."""
    engine = create_engine(database_url)
    with Session(engine) as session:
        yield session
        session.rollback()
    with engine.begin() as conn:
        conn.execute(text("TRUNCATE " + ", ".join(TABLES) + " RESTART IDENTITY CASCADE"))
    engine.dispose()
