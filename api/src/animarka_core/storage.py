"""File storage behind one small interface. Local disk now. S3 later is a second class, not a rewrite.

Keys are relative paths such as art/fg/tyto-alba/1a2b3c4d-thumb.webp. Keys that hold derived images
include a short content hash, so a changed image gets a new key and browsers can cache forever.
"""

import mimetypes
import os
import re
import tempfile
from functools import lru_cache
from pathlib import Path
from typing import Protocol

from animarka_core.settings import get_settings

KEY_RE = re.compile(r"^[a-z0-9][a-z0-9/._-]*$")


class Storage(Protocol):
    def put(self, key: str, data: bytes) -> None: ...
    def get(self, key: str) -> bytes: ...
    def exists(self, key: str) -> bool: ...
    def url(self, key: str) -> str: ...
    def local_path(self, key: str) -> Path | None: ...


def check_key(key: str) -> str:
    if not KEY_RE.match(key) or ".." in key or "//" in key:
        raise ValueError(f"bad storage key: {key!r}")
    return key


def content_type(key: str) -> str:
    return mimetypes.guess_type(key)[0] or "application/octet-stream"


class LocalStorage:
    def __init__(self, root: str | Path, url_prefix: str = "/api/v1/files") -> None:
        self.root = Path(root).resolve()
        self.url_prefix = url_prefix.rstrip("/")

    def _path(self, key: str) -> Path:
        return self.root / check_key(key)

    def put(self, key: str, data: bytes) -> None:
        path = self._path(key)
        path.parent.mkdir(parents=True, exist_ok=True)
        # Write to a temporary file and rename, so a crash never leaves half a file under the real key.
        fd, tmp = tempfile.mkstemp(dir=path.parent, prefix=".tmp-")
        try:
            with os.fdopen(fd, "wb") as f:
                f.write(data)
            os.replace(tmp, path)
        except BaseException:
            Path(tmp).unlink(missing_ok=True)
            raise

    def get(self, key: str) -> bytes:
        return self._path(key).read_bytes()

    def exists(self, key: str) -> bool:
        return self._path(key).is_file()

    def url(self, key: str) -> str:
        return f"{self.url_prefix}/{check_key(key)}"

    def local_path(self, key: str) -> Path | None:
        path = self._path(key)
        return path if path.is_file() else None


@lru_cache
def get_storage() -> Storage:
    s = get_settings()
    return LocalStorage(s.storage_dir, s.files_url_prefix)
