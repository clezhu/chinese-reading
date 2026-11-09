"""Review-only processing of generated artwork; generates no substitute artwork.

Uses existing Pillow installation. No application integration or dependencies.
"""
from pathlib import Path
import json
from PIL import Image, ImageDraw, ImageOps

ROOT = Path(__file__).parent
OUT = ROOT / 'review'
OUT.mkdir(exist_ok=True)

def source(name):
    return next((ROOT / name).glob('*.png'))

audit = {}
for p in sorted(ROOT.glob('*-v1/*.png')):
    im = Image.open(p)
    entry = {'file': str(p.relative_to(ROOT)), 'size': list(im.size), 'mode': im.mode}
    if 'A' in im.getbands():
        a = im.getchannel('A')
        hist = a.histogram()
        entry.update(alpha_range=list(a.getextrema()), transparent_pixels=hist[0],
                     partial_alpha_pixels=sum(hist[1:255]), opaque_pixels=hist[255])
    audit[p.parent.name] = entry
(OUT / 'alpha-audit.json').write_text(json.dumps(audit, indent=2) + '\n')

# Crop background to overlay canvas for a candid assembly test, not a master.
canvas = ImageOps.fit(Image.open(source('home-background-v1')).convert('RGBA'),
                      (1536, 1024), method=Image.Resampling.LANCZOS)
canvas.convert('RGB').save(OUT / 'home-background-normalized.png')
for name in ['home-fog-v1', 'home-temple-midground-v1', 'home-foreground-blossoms-v1']:
    canvas = Image.alpha_composite(canvas, Image.open(source(name)).convert('RGBA'))
canvas.convert('RGB').save(OUT / 'home-layer-composite-draft.png')

# Keep the generated flower silhouette and alpha; normalize RGB to ONE ink.
icon = Image.open(source('favicon-source-v1')).convert('RGBA')
alpha = icon.getchannel('A').point(lambda a: 255 if a >= 250 else a)
solid = Image.new('RGBA', icon.size, '#30343A')
solid.putalpha(alpha)
solid.save(OUT / 'favicon-one-ink.png')
for size in (16, 32):
    small = solid.resize((size, size), Image.Resampling.LANCZOS)
    # Reapply one ink after resampling; antialiasing is alpha only.
    ink = Image.new('RGBA', (size, size), '#30343A')
    ink.putalpha(small.getchannel('A'))
    ink.save(OUT / f'favicon-{size}.png')

tiles = [
    ('Original concept — flattened', source('home-concept-v1')),
    ('Layer assembly — NOT production-ready', OUT / 'home-layer-composite-draft.png'),
    ('Login — static / central form space', source('login-background-v1')),
    ('Signup — fog scene / central form space', source('signup-background-v1')),
    ('Lesson LIST only — static', source('lesson-list-background-v1')),
    ('Background plate — opaque', source('home-background-v1')),
    ('Temple overlay — real alpha', source('home-temple-midground-v1')),
    ('Blossom overlay — real alpha', source('home-foreground-blossoms-v1')),
    ('Fog overlay — real alpha', source('home-fog-v1')),
]
sheet = Image.new('RGB', (1440, 1110), '#F5F5F2')
draw = ImageDraw.Draw(sheet)
draw.text((24, 16), 'Hanzi Garden', fill='#30343A', font_size=26)
draw.text((24, 52), 'REVIEW ONLY | Original generated artwork | Neutral UI only | Reader screens: NO scenery', fill='#555555', font_size=17)
for i, (label, path) in enumerate(tiles):
    x, y = 24 + (i % 3) * 472, 100 + (i // 3) * 288
    im = Image.open(path).convert('RGBA')
    im.thumbnail((448, 252), Image.Resampling.LANCZOS)
    # Solid grey is a preview matte only, never baked into source overlays.
    matte = Image.new('RGBA', (448, 252), '#E4E5E3')
    matte.alpha_composite(im, ((448-im.width)//2, (252-im.height)//2))
    sheet.paste(matte.convert('RGB'), (x, y))
    draw.text((x, y + 258), label.replace('—', '-'), fill='#30343A', font_size=16)
draw.text((24, 992), 'Standalone favicon: ONE charcoal ink; actual sizes at right (16 / 32 px)', fill='#30343A', font_size=18)
for size, x in ((16, 760), (32, 820)):
    im = Image.open(OUT / f'favicon-{size}.png')
    sheet.paste(im, (x, 989), im)
draw.text((24, 1040), 'Approval drafts. Layer positions / edge halos / responsive crops need refinement before implementation.', fill='#555555', font_size=16)
sheet.save(OUT / 'contact-sheet.png')
