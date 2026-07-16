#!/usr/bin/env python3
"""Generate aura-scanner app icons: 192, 512, maskable-512."""
from PIL import Image, ImageDraw, ImageFilter
import math, os, random

OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'icons')
os.makedirs(OUT_DIR, exist_ok=True)

def lerp(a, b, t): return a + (b - a) * t

def aura_icon(size: int, maskable: bool = False) -> Image.Image:
    # maskable icons need a safe zone — 40% padding from center
    pad = 0.0 if not maskable else 0.2
    inner_size = int(size * (1 - pad * 2))

    # Background — deep cosmic
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    bg = Image.new('RGBA', (size, size), (10, 6, 18, 255))
    draw = ImageDraw.Draw(bg)

    # Nebula glow
    for r, alpha, color in [
        (size * 0.6, 25, (80, 30, 140)),
        (size * 0.4, 35, (140, 60, 200)),
        (size * 0.25, 60, (200, 130, 255)),
    ]:
        layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        d = ImageDraw.Draw(layer)
        d.ellipse([size/2 - r, size/2 - r, size/2 + r, size/2 + r], fill=(*color, alpha))
        bg = Image.alpha_composite(bg, layer)

    # Stars
    random.seed(42)
    stars = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    sd = ImageDraw.Draw(stars)
    for _ in range(int(size * 1.2)):
        x = random.uniform(0, size); y = random.uniform(0, size)
        r = random.choice([0.5, 0.7, 1, 1, 1.4])
        a = random.randint(80, 220)
        sd.ellipse([x-r, y-r, x+r, y+r], fill=(255, 255, 255, a))
    stars = stars.filter(ImageFilter.GaussianBlur(0.4))
    bg = Image.alpha_composite(bg, stars)
    img = Image.alpha_composite(img, bg)

    # Aura orb at center
    cx, cy = size/2, size/2
    orb_r = inner_size * 0.30
    orb_layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    od = ImageDraw.Draw(orb_layer)

    # Outer glow rings
    for r, alpha in [
        (orb_r * 1.8, 25),
        (orb_r * 1.5, 40),
        (orb_r * 1.25, 60),
    ]:
        od.ellipse([cx-r, cy-r, cx+r, cy+r], fill=(169, 124, 255, alpha))
    orb_layer = orb_layer.filter(ImageFilter.GaussianBlur(8))

    # Core orb — radial gradient via concentric ellipses
    core = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    cd = ImageDraw.Draw(core)
    for i in range(int(orb_r), 0, -2):
        t = i / orb_r
        r = int(lerp(255, 90, t))
        g = int(lerp(255, 100, t))
        b = int(lerp(255, 240, t))
        a = int(lerp(255, 250, 1 - t * 0.4))
        cd.ellipse([cx-i, cy-i, cx+i, cy+i], fill=(r, g, b, a))
    # Highlight
    hl = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    hd = ImageDraw.Draw(hl)
    hd.ellipse([cx-orb_r*0.5, cy-orb_r*0.6, cx+orb_r*0.1, cy-orb_r*0.1],
               fill=(255, 255, 255, 220))
    hl = hl.filter(ImageFilter.GaussianBlur(orb_r * 0.18))
    core = Image.alpha_composite(core, hl)

    orb_layer = Image.alpha_composite(orb_layer, core)

    # Dashed outer ring
    ring = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    rd = ImageDraw.Draw(ring)
    rr = orb_r * 1.6
    dash_len = 8
    gap_len = 6
    circumference = 2 * math.pi * rr
    n_dashes = int(circumference / (dash_len + gap_len))
    for i in range(n_dashes):
        a0 = (i / n_dashes) * 2 * math.pi
        a1 = a0 + (dash_len / circumference) * 2 * math.pi
        x0 = cx + rr * math.cos(a0); y0 = cy + rr * math.sin(a0)
        x1 = cx + rr * math.cos(a1); y1 = cy + rr * math.sin(a1)
        rd.line([(x0, y0), (x1, y1)], fill=(200, 170, 255, 200), width=max(1, int(size/256)))
    ring = ring.filter(ImageFilter.GaussianBlur(0.5))
    orb_layer = Image.alpha_composite(ring, orb_layer)

    img = Image.alpha_composite(img, orb_layer)

    if maskable:
        # Composite onto a solid colored square for the safe zone
        solid = Image.new('RGBA', (size, size), (10, 6, 18, 255))
        return Image.alpha_composite(solid, img)

    return img

# Generate
for size, name in [(192, 'icon-192.png'), (512, 'icon-512.png')]:
    aura_icon(size).save(os.path.join(OUT_DIR, name), 'PNG', optimize=True)
    print(f'wrote {name}')

aura_icon(512, maskable=True).save(os.path.join(OUT_DIR, 'icon-maskable-512.png'), 'PNG', optimize=True)
print('wrote icon-maskable-512.png')

# Tiny favicon-style SVG for browsers that prefer it
svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="#1a0d2e"/>
      <stop offset="100%" stop-color="#0a0612"/>
    </radialGradient>
    <radialGradient id="orb" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="30%" stop-color="#a97cff"/>
      <stop offset="80%" stop-color="#4a2b8a"/>
      <stop offset="100%" stop-color="#1a0d2e"/>
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#a97cff" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#a97cff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bg)"/>
  <circle cx="256" cy="256" r="200" fill="url(#glow)"/>
  <circle cx="256" cy="256" r="130" fill="url(#orb)"/>
  <circle cx="256" cy="256" r="200" fill="none" stroke="#a97cff" stroke-width="2" stroke-dasharray="8 6" opacity="0.7"/>
</svg>'''
with open(os.path.join(OUT_DIR, 'icon.svg'), 'w') as f:
    f.write(svg)
print('wrote icon.svg')
print('done')
