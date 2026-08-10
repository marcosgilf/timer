#!/usr/bin/env python3
"""Generate simple app icons without adding an image dependency."""
from __future__ import annotations

import struct
import zlib
from pathlib import Path

BG = (11, 11, 12, 255)
RED = (255, 43, 43, 255)

# Seven segment coordinates in a 100x180 cell.
SEGMENTS = {
    "a": (18, 10, 82, 28),
    "b": (72, 22, 90, 88),
    "c": (72, 92, 90, 158),
    "d": (18, 152, 82, 170),
    "e": (10, 92, 28, 158),
    "f": (10, 22, 28, 88),
    "g": (18, 81, 82, 99),
}
DIGITS = {"0": "abcdef", ":": "colon"}


def png(path: Path, size: int) -> None:
    image = bytearray(BG * size * size)

    def rect(x1: int, y1: int, x2: int, y2: int) -> None:
        for y in range(max(0, y1), min(size, y2)):
            for x in range(max(0, x1), min(size, x2)):
                i = (y * size + x) * 4
                image[i : i + 4] = bytes(RED)

    # More air than the in-app display: launcher icons get clipped, masked and shown tiny.
    # Positive gaps keep the colon from touching the digits.
    scale = size / 580
    chars = "00:00"
    cell_w = 100 * scale
    cell_h = 180 * scale
    colon_w = 45 * scale
    gap = 14 * scale
    total_w = cell_w * 4 + colon_w + gap * 4
    x = (size - total_w) / 2
    y = (size - cell_h) / 2

    for ch in chars:
        if ch == ":":
            dot = int(18 * scale)
            cx = int(x + (colon_w - dot) / 2)
            rect(cx, int(y + 54 * scale), cx + dot, int(y + 54 * scale) + dot)
            rect(cx, int(y + 108 * scale), cx + dot, int(y + 108 * scale) + dot)
            x += colon_w + gap
            continue
        for name in DIGITS[ch]:
            x1, y1, x2, y2 = SEGMENTS[name]
            rect(int(x + x1 * scale), int(y + y1 * scale), int(x + x2 * scale), int(y + y2 * scale))
        x += cell_w + gap

    raw = bytearray()
    stride = size * 4
    for y in range(size):
        raw.append(0)
        raw.extend(image[y * stride : (y + 1) * stride])

    def chunk(kind: bytes, data: bytes) -> bytes:
        return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", zlib.crc32(kind + data) & 0xFFFFFFFF)

    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(bytes(raw), 9))
        + chunk(b"IEND", b"")
    )


for name, size in [
    ("favicon.png", 32),
    ("icon-192.png", 192),
    ("icon-512.png", 512),
    ("apple-touch-icon.png", 180),
]:
    png(Path("public") / name, size)
