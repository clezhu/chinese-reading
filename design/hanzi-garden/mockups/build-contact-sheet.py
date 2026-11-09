"""Assemble review previews exported from the native draw.io files."""
from pathlib import Path
from PIL import Image, ImageDraw, PngImagePlugin

# Trusted local draw.io exports embed the full base64 artwork in XML metadata.
PngImagePlugin.MAX_TEXT_CHUNK = 64 * 1024 * 1024

ROOT = Path(__file__).parent
sheet = Image.new('RGB', (1600, 1580), '#EAEAE5')
draw = ImageDraw.Draw(sheet)
draw.text((32, 22), 'Hanzi Garden | Screen mockups v3', fill='#30343A', font_size=28)
draw.text((32, 62), 'REVIEW ONLY - approved artwork unchanged - neutral UI - no runtime implementation', fill='#666863', font_size=17)
for i, (stem, label) in enumerate([
    ('homepage', '01  Homepage / desktop'),
    ('lessons', '02  Lessons / returning learner'),
    ('character-introduction', '03  Introduction / lesson 1'),
    ('lesson-state-details', '04  State details / not an extra app screen'),
]):
    x, y = 32+(i%2)*784, 110+(i//2)*458
    im = Image.open(ROOT/f'{stem}.drawio.png').convert('RGB')
    im.thumbnail((752,424),Image.Resampling.LANCZOS)
    sheet.paste(im,(x,y))
    draw.text((x,y+430),label,fill='#30343A',font_size=18)
draw.text((32,1042),'Small-screen checks (390 px wide; long layouts scroll)',fill='#30343A',font_size=21)
for i in range(1,4):
    im=Image.open(ROOT/f'small-screen-{i}.drawio.png').convert('RGB')
    im.thumbnail((200,300),Image.Resampling.LANCZOS)
    sheet.paste(im,(32+(i-1)*245,1090))
for i, stem in enumerate(['lesson-scroll-initial','lesson-scroll-later']):
    im=Image.open(ROOT/f'{stem}.drawio.png').convert('RGB')
    im.thumbnail((140,300),Image.Resampling.LANCZOS)
    sheet.paste(im,(820+i*180,1090))
draw.text((820,1400),'Same fixed backdrop; content scrolls',fill='#30343A',font_size=18)
im=Image.open(ROOT/'sound-icon-states.drawio.png').convert('RGB')
im.thumbnail((450,156),Image.Resampling.LANCZOS)
sheet.paste(im,(1140,1090))
draw.text((32,1500),'Editable .drawio sources + embedded-XML PNG previews | See NOTES.md for accessibility and fixed-background intent.',fill='#666863',font_size=17)
sheet.save(ROOT/'contact-sheet.png')
