"""Draw the ATLAS app icon (rings on dark) as PNGs with no dependencies.

Run: python3 scripts/make-icons.py
"""
import math
import struct
import zlib
from pathlib import Path

BG = (5, 8, 15)
# (radius, half-width, color, dash segments or None) in units of icon size
RINGS = [
    (0.40, 0.012, (255, 201, 74), 12),
    (0.34, 0.006, (224, 40, 58), None),
    (0.27, 0.030, (224, 40, 58), None),
    (0.18, 0.016, (0, 229, 255), 10),
    (0.11, 0.008, (255, 201, 74), None),
]
GLOW = (0, 229, 255)


def pixel(x, y):
    r = math.hypot(x, y)
    a = math.atan2(y, x)
    col = list(BG)
    # soft cyan glow in the middle, red haze at the bottom
    g = max(0.0, 1 - r / 0.32) ** 2 * 0.35
    col = [c + (gc - c) * g for c, gc in zip(col, GLOW)]
    h = max(0.0, (y - 0.15) / 0.35) * max(0.0, 1 - r / 0.7) * 0.25
    col = [c + (rc - c) * h for c, rc in zip(col, (224, 40, 58))]
    for rad, hw, rc, dashes in RINGS:
        d = abs(r - rad)
        if d > hw + 0.006:
            continue
        if dashes and (a / (2 * math.pi) * dashes) % 1 > 0.72:
            continue
        cover = max(0.0, min(1.0, (hw + 0.004 - d) / 0.004))
        col = [c + (q - c) * cover for c, q in zip(col, rc)]
    return tuple(int(max(0, min(255, c))) for c in col)


def png(size, path):
    rows = []
    for j in range(size):
        row = bytearray([0])
        for i in range(size):
            row += bytes(pixel((i + 0.5) / size - 0.5, (j + 0.5) / size - 0.5))
        rows.append(bytes(row))
    raw = zlib.compress(b''.join(rows), 9)

    def chunk(t, d):
        return struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d) & 0xFFFFFFFF)

    data = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', size, size, 8, 2, 0, 0, 0)) + chunk(b'IDAT', raw) + chunk(b'IEND', b'')
    Path(path).write_bytes(data)


out = Path(__file__).resolve().parent.parent / 'public' / 'icons'
out.mkdir(parents=True, exist_ok=True)
for size, name in [(512, 'icon-512.png'), (192, 'icon-192.png'), (180, 'apple-touch-icon.png')]:
    png(size, out / name)
    print('wrote', name)
