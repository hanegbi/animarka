"""Report a wrong bird."""

from typing import Annotated

from animarka_core.db import get_session
from animarka_core.models import Report, Species, Style
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from animarka_api.schemas import ReportIn, ReportOut

router = APIRouter(prefix="/api/v1")


@router.post("/reports", response_model=ReportOut, status_code=201)
async def create_report(
    body: ReportIn, session: Annotated[AsyncSession, Depends(get_session)]
) -> ReportOut:
    if await session.get(Species, body.species_id) is None:
        raise HTTPException(422, "No such species")
    if body.style_id is not None and await session.get(Style, body.style_id) is None:
        raise HTTPException(422, "No such style")
    report = Report(species_id=body.species_id, style_id=body.style_id, note=body.note.strip())
    session.add(report)
    await session.commit()
    return ReportOut(id=report.id)
