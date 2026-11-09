"""Review-only native draw.io layouts; embeds existing art without modifying it."""
from pathlib import Path
import base64
import json
import re
import xml.etree.ElementTree as ET
import zlib
from urllib.parse import quote
from PIL import Image, ImageOps

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[2]
ART = HERE.parent / 'artwork'
INK, MUTED, LINE, IVORY = '#30343A', '#666863', '#DDDDD6', '#F8F8F4'

# Read only introduction arrays, never story tokens or frequency data.
lessons = []
for name in ['curriculum.ts', 'extended-fundamentals.ts']:
    source = (REPO / 'app/content' / name).read_text()
    for match in re.finditer(r'newCharacters:\s*\[(.*?)\n\s*\],', source, re.S):
        chars = re.findall(r'hanzi:\s*"([^"]+)".*?pinyin:\s*\[([^\]]+)\]', match[1])
        if chars:
            lessons.append([{'hanzi': char, 'pinyin': re.findall(r'"([^"]+)"', readings)}
                            for char, readings in chars])
assert len(lessons) == 10 and all(len(c) == 5 for c in lessons)
assert 'kind: "revision"' in (REPO / 'app/content/extended-fundamentals.ts').read_text()
lessons.append([])
(HERE / 'curriculum-snapshot.json').write_text(json.dumps(lessons, ensure_ascii=False, indent=2)+'\n')

def image_uri(folder):
    p = next((ART / folder).glob('*.png'))
    return 'data:image/png,' + base64.b64encode(p.read_bytes()).decode()

HOME_ART = image_uri('home-concept-v1')
LIST_ART = image_uri('lesson-list-background-v1')

def cover_art(folder, width, height, name, centering=(0.5, 0.5)):
    """Background-size: cover equivalent; crop/resample only, no repainting."""
    original = next((ART / folder).glob('*.png'))
    target = HERE / 'background-crops' / f'{name}.png'
    target.parent.mkdir(exist_ok=True)
    ImageOps.fit(Image.open(original), (width, height),
        method=Image.Resampling.LANCZOS, centering=centering).save(target)
    return 'data:image/png,' + base64.b64encode(target.read_bytes()).decode()

MOBILE_HOME = cover_art('home-concept-v1',390,844,'home-mobile-cover',(0.76,0.5))
DESKTOP_LIST = cover_art('lesson-list-background-v1',1440,730,'lessons-desktop-cover',(0.5,0))
MOBILE_LIST_LONG = cover_art('lesson-list-background-v1',390,1424,'lessons-mobile-long-cover',(1,0))
MOBILE_LIST_VIEW = cover_art('lesson-list-background-v1',390,768,'lessons-mobile-viewport-cover',(1,0))

class Page:
    def __init__(self, name, width=1440, height=810):
        self.name, self.width, self.height = name, width, height
        self.model = ET.Element('mxGraphModel', dx=str(width), dy=str(height), grid='0',
            page='1', pageScale='1', pageWidth=str(width), pageHeight=str(height),
            background=IVORY, adaptiveColors='none', tooltips='1')
        self.root = ET.SubElement(self.model, 'root')
        ET.SubElement(self.root, 'mxCell', id='0')
        ET.SubElement(self.root, 'mxCell', id='1', parent='0')
        self.n = 1
        self.rect(0, 0, width, height, IVORY, 'none')

    def cell(self, x, y, w, h, text='', style='', parent='1', tip=None):
        self.n += 1
        attrs = dict(id=str(self.n), value=text, style='html=1;'+style, vertex='1', parent=parent)
        if tip:
            attrs['tooltip'] = tip
        c = ET.SubElement(self.root, 'mxCell', attrs)
        ET.SubElement(c, 'mxGeometry', x=str(x), y=str(y), width=str(w), height=str(h), attrib={'as':'geometry'})
        return str(self.n)

    def rect(self, x,y,w,h,fill='#FFFFFF',stroke=LINE,extra='',parent='1',tip=None):
        return self.cell(x,y,w,h,style=f'rounded=1;arcSize=10;fillColor={fill};strokeColor={stroke};'+extra,parent=parent,tip=tip)

    def text(self,x,y,w,h,text,size=18,color=INK,bold=False,align='left',parent='1',extra=''):
        return self.cell(x,y,w,h,text, f'text;fillColor=none;strokeColor=none;whiteSpace=wrap;overflow=hidden;'
            f'fontFamily=Helvetica;fontSize={size};fontColor={color};fontStyle={int(bold)};'
            f'align={align};verticalAlign=middle;spacing=0;'+extra,parent)

    def button(self,x,y,w,h,text,primary=True,tip=None,pill=False):
        self.rect(x,y,w,h,INK if primary else '#FFFFFF','none' if primary else LINE,
            extra='arcSize=100;' if pill else '',tip=tip)
        self.text(x,y,w,h,text,17,'#FFFFFF' if primary else INK,True,'center')

    def speaker(self,x,y,muted=False):
        self.rect(x,y,44,44,'#FFFFFF',LINE,tip='Unmute sound' if muted else 'Mute sound')
        # Native editable draw.io stencil, not generated decorative artwork.
        stencil=ET.Element('shape',name='speaker-muted' if muted else 'speaker-on',w='24',h='24',aspect='fixed',strokewidth='inherit')
        ET.SubElement(stencil,'connections')
        fg=ET.SubElement(stencil,'foreground')
        ET.SubElement(fg,'strokecolor',color=INK)
        ET.SubElement(fg,'fillcolor',color=INK)
        ET.SubElement(fg,'strokewidth',width='1.8')
        path=ET.SubElement(fg,'path')
        for tag,attrs in [('move',{'x':'3','y':'9'}),('line',{'x':'7','y':'9'}),
            ('line',{'x':'12','y':'5'}),('line',{'x':'12','y':'19'}),
            ('line',{'x':'7','y':'15'}),('line',{'x':'3','y':'15'}),('close',{})]:
            ET.SubElement(path,tag,attrs)
        ET.SubElement(fg,'fillstroke')
        path=ET.SubElement(fg,'path')
        if muted:
            for tag,attrs in [('move',{'x':'16','y':'9'}),('line',{'x':'22','y':'15'}),
                             ('move',{'x':'22','y':'9'}),('line',{'x':'16','y':'15'})]:
                ET.SubElement(path,tag,attrs)
        else:
            ET.SubElement(path,'move',x='16',y='8')
            ET.SubElement(path,'curve',x1='19',y1='10',x2='19',y2='14',x3='16',y3='16')
            ET.SubElement(path,'move',x='19',y='5')
            ET.SubElement(path,'curve',x1='24',y1='9',x2='24',y2='15',x3='19',y3='19')
        ET.SubElement(fg,'stroke')
        raw=quote(ET.tostring(stencil,encoding='unicode'),safe="~()*!.'-").encode()
        compressor=zlib.compressobj(wbits=-15)
        encoded=base64.b64encode(compressor.compress(raw)+compressor.flush()).decode()
        self.cell(x+10,y+10,24,24,style=f'shape=stencil({encoded});strokeColor={INK};fillColor={INK};',
            tip='Unmute sound' if muted else 'Mute sound')

    def image(self,uri,x,y,w,h):
        self.cell(x,y,w,h,style=f'shape=image;imageAspect=0;aspect=fixed;image={uri};')

    def nav(self,mobile=False):
        w=self.width
        self.rect(0,0,w,80 if not mobile else 76,'#FFFFFF','none',extra='rounded=0;')
        self.text(48 if not mobile else 20,18,280 if not mobile else 185,44,'Hanzi Garden',28 if not mobile else 23,bold=True)

def chars_label(index):
    return ' '.join(c['hanzi'] for c in lessons[index]) if lessons[index] else 'Revision'

def home(mobile=False):
    p=Page('Home - small screen' if mobile else 'Home - desktop',390 if mobile else 1440,844 if mobile else 810)
    if mobile:
        p.image(MOBILE_HOME,0,0,390,844)
        p.nav(True)
        p.text(300,23,64,32,'Login',15,align='center')
        p.text(24,138,342,112,'Learn to read<br>Chinese for free!',36,bold=True)
        p.button(24,284,190,52,'Get Started',tip='Requires signup; no guest access.')
    else:
        p.image(HOME_ART,0,0,1440,810)
        p.nav()
        p.text(1110,23,90,34,'Login',17,align='center')
        p.button(1220,18,164,44,'Sign up',pill=True)
        p.text(810,276,580,144,'Learn to read<br>Chinese for free!',50,bold=True)
        p.button(812,456,210,56,'Get Started',tip='Opens signup. No guest lesson access.')
    return p

def tile(p,x,y,index,width=180,height=180,state='locked',hint=None):
    number=index+1
    group=p.cell(x,y,width,height,style='group;pointerEvents=0;')
    tip=('Locked until previous lesson is completed.' if state=='locked' else
         'One tile click starts or resumes. Completed tile restarts practice unless an active revisit exists; then resumes it. Completion check never resets.')
    p.rect(0,0,width,height,'#FFFFFF' if state!='locked' else '#F6F6F2',INK if hint else LINE,
        extra='strokeWidth=2;' if hint else '',parent=group,tip=tip)
    p.text(20,18,width-40,72,str(number),60,INK if state!='locked' else '#777A74',False,'left',group)
    if state=='complete':
        p.text(width-44,14,26,30,'✓',24,INK,True,'center',group)
    label=hint or ('Completed' if state=='complete' else 'Locked' if state=='locked' else 'Ready')
    p.text(20,99,width-40,26,label,14,INK if hint else MUTED,bool(hint),'left',group)
    p.rect(1,height-43,width-2,42,'#EEEEE8','none',extra='rounded=0;',parent=group)
    p.text(10,height-40,width-20,34,chars_label(index),21,INK,False,'center',group)

def grid(mobile=False):
    p=Page('Lessons - small screen (scroll)' if mobile else 'Lessons - returning learner',390 if mobile else 1440,1500 if mobile else 810)
    if not mobile:
        p.image(DESKTOP_LIST,0,80,1440,730)
    else:
        p.image(MOBILE_LIST_LONG,0,76,390,1424)
    p.nav(mobile)
    p.text(286 if mobile else 1260,24,80,32,'Account',14 if mobile else 16,align='right')
    p.text(24 if mobile else 130,112 if mobile else 122,340 if mobile else 1180,64,'Lessons',40 if mobile else 48,bold=True)
    p.text(24 if mobile else 130,190 if mobile else 208,342 if mobile else 1180,40,'Module 1: Fundamentals',24 if mobile else 26,bold=True)
    p.text(24 if mobile else 130,240 if mobile else 252,342 if mobile else 1180,30,'2 of 11 lessons completed',16,MUTED)
    for i in range(11):
        cols=2 if mobile else 6
        x=(24 if mobile else 130)+(i%cols)*(178 if mobile else 200)
        y=(294 if mobile else 310)+(i//cols)*(194 if mobile else 202)
        tile(p,x,y,i,164 if mobile else 180,180,
            'complete' if i<2 else 'active' if i==2 else 'locked','Continue here' if i==2 else None)
    return p

INSTRUCTION=('Look at these characters and their pinyin. Some characters have more than one pronunciation. '
             'Try to remember them—but it is OK if you cannot yet.')

def intro(mobile=False):
    p=Page('Introduction - small screen (scroll)' if mobile else 'Introduction - lesson 1',390 if mobile else 1440,1130 if mobile else 810)
    p.rect(0,0,p.width,112 if mobile else 88,'#FFFFFF','none',extra='rounded=0;')
    p.text(20 if mobile else 48,19 if mobile else 23,100,40,'‹  Lessons',16,bold=True)
    p.text(24 if mobile else 460,70 if mobile else 24,342 if mobile else 520,30,
        'Lesson 1  ·  '+chars_label(0),17 if mobile else 20,bold=True,align='left' if mobile else 'center')
    p.speaker(326 if mobile else 1348,20 if mobile else 22)
    p.text(24 if mobile else 196,144 if mobile else 148,342 if mobile else 1048,50,'Meet your new characters',28 if mobile else 36,bold=True)
    p.text(24 if mobile else 196,212 if mobile else 214,342 if mobile else 1000,144 if mobile else 88,
        INSTRUCTION,18 if mobile else 20,MUTED,extra='verticalAlign=top;')
    for i,c in enumerate(lessons[0]):
        x=24+(i%2)*178 if mobile else 196+i*214
        y=390+(i//2)*192 if mobile else 346
        w,h=(164,174) if mobile else (192,248)
        p.rect(x,y,w,h)
        p.text(x+12,y+12,w-24,80 if mobile else 116,c['hanzi'],58 if mobile else 76,align='center')
        readings=c['pinyin']
        if len(readings)==4:
            text=' · '.join(readings[:2])+'<br>'+' · '.join(readings[2:])
        else:
            text=' · '.join(readings)
        p.text(x+12,y+(90 if mobile else 144),w-24,70,text,21 if mobile else 23,align='center')
    p.button(24 if mobile else 1052,1014 if mobile else 654,342 if mobile else 192,56,'Continue',tip='Existing introduction Continue action, unchanged learning mechanics.')
    return p

def scroll_state(later=False):
    p=Page('Lessons - scrolled viewport' if later else 'Lessons - initial viewport',390,844)
    p.image(MOBILE_LIST_VIEW,0,76,390,768)
    # Tile positions differ; background frame/pixels and white header do not.
    if later:
        for i in range(4,11):
            tile(p,24+((i-4)%2)*178,88+((i-4)//2)*186,i,164,180,'locked')
    else:
        p.text(24,112,340,64,'Lessons',40,bold=True)
        p.text(24,190,342,40,'Module 1: Fundamentals',24,bold=True)
        p.text(24,240,342,30,'2 of 11 lessons completed',16,MUTED)
        for i in range(4):
            tile(p,24+(i%2)*178,294+(i//2)*194,i,164,180,
                'complete' if i<2 else 'active' if i==2 else 'locked','Continue here' if i==2 else None)
    p.nav(True)
    p.text(286,24,80,32,'Account',14,align='right')
    return p

def sound_states():
    p=Page('Sound icon states - review detail',520,180)
    p.text(24,16,472,32,'Same toggle, two states',22,bold=True)
    p.speaker(24,70)
    p.text(82,70,160,44,'On → Mute sound',15)
    p.speaker(266,70,muted=True)
    p.text(324,70,180,44,'Off → Unmute sound',15)
    return p

def states():
    p=Page('State details - not an extra app screen',1440,810)
    p.text(56,40,1328,54,'Lesson tile state rules',34,bold=True)
    p.text(56,104,1328,54,'One tile = one action. Checkmarks record permanent completion, not current practice state.',19,MUTED)
    tile(p,56,210,0,state='active',hint='Start here')
    p.text(56,414,260,100,'Brand-new learner<br>Lesson 1 starts; later lessons locked.',17,MUTED,extra='verticalAlign=top;')
    tile(p,386,210,0,state='complete',hint='Continue here')
    p.text(386,414,290,130,'Active revisit<br>Resume this completed lesson first.<br>Tick and later access remain.',17,MUTED,extra='verticalAlign=top;')
    tile(p,716,210,9,state='locked')
    p.text(716,414,260,90,'Two digits<br>Same 60 px numeral size.',17,MUTED,extra='verticalAlign=top;')
    # A sizing specimen only: not a fictitious runtime lesson.
    p.rect(1046,210,180,180)
    p.text(1066,228,140,72,'100',60)
    p.text(1066,309,140,26,'Sizing only',14,MUTED)
    p.rect(1047,347,178,42,'#EEEEE8','none',extra='rounded=0;')
    p.text(1046,414,300,110,'Three digits<br>Same font and number region.<br>Not a curriculum lesson.',17,MUTED,extra='verticalAlign=top;')
    p.text(56,602,1300,130,'Priority: active revisit → next unfinished lesson. Without progress, show Start here.<br>'
        'Completed tile: restart practice; if its revisit is active, resume. Never remove its tick.<br>'
        'Locked tile: no lesson access. No secondary play/restart button. No popup tour.',20,MUTED,extra='verticalAlign=top;')
    return p

def save(name,pages):
    file=ET.Element('mxfile',host='app.diagrams.net',type='device',version='29.0.0')
    for i,p in enumerate(pages):
        d=ET.SubElement(file,'diagram',id=f'page-{i+1}',name=p.name)
        d.append(p.model)
    ET.indent(file)
    path=HERE/name
    ET.ElementTree(file).write(path,encoding='utf-8',xml_declaration=True)
    ET.parse(path)

save('homepage.drawio',[home()])
save('lessons.drawio',[grid()])
save('character-introduction.drawio',[intro()])
save('small-screen-checks.drawio',[home(True),grid(True),intro(True)])
save('lesson-state-details.drawio',[states()])
save('lesson-scroll-check.drawio',[scroll_state(),scroll_state(True)])
save('sound-icon-states.drawio',[sound_states()])
