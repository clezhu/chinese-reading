"""Reproducible web derivatives of cc48c0f's approved artwork (Pillow).

No source artwork is modified or regenerated. Run from any working directory.
The home uses one shared 16:9 coordinate system, including transparent overlays,
so cover cropping never independently distorts or misaligns the plates.
"""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[2]
ART = Path(__file__).resolve().parent / "artwork"
OUT = ROOT / "public/art"
OUT.mkdir(parents=True, exist_ok=True)
SIZE = (1600, 900)

def source(folder):
    return Image.open(next((ART / folder).glob("image_*.png"))).convert("RGBA")

def save(image, name):
    image.save(OUT / f"{name}.webp", quality=88, method=6)

# Background keeps its original panoramic aspect. Overlays are uniformly scaled
# to this same canvas, rather than independently cover-fitted in the browser.
save(ImageOps.fit(source("home-background-v1").convert("RGB"), SIZE), "home-backdrop")
for folder, name in [("home-temple-midground-v1", "home-temple"),
                     ("home-foreground-blossoms-v1", "home-blossoms")]:
    image = source(folder)
    # The 3:2 generator canvas includes extra sky/water; crop those, not geometry.
    image = ImageOps.fit(image, SIZE, centering=(0.5, 0.48))
    # Suppress the low-alpha extraction matte while preserving painterly edges.
    alpha = image.getchannel("A").point(lambda a: round(255 * (a / 255) ** 1.18))
    image.putalpha(alpha)
    save(image, name)

fog = ImageOps.fit(source("home-fog-v1"), SIZE)
# Fade the texture at its image boundary. With 5% overscan plus <=2% travel,
# no edge can enter the viewport; alternating motion has no loop-jump seam.
alpha = fog.getchannel("A")
pixels = alpha.load()
for y in range(SIZE[1]):
    for x in range(SIZE[0]):
        fade = min(1, x / 100, (SIZE[0] - 1 - x) / 100, y / 70, (SIZE[1] - 1 - y) / 70)
        pixels[x, y] = round(pixels[x, y] * max(0, fade))
fog.putalpha(alpha)
save(fog, "home-fog")
for folder, name in [("login-background-v1", "login"), ("signup-background-v1", "signup"),
                     ("lesson-list-background-v1", "lessons")]:
    save(ImageOps.fit(source(folder).convert("RGB"), SIZE), name)
for size in (16, 32):
    (OUT / f"favicon-{size}.png").write_bytes((ART / f"review/favicon-{size}.png").read_bytes())
print(f"Web assets: {sum(p.stat().st_size for p in OUT.iterdir()):,} bytes")
