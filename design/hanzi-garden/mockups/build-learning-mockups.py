"""Review layouts mapped to inspected runtime states, never app implementation."""
import json
import runpy
from pathlib import Path

ROOT=Path(__file__).parent
b=runpy.run_path(str(ROOT/'build-mockups.py'))
Page,save=b['Page'],b['save']
INK,MUTED,LINE,IVORY=[b[k] for k in ['INK','MUTED','LINE','IVORY']]
sample=json.loads((ROOT/'runtime-state-samples.json').read_text())
lesson=sample['lesson']
occ={o['ref']:o for o in sample['occurrences']}
reveals=set(sample['revealed'])
RED,GREEN='#B42318','#237443'
STORY_INSTRUCTION='Try reading your new characters inside this passage without help. If you need help, click on a character to show its pinyin. Double underlined characters are unseen characters and have pinyin on by default - you do not need to know them yet.'
CARD_INSTRUCTION='Look at the character, think in your head what you think it is. Then click reveal. Click ’Got it’ if you got it right!'

def nav(p,number=1,revision=False,mobile=False):
    p.rect(0,0,p.width,112 if mobile else 88,'#FFFFFF','none',extra='rounded=0;')
    p.text(24 if mobile else 48,23,120,40,'‹  Lessons',16,bold=True)
    label=f'Lesson {number}  ·  '+('Revision' if revision else '我 的 你 是 了')
    p.text(24 if mobile else 460,72 if mobile else 24,342 if mobile else 520,30,label,
        17 if mobile else 20,bold=True,align='left' if mobile else 'center')
    p.speaker(p.width-64 if mobile else p.width-92,22)

def lane(p,tokens,x,y,maxwidth,context=False):
    """Reserve two rows for every occurrence, even when pinyin is hidden."""
    cursor=x
    units=[]
    for token in tokens:
        if isinstance(token,str) and units:
            units[-1][1]+=token
        else: units.append([token,''])
    for t,punctuation in units:
        if isinstance(t,str):continue
        w=max(46,len(t['pinyin'])*8+12)
        pw=len(punctuation)*18
        if cursor+w+pw>x+maxwidth:
            cursor=x; y+=82
        visible=t.get('showPinyin',False)
        if visible:
            p.text(cursor,y,w,24,t['pinyin'],15,MUTED,align='center')
        p.text(cursor,y+24,w,42,t['hanzi'],32,align='center')
        if not context and t.get('permanent'):
            for offset in (66,69):
                p.rect(cursor+9,y+offset,w-18,1,INK,'none',extra='rounded=0;')
        elif not context and visible:
            p.rect(cursor+9,y+66,w-18,1,INK,'none',extra='rounded=0;')
        elif not context:
            p.cell(cursor+9,y+66,w-18,0,style=f'shape=line;strokeColor={INK};strokeWidth=1;dashed=1;dashPattern=1 3;')
        if punctuation:
            p.text(cursor+w,y+24,pw,42,punctuation,28)
        cursor+=w+pw
    return y+82

def reader(helped=False):
    p=Page('Story - saved reveals' if helped else 'Story - no taught reveals',1440,1040)
    nav(p)
    p.text(196,132,1048,50,'Read the story',36,bold=True)
    p.text(196,200,1048,82,STORY_INSTRUCTION,19,MUTED)
    y=300
    for pi,paragraph in enumerate(lesson['story']['paragraphs']):
        tokens=[]
        for si,sentence in enumerate(paragraph):
            for ti,token in enumerate(sentence):
                if isinstance(token,str):tokens.append(token)
                else:
                    o=occ[f'{pi}:{si}:{ti}']
                    tokens.append(dict(o,showPinyin=o['permanent'] or (helped and o['ref'] in reveals)))
        y=lane(p,tokens,196,y,1048)+18
    if helped:
        p.text(196,884,650,40,'All reveals saved.',16,MUTED)
    p.button(1052,886,192,56,'Finish reading',tip='Finish is unavailable while reveals are pending or saved progress is being checked.')
    return p

def reader_details():
    p=Page('Reader save states - design detail',1440,810)
    p.text(80,56,1280,54,'Reader states and transitions',34,bold=True)
    rows=[('Saving a reveal','1 reveal not yet saved. Saving… Keep this page open.','Finish unavailable'),
          ('Connection interrupted','Retrying automatically. Keep this page open; unsaved reveals may be lost.','Finish unavailable'),
          ('Checking saved progress','Checking saved progress…','Finish unavailable'),
          ('Saving Finish','Saving the end of your reading…','Finish unavailable'),
          ('Attempt/session changed','Reload the lesson to continue. Unsaved reveals may be lost.','Reload lesson')]
    for i,(title,copy,action) in enumerate(rows):
        y=150+i*88
        p.rect(80,y,1280,74)
        p.text(100,y+12,270,48,title,18,bold=True)
        p.text(390,y+12,690,48,copy,16,MUTED)
        p.text(1090,y+12,240,48,action,16,MUTED,align='right')
    p.text(80,622,1280,130,'Finish with no taught reveals → Lesson complete.<br>'
        'Finish with taught reveals → frozen contextual revision deck; not completion.<br>'
        'Recognise that deck → Reread story with taught help hidden; permanent help remains.',21,MUTED)
    return p

def cards(revealed=False,context=False,confirmation=False,done=False):
    title=('Revision' if context else 'Initial')+' cards - '+('deck recognised' if done else 'confirmation' if confirmation else 'revealed' if revealed else 'front')
    p=Page(title,1440,900 if context else 810)
    nav(p)
    if done:
        p.text(380,228,680,64,'Deck recognised',38,bold=True,align='center')
        p.text(380,326,680,88,'Ready to reread.' if context else 'Ready for the story.',21,MUTED,align='center')
        p.button(570,468,300,56,'Reread story' if context else 'Continue to story',
            tip='Save the deck result first. A save error keeps this screen open with Retry; never advance on failure.')
        return p
    p.text(380,118,680,50,'Collected revision' if context else 'Full-deck confirmation' if confirmation else 'Practice round',34,bold=True,align='center')
    p.text(380,180,680,32,'Card 2 of 2 · 0 missed this round' if context else 'Card 2 of 5 · 0 missed this round',17,MUTED,align='center')
    p.text(280,214,880,68,CARD_INSTRUCTION,19,MUTED,align='center')
    p.rect(380 if context else 520,294,680 if context else 400,400 if context else 312)
    character_y=(310 if context else 350) if revealed else (437 if context else 393)
    p.text(520,character_y,400,114,'的',92,align='center')
    if revealed:
        p.text(520,432 if context else 476,400,48,'de · dī · dí · dì',27,align='center')
        if context:
            # Runtime revision card 2: earliest revealed 的; frozen original sentence.
            sentence=sample['revisionCards'][1]['sentence']
            lane(p,sentence,397,506,646,True)
    action_y=730 if context else 642
    if revealed:
        p.button(520,action_y,190,56,'Got it')
        p.button(730,action_y,190,56,'Have not got it',False)
    else:
        p.button(600,action_y,240,56,'Reveal')
    return p

def completion(final=False,celebrate=False):
    p=Page(('Final available lesson' if final else 'Lesson complete')+(' - celebration' if celebrate else ' - settled / reduced motion'))
    nav(p,11 if final else 1,final)
    if celebrate:
        # Neutral UI confetti pose: native editable rectangles, no image artwork.
        for i,(x,y) in enumerate([(92,144),(286,206),(520,124),(812,156),(1088,132),(1330,228),
            (154,336),(344,458),(1140,366),(1296,494),(74,668),(294,732),
            (480,690),(918,704),(1188,746),(1362,632)]):
            p.rect(x,y,7,16,'#B9BBB3' if i%2 else '#777B74','none',extra=f'rounded=0;rotation={i*31%160};')
    p.text(620,208,200,84,'✓',64,align='center')
    p.text(380,306,680,70,'Lesson complete',42,bold=True,align='center')
    p.text(380,390,680,44,'Your completion is saved.',22,MUTED,align='center')
    if final:
        p.text(380,444,680,52,'You reached the end of the available lessons.',19,MUTED,align='center')
        p.button(590,540,260,56,'Back to lessons')
    else:
        p.button(608,510,224,56,'Next lesson')
        p.button(608,586,224,48,'Back to lessons',False)
    return p

def auth(signup=False,mobile=False,state='empty'):
    state_name='filled / ready' if not signup and state=='valid' else state
    p=Page(('Signup' if signup else 'Login')+(' - mobile' if mobile else ' - desktop')+' - '+state_name,
        390 if mobile else 1440,844 if mobile else 900)
    folder='signup-background-v1' if signup else 'login-background-v1'
    uri=b['cover_art'](folder,p.width,p.height,('signup' if signup else 'login')+('-mobile' if mobile else '-desktop'))
    p.image(uri,0,0,p.width,p.height)
    p.nav(mobile)
    x,w=(20,350) if mobile else (460,520)
    y=116 if mobile else 138
    h=650 if signup else 640
    p.rect(x,y,w,h,'#FFFFFF',LINE)
    inset=24 if mobile else 40
    left=x+inset; width=w-2*inset
    p.text(left,y+28,width,52,'Create your account' if signup else 'Welcome back',28 if mobile else 32,bold=True)
    username='' if state=='empty' else 'ga r' if signup and state=='invalid' else 'garden_reader'
    ucolor=RED if signup and state=='invalid' else GREEN if signup and state=='valid' else LINE
    pcolor=RED if state=='invalid' else GREEN if signup and state=='valid' else LINE
    umessage='No spaces.' if signup and state=='invalid' else '✓ Username available' if signup and state=='valid' else ''
    pmessage=('Use at least 8 characters.' if signup else 'Incorrect username or password.') if state=='invalid' else ''
    p.text(left,y+104,width,28,'Username',17,bold=True)
    p.rect(left,y+140,width,48,stroke=ucolor,extra='strokeWidth=1.5;')
    p.text(left+14,y+142,width-28,44,username,17,INK)
    # Empty cells intentionally reserve the same message slots in every state.
    p.text(left,y+196,width,44,umessage,14,RED if state=='invalid' else GREEN)
    p.text(left,y+252,width,28,'Password',17,bold=True)
    p.rect(left,y+288,width,48,stroke=pcolor,extra='strokeWidth=1.5;')
    p.text(left+14,y+290,width-28,44,'' if state=='empty' else '•••••' if signup and state=='invalid' else '••••••••••••',19,INK)
    p.text(left,y+344,width,44,pmessage,14,RED)
    button_y=y+(500 if signup else 412)
    if signup:
        p.text(left,y+412,width,66,'No account recovery. We do not collect email addresses.<br>Keep your username and password safe.',14,MUTED,extra='verticalAlign=top;')
    ready=state=='valid' or (not signup and state=='invalid')
    p.rect(left,button_y,width,52,INK if ready else '#A9ABA5','none',tip='Create account' if ready and signup else 'Log in' if ready else 'Unavailable until required fields are ready')
    p.text(left,button_y,width,52,'Create account' if signup else 'Log in',17,'#FFFFFF',True,'center')
    p.text(left,button_y+70,width,58 if signup else 36,'Already have an account? Log in' if signup else 'New here? Create an account',15,INK,align='center')
    if not signup:
        p.text(left,y+536,width,72,'Contact admin at chloe.chenge.zhu@gmail.com for help.',14,MUTED,align='center')
    return p

def auth_checks(password=False):
    p=Page('Password rule priority - design detail' if password else 'Username validation states - design detail',1440,1000)
    p.text(80,40,1280,64,'Password: one message at a time' if password else 'Username: fixed message space',36,bold=True)
    specs=([
        ('Too short','•••••','Use at least 8 characters.',RED),
        ('Missing uppercase','••••••••••••','Add an uppercase letter.',RED),
        ('Missing lowercase','••••••••••••','Add a lowercase letter.',RED),
        ('Missing number','••••••••••••','Add a number.',RED),
        ('Missing symbol','••••••••••••','Add a symbol.',RED),
        ('Valid password','••••••••••••','',GREEN),
    ] if password else [
        ('Empty / untouched','','',LINE),
        ('Invalid format','ga r','No spaces.',RED),
        ('Checking','garden_reader','Checking availability…',LINE),
        ('Confirmed available','garden_reader','✓ Username available',GREEN),
        ('Taken / final submit conflict','Garden_Reader','Username taken',RED),
        ('Check failed','garden_reader','Could not check. Try again.',LINE),
    ])
    for i,(title,value,hint,color) in enumerate(specs):
        x=80+(i%2)*660;y=144+(i//2)*230
        p.text(x,y,580,34,title,22,bold=True)
        p.rect(x,y+52,580,52,stroke=color,extra='strokeWidth=1.5;')
        p.text(x+16,y+54,548,48,value,18)
        p.text(x,y+120,580,48,hint,17,RED if color==RED or title=='Check failed' else GREEN if color==GREEN else MUTED)
    return p

save('story-reader.drawio',[reader(),reader(True)])
save('reader-state-details.drawio',[reader_details()])
save('initial-flashcards.drawio',[cards(),cards(True),cards(False,False,True),cards(done=True)])
save('contextual-revision.drawio',[cards(context=True),cards(True,True),cards(context=True,done=True)])
save('lesson-completion.drawio',[completion(False,True),completion(),completion(True,True),completion(True)])
save('login-signup.drawio',[auth(),auth(True),auth(False,True),auth(True,True),
    auth(True,state='invalid'),auth(True,state='valid'),auth(state='invalid'),auth(state='valid'),
    auth(True,True,'invalid'),auth(True,True,'valid'),auth(False,True,'invalid'),auth(False,True,'valid')])
save('signup-validation.drawio',[auth_checks(),auth_checks(True)])
