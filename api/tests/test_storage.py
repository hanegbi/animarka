from pathlib import Path

import pytest
from animarka_core.storage import LocalStorage, check_key, content_type


def test_put_get_exists_url(tmp_path: Path) -> None:
    s = LocalStorage(tmp_path, "/api/v1/files")
    assert not s.exists("art/fg/a/x.webp")
    s.put("art/fg/a/x.webp", b"data")
    assert s.exists("art/fg/a/x.webp")
    assert s.get("art/fg/a/x.webp") == b"data"
    assert s.url("art/fg/a/x.webp") == "/api/v1/files/art/fg/a/x.webp"
    assert s.local_path("art/fg/a/x.webp") == tmp_path.resolve() / "art/fg/a/x.webp"
    assert s.local_path("missing.webp") is None


def test_put_replaces_and_leaves_no_temp_files(tmp_path: Path) -> None:
    s = LocalStorage(tmp_path)
    s.put("a/b.png", b"one")
    s.put("a/b.png", b"two")
    assert s.get("a/b.png") == b"two"
    assert [p.name for p in (tmp_path / "a").iterdir()] == ["b.png"]


@pytest.mark.parametrize("key", ["../etc/passwd", "/abs", "a//b", "A/B", "a/../b", "", ".hidden"])
def test_rejects_unsafe_keys(key: str) -> None:
    with pytest.raises(ValueError):
        check_key(key)


def test_content_types() -> None:
    assert content_type("x.webp") == "image/webp"
    assert content_type("x.png") == "image/png"
    assert content_type("x.unknownext") == "application/octet-stream"
