"""Contact sheets of draw.io exports only; no artwork generation."""
from pathlib import Path
from PIL import Image, ImageDraw, PngImagePlugin
PngImagePlugin.MAX_TEXT_CHUNK=64*1024*1024
ROOT=Path(__file__).parent

def sheet(filename,title,items):
    out=Image.new('RGB',(1600,120+((len(items)+1)//2)*498),'#EAEAE5')
    d=ImageDraw.Draw(out)
    d.text((32,22),f'Hanzi Garden | {title}',fill='#30343A',font_size=28)
    d.text((32,65),'REVIEW ONLY - editable layouts - neutral UI; red/green validation exception - no runtime changes',fill='#666863',font_size=17)
    for i,(name,label) in enumerate(items):
        x,y=32+(i%2)*784,110+(i//2)*498
        im=Image.open(ROOT/f'{name}.drawio.png').convert('RGB')
        im.thumbnail((752,450),Image.Resampling.LANCZOS)
        out.paste(im,(x+(752-im.width)//2,y))
        d.text((x,y+456),label,fill='#30343A',font_size=18)
    out.save(ROOT/filename)

sheet('learning-contact-sheet.png','Reader, cards and completion',[
    ('story-no-reveals','Story / no taught reveals'),('story-saved-reveals','Story / two saved taught reveals'),
    ('initial-front','Initial flashcard / front'),('initial-revealed','Initial flashcard / revealed'),
    ('revision-front','Contextual revision / front'),('revision-revealed','Contextual revision / frozen sentence back'),
    ('completion-celebration','Success / brief confetti pose'),('completion-settled','Success / settled or reduced motion'),
])
sheet('flow-contact-sheet.png','Flow variants and final lesson',[
    ('initial-confirmation','Full-deck confirmation'),('initial-deck-recognised','Initial deck passed / save before story'),
    ('revision-deck-recognised','Revision deck passed / save before reread'),('reader-state-details','Save/retry/finish states / design detail'),
    ('completion-final-celebration','Final available lesson / brief celebration'),('completion-final-settled','Final available lesson / settled or reduced motion'),
])
sheet('auth-contact-sheet.png','Desktop auth states',[
    ('login-desktop','Login / empty, untouched'),('signup-desktop','Signup / empty, untouched'),
    ('login-invalid-desktop','Login / credential error'),('signup-invalid-desktop','Signup / one error per field'),
    ('login-ready-desktop','Login / filled, credentials not yet verified'),('signup-valid-desktop','Signup / username available + password valid'),
])
sheet('auth-mobile-contact-sheet.png','Mobile auth states',[
    ('login-mobile','Login / empty, untouched'),('signup-mobile','Signup / empty, untouched'),
    ('login-invalid-mobile','Login / credential error'),('signup-invalid-mobile','Signup / one error per field'),
    ('login-ready-mobile','Login / filled, credentials not yet verified'),('signup-valid-mobile','Signup / username available + password valid'),
])
sheet('auth-validation-contact-sheet.png','Fixed-space validation details',[
    ('signup-validation','Username / untouched, checking, available, taken, error'),
    ('password-validation','Password / highest-priority rule only, no success text'),
])
