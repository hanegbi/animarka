from alembic import command
from sqlalchemy import create_engine, inspect

from conftest import alembic_config

EXPECTED = {
    "catalogs",
    "species",
    "styles",
    "artworks",
    "backgrounds",
    "presets",
    "posters",
    "jobs",
    "reports",
}


def tables(url: str) -> set[str]:
    engine = create_engine(url)
    names = set(inspect(engine).get_table_names())
    engine.dispose()
    return names


def test_upgrade_creates_every_table(database_url: str) -> None:
    assert EXPECTED <= tables(database_url)


def test_downgrade_and_upgrade_again(database_url: str) -> None:
    cfg = alembic_config()
    command.downgrade(cfg, "base")
    assert not (EXPECTED & tables(database_url))
    command.upgrade(cfg, "head")
    assert EXPECTED <= tables(database_url)
