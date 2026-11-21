"""Share links. The same poster state always gets the same short id."""

import hashlib
import json
import secrets
import string
from typing import Annotated

from animarka_core.db import get_session
from animarka_core.models import Poster, Species
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from animarka_api.schemas import PosterIn, PosterOut, PosterStateOut

router = APIRouter(prefix="/api/v1")
Session = Annotated[AsyncSession, Depends(get_session)]
ALPHABET = string.ascii_letters + string.digits


def state_hash(state: dict[str, object]) -> str:
    raw = json.dumps(state, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    return hashlib.sha256(raw.encode()).hexdigest()


def new_id() -> str:
    return "".join(secrets.choice(ALPHABET) for _ in range(8))


@router.post("/posters", response_model=PosterOut)
async def create_poster(body: PosterIn, session: Session) -> PosterOut:
    state = body.state.model_dump(mode="json")
    known = set(
        (await session.scalars(select(Species.id).where(Species.id.in_(state["order"])))).all()
    )
    unknown = [i for i in state["order"] if i not in known]
    if unknown:
        raise HTTPException(422, f"Unknown species: {', '.join(unknown[:5])}")
    digest = state_hash(state)
    existing = await session.scalar(select(Poster).where(Poster.state_hash == digest))
    if existing:
        return PosterOut(id=existing.id, url=f"/p/{existing.id}")
    poster = Poster(id=new_id(), state=state, state_hash=digest)
    session.add(poster)
    await session.commit()
    return PosterOut(id=poster.id, url=f"/p/{poster.id}")


@router.get("/posters/{poster_id}", response_model=PosterStateOut)
async def get_poster(poster_id: str, session: Session) -> PosterStateOut:
    poster = await session.get(Poster, poster_id)
    if poster is None:
        raise HTTPException(404, "No such poster")
    return PosterStateOut(id=poster.id, state=poster.state)
