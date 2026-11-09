"""Export local review diagrams with already-installed draw.io Desktop."""
from pathlib import Path
import subprocess
ROOT=Path(__file__).parent
CLI='/Applications/draw.io.app/Contents/MacOS/draw.io'
PLAN={
 'homepage':['homepage'], 'lessons':['lessons'], 'character-introduction':['character-introduction'],
 'small-screen-checks':['small-screen-1','small-screen-2','small-screen-3'],
 'lesson-state-details':['lesson-state-details'],
 'lesson-scroll-check':['lesson-scroll-initial','lesson-scroll-later'],
 'sound-icon-states':['sound-icon-states'],
 'story-reader':['story-no-reveals','story-saved-reveals'],
 'reader-state-details':['reader-state-details'],
 'initial-flashcards':['initial-front','initial-revealed','initial-confirmation','initial-deck-recognised'],
 'contextual-revision':['revision-front','revision-revealed','revision-deck-recognised'],
 'lesson-completion':['completion-celebration','completion-settled','completion-final-celebration','completion-final-settled'],
 'login-signup':['login-desktop','signup-desktop','login-mobile','signup-mobile',
     'signup-invalid-desktop','signup-valid-desktop','login-invalid-desktop','login-ready-desktop',
     'signup-invalid-mobile','signup-valid-mobile','login-invalid-mobile','login-ready-mobile'],
 'signup-validation':['signup-validation','password-validation'],
}
if __name__=='__main__':
    for source,names in PLAN.items():
        for page,name in enumerate(names,1):
            subprocess.run([CLI,'-x','-f','png','-e','-p',str(page),'-o',str(ROOT/f'{name}.drawio.png'),
                str(ROOT/f'{source}.drawio')],check=True)
