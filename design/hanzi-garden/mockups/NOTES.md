# Hanzi Garden — screen mockups v3

**Review only.** Approved soft painterly artwork reused as-is: no regeneration, sharpening, style change or artwork-source edits. UI is neutral ivory/white/grey/charcoal, with dark primary buttons; red/green field validation is the user's explicit exception. Wordmark is text-only **Hanzi Garden**.

## Files

| Screen | Editable layout | Viewable preview |
| --- | --- | --- |
| Homepage | [homepage.drawio](homepage.drawio) | [PNG](homepage.drawio.png) |
| Lesson grid | [lessons.drawio](lessons.drawio) | [PNG](lessons.drawio.png) |
| Character introduction | [character-introduction.drawio](character-introduction.drawio) | [PNG](character-introduction.drawio.png) |
| Small-screen checks, three pages | [small-screen-checks.drawio](small-screen-checks.drawio) | [Home](small-screen-1.drawio.png), [Lessons](small-screen-2.drawio.png), [Introduction](small-screen-3.drawio.png) |
| Supplemental state details | [lesson-state-details.drawio](lesson-state-details.drawio) | [PNG](lesson-state-details.drawio.png) |
| Fixed-background scroll check, two viewports | [lesson-scroll-check.drawio](lesson-scroll-check.drawio) | [Initial](lesson-scroll-initial.drawio.png), [Scrolled](lesson-scroll-later.drawio.png) |
| Speaker/muted toggle detail | [sound-icon-states.drawio](sound-icon-states.drawio) | [PNG](sound-icon-states.drawio.png) |

[Contact sheet](contact-sheet.png). Desktop designs: 1440×810. Small-screen design width: 390; lessons/introduction are full scrollable-content studies, not claims that everything fits one phone viewport. Export adds a thin outer border. All PNG screen exports embed their source diagram XML and can also be opened in draw.io; `.drawio` files are retained explicitly for convenient editing. Contact sheet is a plain raster overview, not an editable layout.

**Remaining screens:** [Learning/auth manifest, runtime mapping and assumptions](LEARNING-AND-AUTH.md); [learning previews](learning-contact-sheet.png), [flow/final-lesson previews](flow-contact-sheet.png), [desktop auth](auth-contact-sheet.png), [mobile auth](auth-mobile-contact-sheet.png), [validation details](auth-validation-contact-sheet.png). All remain review-only; tickets wait for approval of the complete set.

## Sources and sample state

- Home uses `../artwork/home-concept-v1/image_1794205633226_1536-1024.png` as an embedded raster backdrop. It is the original approved, flattened scene, retaining its visual mountain/temple/blossom/fog depth. No new layer assembly or movement is introduced in this static mockup; the previously documented layer limitations still apply.
- Lessons use `../artwork/lesson-list-background-v1/image_1794205709746_1536-1024.png`, static and pale. Artwork and editable native UI shapes/text are separate cells. Embedded art makes source layouts self-contained.
- `background-crops/` contains cover-cropped/resampled derivatives only, not regenerated or sharpened artwork. Home mobile fills its entire 390×844 canvas; the white header overlays it. The list background starts below the white header, never behind it. Top-aligned desktop cropping preserves the top-right blossoms instead of hiding them under the header; mobile uses a right-aligned cover crop. Aspect ratio is preserved, without containment, stretching or letterboxing.
- Character data is read from `app/content/curriculum.ts` and its runtime import `app/content/extended-fundamentals.ts`; no frequency data is used. [Read-only snapshot](curriculum-snapshot.json) captures ten groups of five and an empty revision group. First ten tile strips use those exact groups; tile 11 says **Revision**.
- Main lesson-grid example: lessons 1 and 2 completed, lesson 3 current, lessons 4–11 locked. One **Continue here** hint sits inside the current tile, not a separate competing button. Sample state is illustrative, not user account data.
- Supplemental states show **Start here** for a brand-new learner and a completed lesson 1 with a permanent tick **and** **Continue here** for an active revisit. A **100** specimen is only a sizing test, not a fictitious lesson in the curriculum. Numbers 1/10/100 all use 60px type and the same number-region width, with no auto-shrinking. Mobile keeps 60px numerals too.
- Intro deliberately shows lesson 1, independent of the returning-learner lesson-3 grid example. These are screen studies, not a claim that clicking the highlighted tile would open lesson 1.

## Behavior intent — not implemented here

- Home **Get Started** and desktop **Sign up** require account creation; no guest access. **Login** is separate. Desktop home is a single viewport, no below-fold sections. Desktop **Sign up** is a dark capsule, matching Get Started's ink but not its rounded-rectangle shape. Mobile top bar has **Login only** alongside the wordmark: no Sign up. Mobile scenic artwork covers the entire background and is cropped as necessary. The mobile crop is positioned at **76% horizontally / 50% vertically**, bringing the brighter sky/mist behind the dark headline. There is **no translucent panel or scrim**; the text sits directly on the scenery. This is responsive positioning of the existing artwork, not repainting or containment.
- The redundant **Create your free account to begin.** line is removed beneath Get Started on both desktop and mobile.
- Modules are **grouping subtitles only** (for example, Module 1: Fundamentals). There are no Module complete messages, module rewards, completion screens, prominent module controls or other module-level UI. The small completion count describes individual lessons, not a module-completion event.
- Lesson background intent: fixed to the viewport **below** the fixed white header (desktop 80px, mobile 76px). Tiles and headings scroll above that backdrop; the decoration neither scrolls away nor hides behind the header. The two 390×844 scroll-check pages embed the **identical** 390×768 background at the **identical** position while later tiles replace earlier content. The long mobile list remains a content-layout overview; its full-height cover background is illustrative, not a simulation of attachment. Use the viewport pair as the fixed-background specification. No CSS or scrolling behavior is implemented.
- Whole lesson tile is one action: start/resume an unfinished lesson; restart a completed lesson unless its revisit is already active, in which case resume it. Completion ticks remain after first completion and revisits do not relock later lessons. Locked tiles cannot start. Decorative child labels are not separate buttons.
- Guidance priority: active revisit, otherwise next unfinished; brand-new users see **Start here**. Progression remains sequentially locked. No popup tour.
- Introduction is scenery-free. Separate white top navigation contains a back chevron to Lessons, lesson number + the five characters, and a recognizable **speaker icon** button. Speaker with sound waves = on; speaker with an x = muted, shown in the state-detail preview. An equivalent revision header would show lesson number + **Revision**; no revision-introduction screen or new mechanic is proposed.
- Learning-lesson introduction heading is exactly **Meet your new characters**, reused across learning lessons. Instruction is exactly: “Look at these characters and their pinyin. Some characters have more than one pronunciation. Try to remember them—but it is OK if you cannot yet.” The redundant Click Continue sentence is removed; other instruction copy is unchanged.
- Lesson 1 readings are exactly **我 wǒ; 的 de / dī / dí / dì; 你 nǐ; 是 shì; 了 le / liǎo**. Every authored reading is visible; no contextual sandhi or invented pronunciation is added.
- Sound control is a 44×44px icon-only toggle, default **on**. Accessibility intent: native button with stable accessible name **Sound** and `aria-pressed=true` when sound is on, false when muted. Tooltip describes the next action: **Mute sound** when on, **Unmute sound** when off. Remember preference across visits/lessons; icon updates to the muted state when off. Static intro previews show on; persistence/storage, accessibility semantics and audio behavior are not implemented or tested. The glyph is a native editable draw.io stencil, not decorative generated artwork.
- One primary **Continue** retains the existing introduction transition. No learning mechanics, story behavior, flashcards or content are changed. Actual in-lesson reader screens remain scenery-free.
- At narrow widths or zoom, content should reflow and scroll, never clip or shrink text to fit. Small-screen studies show two-column cards, wrapped instructions and an in-flow Continue. They are not executable responsive tests; no browser/runtime or keyboard/screen-reader testing was done.

## Design assumptions

System sans-serif (Helvetica with CJK fallback), restrained rounded card borders, and a quiet **Account** navigation placeholder on the lesson list are visual assumptions. White navigation bars support legibility. No new settings/account screen is specified. UI text, card geometry, and layout remain editable independently of the artwork. No fonts, assets, dependencies or app code were installed or integrated.

## Verification

Native draw.io Desktop exports editable-XML PNG previews for all layouts. The original artwork inputs remain unchanged; crop derivatives are produced only in this directory. Exported desktop and small-screen images are visually checked; this is a design review, not a functional QA pass. `build-mockups.py` reads curriculum and writes only this directory; both helper scripts use an existing Pillow installation. No app/runtime edits, installs, tickets, commits or deployment. Approved tile-state rules, character data, lesson locking, card sizing, and other mobile layout aspects are retained.

Latest set: **14 native editable sources / 38 exported layout pages / 6 contact sheets**. Validation checks source XML, exported PNG diagram metadata, page geometry, exact requested instruction copy, stable auth field/message positions and centered card fronts. The scroll viewport pair retains identical background coordinates. Original artwork is unchanged; only the review crop changes. Sound/motion/live validation remain specification-only, not executable features. No app code or tickets.
