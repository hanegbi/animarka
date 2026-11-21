"""Generate the three launch background images, original and procedural. No third party art.

Run from the repo root:
    uv run --no-project --with numpy --with pillow python scripts/make_backgrounds.py

Writes, for each of aged, sky, forest:
    web/public/backgrounds/full/<id>.jpg   4096 x 4096, for the print render
    web/public/backgrounds/<id>.webp       1600 x 1600, for the browser
The images are square so they cover any poster shape without stretching.
"""

from __future__ import annotations

import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "web" / "public" / "backgrounds"
S = 4096
WEB = 1600


def noise(rng: np.random.Generator, cells_x: int, cells_y: int) -> np.ndarray:
    """Smooth noise in [-1, 1], S x S, from a small random grid blown up with bicubic scaling."""
    small = rng.random((cells_y, cells_x), dtype=np.float32)
    img = Image.fromarray(small, mode="F").resize((S, S), Image.BICUBIC)
    a = np.asarray(img, dtype=np.float32)
    return (a - 0.5) * 2


def fractal(rng: np.random.Generator, base_cells: int, octaves: int, ratio: float = 0.5) -> np.ndarray:
    total = np.zeros((S, S), dtype=np.float32)
    amp, norm = 1.0, 0.0
    for o in range(octaves):
        cells = base_cells * (2**o)
        total += amp * noise(rng, cells, cells)
        norm += amp
        amp *= ratio
    return total / norm


def grid() -> tuple[np.ndarray, np.ndarray]:
    y, x = np.mgrid[0:S, 0:S].astype(np.float32)
    return x / (S - 1), y / (S - 1)


def vignette(strength: float, power: float = 2.4) -> np.ndarray:
    x, y = grid()
    d = np.sqrt((x - 0.5) ** 2 + (y - 0.5) ** 2) / 0.7071
    return 1 - strength * np.clip(d, 0, 1) ** power


def to_image(rgb: np.ndarray) -> Image.Image:
    return Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8), mode="RGB")


def aged_paper() -> np.ndarray:
    rng = np.random.default_rng(11)
    base = np.array([233, 220, 192], dtype=np.float32)
    x, y = grid()
    lum = np.ones((S, S), dtype=np.float32)
    lum += 0.035 * fractal(rng, 3, 4)  # soft blotches
    lum += 0.012 * noise(rng, S // 3, S // 3)  # grain
    fibers = np.asarray(Image.fromarray(rng.random((S // 2, S // 90), dtype=np.float32), mode="F").resize((S, S), Image.BICUBIC))
    lum += 0.018 * (fibers - 0.5)
    glow = np.exp(-(((x - 0.22) / 0.55) ** 2 + ((y - 0.14) / 0.45) ** 2))
    lum += 0.06 * glow
    lum *= vignette(0.2)
    rgb = base[None, None, :] * lum[:, :, None]
    # warm the edges, like old paper
    edge = (1 - vignette(1.0, 2.0))[:, :, None]
    rgb = rgb * (1 - 0.18 * edge) + np.array([150, 105, 55], dtype=np.float32) * 0.18 * edge * 0.5
    # a few foxing spots
    spots = np.zeros((S, S), dtype=np.float32)
    for _ in range(40):
        cx, cy = rng.random(2)
        r = rng.uniform(0.004, 0.02)
        spots += rng.uniform(0.2, 0.7) * np.exp(-(((x - cx) ** 2 + (y - cy) ** 2) / (2 * r * r)))
    rgb = rgb * (1 - 0.08 * np.clip(spots, 0, 1)[:, :, None])
    return rgb


def morning_sky() -> np.ndarray:
    rng = np.random.default_rng(23)
    x, y = grid()
    stops = [
        (0.00, (183, 214, 234)),
        (0.42, (220, 235, 241)),
        (0.78, (247, 234, 217)),
        (1.00, (246, 220, 198)),
    ]
    rgb = np.zeros((S, S, 3), dtype=np.float32)
    for (p0, c0), (p1, c1) in zip(stops, stops[1:]):
        m = (y >= p0) & (y <= p1)
        t = np.where(m, (y - p0) / (p1 - p0), 0)[:, :, None]
        seg = np.array(c0, dtype=np.float32) * (1 - t) + np.array(c1, dtype=np.float32) * t
        rgb = np.where(m[:, :, None], seg, rgb)
    wash = fractal(rng, 2, 4, 0.55)
    rgb *= (1 + 0.035 * wash)[:, :, None]
    # watercolor pools: lighter clouds with softly darker rims
    cloud = fractal(rng, 3, 3, 0.5)
    pool = np.clip((cloud - 0.1) * 1.5, 0, 1) ** 1.5
    rim = np.clip(1 - np.abs((cloud - 0.1) * 5), 0, 1) * 0.5
    rgb = rgb * (1 - 0.3 * pool)[:, :, None] + 255 * 0.3 * pool[:, :, None]
    rgb *= (1 - 0.03 * rim)[:, :, None]
    glow = np.exp(-(((x - 0.5) / 0.7) ** 2 + ((y - 1.08) / 0.4) ** 2))
    rgb += np.array([246, 196, 160], dtype=np.float32)[None, None, :] * 0.12 * glow[:, :, None]
    rgb *= (1 + 0.012 * noise(rng, S // 3, S // 3))[:, :, None]  # paper grain
    rgb *= vignette(0.06)[:, :, None]
    return rgb


def leaf_polygon(cx: float, cy: float, length: float, width: float, angle: float) -> list[tuple[float, float]]:
    pts = []
    n = 24
    for i in range(n + 1):
        t = i / n
        w = math.sin(math.pi * t) ** 0.8 * width / 2
        pts.append((t * length, w))
    for i in range(n, -1, -1):
        t = i / n
        w = math.sin(math.pi * t) ** 0.8 * width / 2
        pts.append((t * length, -w))
    ca, sa = math.cos(angle), math.sin(angle)
    return [(cx + px * ca - py * sa, cy + px * sa + py * ca) for px, py in pts]


def forest() -> np.ndarray:
    rng = np.random.default_rng(37)
    x, y = grid()
    top = np.array([36, 68, 58], dtype=np.float32)
    bottom = np.array([24, 48, 38], dtype=np.float32)
    rgb = top[None, None, :] * (1 - y[:, :, None]) + bottom[None, None, :] * y[:, :, None]
    glow = np.exp(-(((x - 0.5) / 0.7) ** 2 + ((y - 0.3) / 0.6) ** 2))
    rgb += np.array([70, 120, 90], dtype=np.float32)[None, None, :] * 0.22 * glow[:, :, None]
    rgb *= (1 + 0.03 * fractal(rng, 3, 4))[:, :, None]

    layer = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    stroke = (150, 195, 160)
    for i in range(210):
        cx, cy = rng.uniform(-100, S + 100, 2)
        length = rng.uniform(260, 620)
        width = length * rng.uniform(0.32, 0.5)
        angle = rng.uniform(0, 2 * math.pi)
        alpha = int(rng.uniform(34, 70))
        poly = leaf_polygon(cx, cy, length, width, angle)
        d.line(poly + [poly[0]], fill=stroke + (alpha,), width=int(rng.uniform(5, 8)), joint="curve")
        ca, sa = math.cos(angle), math.sin(angle)
        d.line([(cx, cy), (cx + length * ca, cy + length * sa)], fill=stroke + (alpha,), width=4)
        for k in range(1, 6):
            t = k / 6
            px, py = cx + length * t * ca, cy + length * t * sa
            for sgn in (-1, 1):
                a2 = angle + sgn * 0.9
                ln = width * 0.4 * math.sin(math.pi * t)
                d.line([(px, py), (px + ln * math.cos(a2), py + ln * math.sin(a2))], fill=stroke + (int(alpha * 0.7),), width=3)
    layer = layer.filter(ImageFilter.GaussianBlur(1.6))
    la = np.asarray(layer, dtype=np.float32)
    a = la[:, :, 3:4] / 255.0
    rgb = rgb * (1 - a) + la[:, :, :3] * a
    rgb *= (1 + 0.01 * noise(rng, S // 3, S // 3))[:, :, None]
    rgb *= vignette(0.3)[:, :, None]
    return rgb


def rel_lum(c: np.ndarray) -> np.ndarray:
    c = c / 255.0
    c = np.where(c <= 0.03928, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    return 0.2126 * c[..., 0] + 0.7152 * c[..., 1] + 0.0722 * c[..., 2]


def contrast_report(name: str, img: Image.Image, ink: tuple[int, int, int]) -> None:
    small = np.asarray(img.resize((256, 256), Image.BILINEAR), dtype=np.float32)
    lum = rel_lum(small)
    ink_l = float(rel_lum(np.array(ink, dtype=np.float32)))
    mean = tuple(int(v) for v in small.reshape(-1, 3).mean(axis=0))
    worst_dark, worst_light = np.percentile(lum, 2), np.percentile(lum, 98)
    ratio = lambda a, b: (max(a, b) + 0.05) / (min(a, b) + 0.05)
    print(
        f"{name}: mean rgb {mean} hex #{mean[0]:02x}{mean[1]:02x}{mean[2]:02x}, "
        f"ink contrast vs mean {ratio(ink_l, float(lum.mean())):.2f}, "
        f"vs darkest 2% {ratio(ink_l, float(worst_dark)):.2f}, vs lightest 2% {ratio(ink_l, float(worst_light)):.2f}"
    )


def save(name: str, rgb: np.ndarray, ink: tuple[int, int, int]) -> None:
    img = to_image(rgb)
    (OUT / "full").mkdir(parents=True, exist_ok=True)
    img.save(OUT / "full" / f"{name}.jpg", "JPEG", quality=86, optimize=True, progressive=True)
    img.resize((WEB, WEB), Image.LANCZOS).save(OUT / f"{name}.webp", "WEBP", quality=80, method=4)
    contrast_report(name, img, ink)


def main() -> None:
    save("aged", aged_paper(), (42, 32, 20))
    save("sky", morning_sky(), (31, 51, 71))
    save("forest", forest(), (241, 236, 220))
    for f in sorted(OUT.rglob("*.*")):
        print(f"{f.relative_to(ROOT)}  {f.stat().st_size / 1e6:.2f} MB")


if __name__ == "__main__":
    main()
