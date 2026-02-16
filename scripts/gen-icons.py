#!/usr/bin/env python3
"""
產生極簡 PWA PNG 圖示 — 不依賴任何第三方套件
使用純 Python 寫 PNG 二進位格式
圖示設計：深紫色圓角矩形底 + 淺綠色 "EF" 文字（像素風格）
"""
import struct
import zlib
import os

def create_png(width, height, pixels):
    """建立 PNG 檔案的二進位資料"""
    def chunk(chunk_type, data):
        c = chunk_type + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xFFFFFFFF)

    raw = b''
    for y in range(height):
        raw += b'\x00'
        for x in range(width):
            raw += bytes(pixels[y][x])

    return (
        b'\x89PNG\r\n\x1a\n' +
        chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)) +
        chunk(b'IDAT', zlib.compress(raw, 9)) +
        chunk(b'IEND', b'')
    )

def fill_block(pixels, x, y, s, color, size):
    for dy in range(s):
        for dx in range(s):
            px, py = x + dx, y + dy
            if 0 <= px < size and 0 <= py < size:
                pixels[py][px] = color

def make_icon(size):
    bg = (48, 43, 99, 255)
    fg = (168, 237, 234, 255)
    transparent = (0, 0, 0, 0)
    pixels = [[transparent for _ in range(size)] for _ in range(size)]
    r = size * 14 // 64

    for y in range(size):
        for x in range(size):
            in_rect = True
            if x < r and y < r:
                if (x - r) ** 2 + (y - r) ** 2 > r ** 2: in_rect = False
            elif x >= size - r and y < r:
                if (x - (size - 1 - r)) ** 2 + (y - r) ** 2 > r ** 2: in_rect = False
            elif x < r and y >= size - r:
                if (x - r) ** 2 + (y - (size - 1 - r)) ** 2 > r ** 2: in_rect = False
            elif x >= size - r and y >= size - r:
                if (x - (size - 1 - r)) ** 2 + (y - (size - 1 - r)) ** 2 > r ** 2: in_rect = False
            if in_rect:
                pixels[y][x] = bg

    s = size // 16
    ox = size // 2 - s * 7
    oy = size // 2 - s * 4

    for dy in range(9):
        for dx in range(2):
            fill_block(pixels, ox + dx * s, oy + dy * s, s, fg, size)
    for dx in range(5):
        fill_block(pixels, ox + dx * s, oy, s, fg, size)
    for dx in range(4):
        fill_block(pixels, ox + dx * s, oy + 4 * s, s, fg, size)
    for dx in range(5):
        fill_block(pixels, ox + dx * s, oy + 8 * s, s, fg, size)

    fx = ox + s * 7
    for dy in range(9):
        for dx in range(2):
            fill_block(pixels, fx + dx * s, oy + dy * s, s, fg, size)
    for dx in range(5):
        fill_block(pixels, fx + dx * s, oy, s, fg, size)
    for dx in range(4):
        fill_block(pixels, fx + dx * s, oy + 4 * s, s, fg, size)

    return create_png(size, size, pixels)

base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
for sz in [192, 512]:
    data = make_icon(sz)
    path = os.path.join(base, f"icon-{sz}x{sz}.png")
    with open(path, 'wb') as f:
        f.write(data)
    print(f"Created {path} ({len(data)} bytes)")
