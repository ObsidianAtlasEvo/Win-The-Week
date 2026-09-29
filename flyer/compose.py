"""Compose the cinematic stage (background + hero products) for the weekly LG flyer.

Usage: python3 compose.py week.json [dark|light]
Writes build/stage_<theme>.jpg (13.333" x 7.5" at 200 px/in) and theme-ready logos.
Product photos may sit on white: the TV is cropped to its screen, audio products
are cut out from the white background automatically.
"""
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

P = 200                       # pixels per inch
W, H = int(13.333 * P), int(7.5 * P)
cfg = json.load(open(sys.argv[1] if len(sys.argv) > 1 else "week.json"))
THEME = sys.argv[2] if len(sys.argv) > 2 else cfg.get("theme", "dark")
LIGHT = THEME == "light"
os.makedirs("build", exist_ok=True)

# Hero geometry (inches) — build.js mirrors these for the badge position
TV_X, TV_Y, TV_W = 2.15, 1.66, 4.9
SPK_H, SPK_BOTTOM = 2.1, 4.52


def px(v):
    return int(round(v * P))


def content_bbox(img, thresh=235):
    a = np.asarray(img.convert("RGB")).astype(int)
    ys, xs = np.where(a.min(axis=2) < thresh)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1


def column_segments(img, thresh=235, min_w=20):
    a = np.asarray(img.convert("RGB")).astype(int)
    col = (a.min(axis=2) < thresh).any(axis=0)
    segs, start = [], None
    for x, v in enumerate(col):
        if v and start is None:
            start = x
        if not v and start is not None:
            segs.append((start, x)); start = None
    if start is not None:
        segs.append((start, len(col)))
    return [s for s in segs if s[1] - s[0] > min_w]


def cutout(img, fade=0.35):
    """White background -> alpha; fade the bottom so cropped photos melt into the floor."""
    a = np.asarray(img.convert("RGB")).astype(np.float32)
    lum = a.min(axis=2)
    alpha = np.clip((248 - lum) / 38.0, 0, 1)
    h = alpha.shape[0]
    f0 = int(h * (1 - fade))
    ramp = np.ones(h, np.float32)
    ramp[f0:] = np.linspace(1, 0, h - f0) ** 1.4
    alpha *= ramp[:, None]
    rgba = np.dstack([a, alpha * 255]).astype(np.uint8)
    return Image.fromarray(rgba, "RGBA")


def glow(canvas, cx, cy, rx, ry, color, alpha, blur):
    layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=color + (int(255 * alpha),))
    layer = layer.filter(ImageFilter.GaussianBlur(blur))
    canvas.alpha_composite(layer)


# ---------- logos: white artwork is recolored for the light theme ----------
def theme_logo(name, dark_rgb, keep_left_of_red=False):
    im = Image.open("assets/" + name).convert("RGBA")
    if LIGHT:
        a = np.asarray(im).astype(np.int32).copy()
        rgb = a[..., :3]
        whiteish = (rgb.min(axis=2) > 150) & ((rgb.max(axis=2) - rgb.min(axis=2)) < 40)
        if keep_left_of_red:   # LG: keep the white face inside the red circle
            red = (rgb[..., 0] > 150) & (rgb[..., 1] < 90)
            whiteish &= np.arange(a.shape[1])[None, :] > np.where(red.any(axis=0))[0].max()
        a[whiteish, :3] = dark_rgb
        im = Image.fromarray(a.astype(np.uint8), "RGBA")
    im.resize((im.width * 4, im.height * 4), Image.LANCZOS).save(f"build/{THEME}_{name}")


theme_logo("bestbuy_logo.png", (29, 37, 44))
theme_logo("lg_logo.png", (107, 107, 107), keep_left_of_red=True)

# ---------- base: near-black (or white) with a faint vertical falloff ----------
y = np.linspace(0, 1, H)[:, None]
top, bot = np.array([14, 13, 22]), np.array([5, 5, 8])
if LIGHT:
    top, bot = np.array([255, 255, 255]), np.array([246, 246, 250])
base = np.broadcast_to((top * (1 - y) + bot * y)[:, None, :], (H, W, 3)).copy()
# subtle film grain to avoid banding
base += np.random.default_rng(7).normal(0, 0.6 if LIGHT else 1.1, base.shape)
stage = Image.fromarray(np.clip(base, 0, 255).astype(np.uint8), "RGB").convert("RGBA")

# ---------- TV screen ----------
tv_src = Image.open(cfg["tv"]["image"]).convert("RGB")
screen = tv_src.crop(content_bbox(tv_src))
sw = px(TV_W)
sh = int(screen.height * sw / screen.width)
screen = screen.resize((sw, sh), Image.LANCZOS)
sx, sy = px(TV_X), px(TV_Y)
tv_cx, tv_cy = sx + sw // 2, sy + sh // 2

# ambient color spill from the picture (the "OLED glow")
amb_src = screen.resize((int(sw * 1.18), int(sh * 1.22)), Image.BILINEAR).convert("RGBA")
if LIGHT:
    # only the picture's colour spills onto white: alpha from chroma, so black stays clean
    a = np.asarray(amb_src).astype(np.float32)
    chroma = (a[..., :3].max(axis=2) - a[..., :3].min(axis=2)) / 255.0
    a[..., 3] = np.clip(chroma * 1.4, 0, 1) * 255 * 0.85
    amb_src = Image.fromarray(a.astype(np.uint8), "RGBA")
else:
    amb_src.putalpha(int(255 * 0.70))
amb = Image.new("RGBA", stage.size, (0, 0, 0, 0))
amb.paste(amb_src, (tv_cx - amb_src.width // 2, tv_cy - amb_src.height // 2 + 12))
if LIGHT:
    # premultiplied blur so transparent black doesn't grey out the colour bloom
    a = np.asarray(amb).astype(np.float32) / 255.0
    pm = Image.fromarray((np.dstack([a[..., :3] * a[..., 3:], a[..., 3:]]) * 255).astype(np.uint8), "RGBA")
    pm = np.asarray(pm.filter(ImageFilter.GaussianBlur(85))).astype(np.float32) / 255.0
    al = pm[..., 3:]
    rgb = np.where(al > 1e-3, pm[..., :3] / np.maximum(al, 1e-3), 0)
    amb = Image.fromarray((np.dstack([np.clip(rgb, 0, 1), al]) * 255).astype(np.uint8), "RGBA")
else:
    amb = amb.filter(ImageFilter.GaussianBlur(85))
stage.alpha_composite(amb)
if LIGHT:
    glow(stage, tv_cx, sy + sh + px(0.12), px(2.9), px(0.14), (30, 30, 60), 0.22, 26)  # floor shadow
else:
    glow(stage, tv_cx, tv_cy, px(4.6), px(2.4), (110, 40, 190), 0.20, 160)

# bezel + screen
bez = 7
d = ImageDraw.Draw(stage)
d.rounded_rectangle([sx - bez, sy - bez, sx + sw + bez, sy + sh + bez], radius=10,
                    fill=(18, 18, 22, 255), outline=(78, 78, 88, 255), width=2)
stage.alpha_composite(screen.convert("RGBA"), (sx, sy))

# glossy floor reflection
ref_h = px(0.34)
ref = screen.transpose(Image.FLIP_TOP_BOTTOM).crop((0, 0, sw, ref_h)).convert("RGBA")
ra = (np.linspace(0.13 if LIGHT else 0.20, 0, ref_h) ** 1.2 * 255).astype(np.uint8)
ref.putalpha(Image.fromarray(np.repeat(ra[:, None], sw, axis=1), "L"))
ref = ref.filter(ImageFilter.GaussianBlur(2))
stage.alpha_composite(ref, (sx, sy + sh + bez + 6))

# ---------- audio products ----------
au = cfg["audio"]
au_src = Image.open(au["image"]).convert("RGB")
bx0, by0, bx1, by1 = content_bbox(au_src)
if au.get("layout") == "flank":
    segs = column_segments(au_src)
    pieces = [au_src.crop((s, by0, e, by1)) for s, e in segs[:2]]
    if len(pieces) == 1:
        pieces = pieces * 2
    h = px(SPK_H)
    placed = []
    for i, piece in enumerate(pieces):
        c = cutout(piece, fade=0.2 if LIGHT else 0.35)
        w = int(c.width * h / c.height)
        c = c.resize((w, h), Image.LANCZOS)
        # speakers stand just outside the TV edges, mirrored
        overlap = -px(0.08)
        x = (sx + sw - overlap) if i == 1 else (sx - w + overlap)
        placed.append((c, x, px(SPK_BOTTOM) - h))
    for c, x, yy in placed:
        if LIGHT:   # soft contact shadow where the speaker meets the floor
            glow(stage, x + c.width // 2, yy + c.height - px(0.04), c.width * 0.55, px(0.07),
                 (30, 30, 60), 0.18, 16)
        else:
            glow(stage, x + c.width // 2, yy + c.height // 2, c.width * 0.75, c.height * 0.55,
                 (190, 180, 230), 0.10, 70)
        stage.alpha_composite(c, (x, yy))
else:  # "front": single product (e.g. soundbar) in front of the TV
    c = cutout(au_src.crop((bx0, by0, bx1, by1)), fade=0.15)
    w = int(sw * 0.72)
    h = int(c.height * w / c.width)
    c = c.resize((w, h), Image.LANCZOS)
    if not LIGHT:
        glow(stage, tv_cx, sy + sh + h // 2, w * 0.6, h, (190, 180, 230), 0.10, 60)
    stage.alpha_composite(c, (tv_cx - w // 2, sy + sh - h // 3))

stage.convert("RGB").save(f"build/stage_{THEME}.jpg", quality=93, subsampling=0)
print(f"wrote build/stage_{THEME}.jpg", stage.size)
