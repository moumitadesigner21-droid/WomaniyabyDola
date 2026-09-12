#!/usr/bin/env python3
"""Replace indoor photo backdrops with heritage-style designs for Gamcha shirts."""

from __future__ import annotations

import math
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageDraw
from rembg import new_session, remove

ROOT = Path(__file__).resolve().parents[1] / "public" / "products"
CUTOUT_DIR = ROOT / "_cutouts"
SESSION = new_session("u2net")

IVORY = (250, 247, 242)
SAND = (243, 232, 220)
SAGE = (232, 240, 230)
BLUSH = (245, 230, 239)
MAROON = (107, 30, 46)
GOLD = (201, 162, 39)
FOREST = (45, 80, 22)
TEAL = (36, 92, 88)

JOBS = [
    {"dir": "gamcha-cotton-shirt-4", "source": "source.jpg", "output": "01.jpg", "style": "mekhla-chevrons"},
    {"dir": "gamcha-cotton-shirt-4", "source": "source-02.jpg", "output": "02.jpg", "style": "jamdani-dots"},
    {"dir": "gamcha-cotton-shirt-3", "source": "source.jpg", "output": "01.jpg", "style": "heritage-diamonds"},
    {"dir": "gamcha-cotton-shirt-3", "source": "source-02.jpg", "output": "02.jpg", "style": "temple-border"},
    {"dir": "gamcha-cotton-shirt-2", "source": "source.jpg", "output": "01.jpg", "style": "handloom-weave"},
    {"dir": "gamcha-cotton-shirt", "source": "source.jpg", "output": "01.jpg", "style": "block-print-floral"},
]


def tile_pattern(size: tuple[int, int], tile_fn, tile_size: int) -> Image.Image:
    tile = tile_fn(tile_size)
    canvas = Image.new("RGBA", size, (0, 0, 0, 0))
    for y in range(0, size[1], tile_size):
        for x in range(0, size[0], tile_size):
            canvas.alpha_composite(tile, (x, y))
    return canvas


def gamcha_stripes_tile(size: int) -> Image.Image:
    tile = Image.new("RGBA", (size, size), (*IVORY, 255))
    draw = ImageDraw.Draw(tile)
    stripe_colors = [
        (180, 42, 52, 55),
        (201, 162, 39, 50),
        (45, 80, 22, 48),
        (58, 92, 150, 45),
        (120, 58, 110, 42),
    ]
    band = max(8, size // 14)
    y = 0
    index = 0
    while y < size:
        color = stripe_colors[index % len(stripe_colors)]
        draw.rectangle((0, y, size, min(size, y + band)), fill=color)
        y += band
        index += 1
    return tile


def mekhla_chevrons_tile(size: int) -> Image.Image:
    tile = Image.new("RGBA", (size, size), (*IVORY, 255))
    draw = ImageDraw.Draw(tile)
    step = max(24, size // 6)
    for row in range(-1, size // step + 2):
        for col in range(-1, size // step + 2):
            x = col * step
            y = row * step + (step // 2 if col % 2 else 0)
            points = [(x, y + step // 2), (x + step // 2, y), (x + step, y + step // 2), (x + step // 2, y + step)]
            fill = (*MAROON, 48) if (row + col) % 2 == 0 else (*GOLD, 44)
            draw.polygon(points, fill=fill)
    return tile


def jamdani_dots_tile(size: int) -> Image.Image:
    tile = Image.new("RGBA", (size, size), (238, 248, 246, 255))
    draw = ImageDraw.Draw(tile)
    step = max(18, size // 8)
    for row in range(0, size + step, step):
        for col in range(0, size + step, step):
            cx = col + step // 2
            cy = row + step // 2
            draw.ellipse((cx - 4, cy - 4, cx + 4, cy + 4), fill=(*TEAL, 70))
            draw.ellipse((cx - 1, cy - 1, cx + 1, cy + 1), fill=(*GOLD, 90))
            if (row + col) % (step * 2) == 0:
                draw.line((cx - 6, cy, cx + 6, cy), fill=(*MAROON, 35), width=1)
                draw.line((cx, cy - 6, cx, cy + 6), fill=(*MAROON, 35), width=1)
    return tile


def heritage_diamonds_tile(size: int) -> Image.Image:
    tile = Image.new("RGBA", (size, size), (*SAND, 255))
    draw = ImageDraw.Draw(tile)
    step = max(28, size // 5)
    for row in range(-1, size // step + 2):
        for col in range(-1, size // step + 2):
            cx = col * step + (step // 2 if row % 2 else 0)
            cy = row * step
            half = step // 3
            points = [(cx, cy - half), (cx + half, cy), (cx, cy + half), (cx - half, cy)]
            fill = (*MAROON, 58) if (row + col) % 2 == 0 else (*GOLD, 52)
            draw.polygon(points, fill=fill, outline=(*MAROON, 28))
    return tile


def temple_border_tile(size: int) -> Image.Image:
    tile = Image.new("RGBA", (size, size), (252, 236, 228, 255))
    draw = ImageDraw.Draw(tile)
    step = max(36, size // 4)
    arch = step // 2
    for col in range(0, size + step, step):
        base = col + step // 2
        draw.arc((base - arch, 0, base + arch, step), 180, 0, fill=(*MAROON, 65), width=3)
        draw.rectangle((base - 4, step // 3, base + 4, step), fill=(*GOLD, 55))
        draw.line((base - arch, step // 2, base + arch, step // 2), fill=(*MAROON, 30), width=1)
    for row in range(step, size + step, step):
        draw.line((0, row, size, row), fill=(*GOLD, 24), width=1)
    return tile


def handloom_weave_tile(size: int) -> Image.Image:
    tile = Image.new("RGBA", (size, size), (*SAGE, 255))
    draw = ImageDraw.Draw(tile)
    spacing = max(10, size // 12)
    for x in range(0, size, spacing):
        draw.line((x, 0, x, size), fill=(*FOREST, 34), width=1)
    for y in range(0, size, spacing):
        draw.line((0, y, size, y), fill=(255, 255, 255, 48), width=1)
    for x in range(spacing // 2, size, spacing):
        for y in range(spacing // 2, size, spacing):
            draw.ellipse((x - 2, y - 2, x + 2, y + 2), fill=(*FOREST, 42))
    return tile


def block_print_floral_tile(size: int) -> Image.Image:
    tile = Image.new("RGBA", (size, size), (*BLUSH, 255))
    draw = ImageDraw.Draw(tile)
    step = max(34, size // 4)
    for row in range(0, size + step, step):
        for col in range(0, size + step, step):
            cx = col + step // 2
            cy = row + step // 2
            radius = step // 5
            draw.ellipse(
                (cx - radius, cy - radius, cx + radius, cy + radius),
                fill=(*MAROON, 48),
            )
            petal = step // 7
            for angle in (0, 90, 180, 270):
                rad = math.radians(angle)
                px = cx + int(math.cos(rad) * petal * 1.8)
                py = cy + int(math.sin(rad) * petal * 1.8)
                draw.ellipse((px - 3, py - 3, px + 3, py + 3), fill=(*GOLD, 55))
            draw.line((cx, cy - petal, cx, cy + petal), fill=(*MAROON, 32), width=1)
            draw.line((cx - petal, cy, cx + petal, cy), fill=(*MAROON, 32), width=1)
    return tile


def build_backdrop(size: tuple[int, int], style: str) -> Image.Image:
    tile_size = 160
    builders = {
        "gamcha-stripes": gamcha_stripes_tile,
        "mekhla-chevrons": mekhla_chevrons_tile,
        "jamdani-dots": jamdani_dots_tile,
        "heritage-diamonds": heritage_diamonds_tile,
        "temple-border": temple_border_tile,
        "handloom-weave": handloom_weave_tile,
        "block-print-floral": block_print_floral_tile,
    }
    return tile_pattern(size, builders[style], tile_size)


def load_cutout(source_path: Path) -> Image.Image:
    CUTOUT_DIR.mkdir(parents=True, exist_ok=True)
    cache_path = CUTOUT_DIR / f"{source_path.parent.name}-{source_path.stem}.png"

    if cache_path.exists():
        return Image.open(cache_path).convert("RGBA")

    with source_path.open("rb") as handle:
        cutout = remove(handle.read(), session=SESSION)

    subject = Image.open(BytesIO(cutout)).convert("RGBA")
    subject.save(cache_path, format="PNG")
    return subject


def composite_on_backdrop(source_path: Path, output_path: Path, style: str) -> None:
    subject = load_cutout(source_path)
    backdrop = build_backdrop(subject.size, style)
    backdrop.alpha_composite(subject)
    backdrop.convert("RGB").save(output_path, format="JPEG", quality=92, optimize=True)


def main() -> None:
    for job in JOBS:
        folder = ROOT / job["dir"]
        source = folder / job["source"]
        output = folder / job["output"]

        if not source.exists():
            raise FileNotFoundError(f"Missing source image: {source}")

        print(f"Processing {job['dir']}/{job['output']} ({job['style']})...")
        composite_on_backdrop(source, output, job["style"])
        print(f"  -> {output}")


if __name__ == "__main__":
    main()
