"""Trim transparent borders and make the sizes the web needs.

The trimmed original is kept for print.
"""

import io
from dataclasses import dataclass

from PIL import Image

ALPHA_THRESHOLD = 8
MEDIUM_EDGE = 640  # poster and large card art
THUMB_EDGE = 200  # picker cards and tray: 96 css px wide at 2x


@dataclass(frozen=True)
class Processed:
    original: bytes  # trimmed, lossless WebP
    medium: bytes
    thumb: bytes
    width: int  # trimmed size
    height: int


def _webp(im: Image.Image, edge: int | None, lossless: bool = False) -> bytes:
    if edge is not None:
        im = im.copy()
        im.thumbnail((edge, edge), Image.Resampling.LANCZOS)
    buf = io.BytesIO()
    if lossless:
        im.save(buf, "WEBP", lossless=True, method=4)
    else:
        im.save(buf, "WEBP", quality=84, method=4)
    return buf.getvalue()


def process(data: bytes) -> Processed:
    im = Image.open(io.BytesIO(data)).convert("RGBA")
    mask = im.getchannel("A").point(lambda a: 255 if a > ALPHA_THRESHOLD else 0)
    box = mask.getbbox()
    if box:
        im = im.crop(box)
    return Processed(
        original=_webp(im, None, lossless=True),
        medium=_webp(im, MEDIUM_EDGE),
        thumb=_webp(im, THUMB_EDGE),
        width=im.width,
        height=im.height,
    )
