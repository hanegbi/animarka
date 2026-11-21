"""Serve stored files. Keys of derived images hold a content hash, so they cache for a year."""

from animarka_core.storage import check_key, content_type, get_storage
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

router = APIRouter(prefix="/api/v1")


@router.get("/files/{key:path}")
async def get_file(key: str) -> FileResponse:
    try:
        check_key(key)
    except ValueError:
        raise HTTPException(404, "Not found") from None
    path = get_storage().local_path(key)
    if path is None:
        raise HTTPException(404, "Not found")
    return FileResponse(
        path,
        media_type=content_type(key),
        headers={"Cache-Control": "public, max-age=31536000, immutable"},
    )
