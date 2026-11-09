# Hanzi Garden — issue #9 implementation evidence

Local verification, 9 November 2026. **Not a deployment claim.** Issue #9 stays
open for review. Implementation branch: `hanzi-garden-implementation`, based on
the approved reference branch at `cc48c0f041b8339ee2648a7beabcd264e9e05e85`.
The published reference branch and its original assets/previews are unchanged.

## Actual application screenshots

[Runtime overview](hanzi-garden/runtime-overview.jpg) — these are captures of
the built Worker and real local D1 accounts, not design mockups or seeded
completion screens. Tests reach completion through the existing public flows.

| Surface | Captures |
| --- | --- |
| Layered home | [Desktop](hanzi-garden/home-desktop.png), [390px mobile](hanzi-garden/home-mobile.png) |
| Auth | [Login desktop](hanzi-garden/login-desktop.png), signup mobile [empty](hanzi-garden/signup-mobile-empty.png), [invalid](hanzi-garden/signup-mobile-invalid.png), [valid](hanzi-garden/signup-mobile-valid.png) |
| Lessons | [Desktop](hanzi-garden/lessons-desktop.png), [mobile content](hanzi-garden/lessons-mobile.png), [scrolled viewport](hanzi-garden/lessons-mobile-scrolled.png) |
| Introduction | [Desktop](hanzi-garden/introduction-desktop.png), [mobile](hanzi-garden/introduction-mobile.png) |
| Initial flashcards | [Front](hanzi-garden/flashcard-front-desktop.png), [revealed](hanzi-garden/flashcard-revealed-desktop.png) |
| Reader | [No taught help](hanzi-garden/reader-no-help-desktop.png), [saved help](hanzi-garden/reader-saved-desktop.png) |
| Contextual revision | [320px front](hanzi-garden/revision-front-mobile.png), [revealed](hanzi-garden/revision-revealed-mobile.png) |
| Saved completion | [Normal](hanzi-garden/completion-settled-desktop.png), [actual lesson 11](hanzi-garden/completion-final-desktop.png) |

## Commands and results

| Command | Result |
| --- | --- |
| `npm run typecheck` | Pass; generated bindings/routes plus application TypeScript |
| `npm run authoring:check` | Pass; existing author self-review notice remains, not independent curriculum approval |
| `npm test` | **108 passed**: built Worker/D1 browser, mobile keyboard, pure/SSR/SQLite contracts |
| `npm run test:revision` | **3 passed**, isolated revision-fixture Worker/D1 on port 4174 |
| `npm run build` | Pass; production framework/Worker build only, no upload |
| `npx tsc --noEmit -p tests/tsconfig.json` | Pass |
| `git diff --check` | Pass |

The full suite also builds the production app and checks authored content before
starting its isolated Worker on port 4173. Screenshot tests are
`tests/garden-ui.browser.spec.ts`; the final screenshot comes from the UI-only
11-lesson journey in `tests/completion.browser.spec.ts`. Other suites retain
their security, concurrency, progression and failure assertions, with only
intentional presentation/interaction expectations updated.

## Coverage and preservation

- **Auth:** shared creation rules, every priority error, ASCII character classes,
  128-character bound, hidden untouched hints, generic login errors, legacy
  non-complex credentials and new 8–11-character credentials. Real case-insensitive
  availability/uniqueness; debouncing, invalid-input gating, immediately revoked
  success, ignored stale responses (including uncancellable replies), malformed
  replies, timeout/retry and submit-time uniqueness conflicts. Fixed message-slot
  geometry checked for empty/error/valid forms; labels/status associations checked.
  Inputs wait for hydration to prevent early typing being silently overwritten.
- **Tiles:** one start/resume/revisit action, attempt-scoped authenticated POST
  for restart, active revisit resumes without reset, persistent completion,
  retained subsequent access, visible/non-actionable locks, one deterministic
  Start/Continue pointer with active-revisit priority. Numbers use one 60px size;
  no invented lessons or artwork in tiles.
- **Learning:** clean initial full deck passes immediately; misses repeat and a
  cleared smaller subset returns to the full deck. Save failures never advance.
  Optional local deck storage keeps its existing attempt-scoped keys. Front
  glyphs are geometrically centred; an inert, accessibility-hidden back layout
  reserves space even for narrow contextual cards. Readings/context do not leak
  onto the front. Front/back rectangle sizes are browser-tested.
- **Reader:** authored content, stable lanes and occurrence-only one-way reveals
  retained. Optimistic pending help, automatic retries, focus refresh, stale
  version/attempt/content rejection, terminal errors, ownership/origin/locks and
  Finish gating remain covered. Frozen earliest-revealed contextual revision,
  fresh reread identity, hidden taught help and zero-reveal-only completion remain
  covered. Revision-kind lessons still go directly to story.
- **Completion/audio:** sound defaults on, is remembered, uses a stable native
  Sound button with pressed state/tooltip, and degrades safely without storage
  or audio APIs. Four gentle synthesized events use a gesture-unlocked context;
  there is no autoplay or background audio. Tests instrument oscillator scheduling
  and verify unmuted/muted events, successful revisits, failed/retried Finish,
  remote completion, refresh silence and no replay. Confetti is distributed over
  the viewport, non-blocking and cleared after 1.1 seconds. Reduced motion skips
  particles without independently muting audio. Final lesson has no Next action;
  nothing auto-advances or announces module completion.
- **Responsive/accessibility:** 1440×810, 390×844, 320×568/480, short 780×420 and
  720×405 reflow-equivalent 200%-zoom viewports. No horizontal overflow; controls
  remain scroll-accessible. Keyboard navigation, visible focus, native controls,
  associated validation text, colour-independent errors and 44px reader/sound
  hit targets are tested. Primary controls explicitly assert white-on-charcoal
  colours. The list's white sticky header and identical fixed scenery geometry
  before/after scroll are checked. Scenery is absent inside lessons.

`git diff` against the pinned reference confirms **no changes** to authored
content/frequency data, migrations, `progress.server.ts`, `story.ts` or
`flashcards.ts`. Session cookies, password hashes, ownership, same-origin checks
and conditional progress writes are retained. The availability endpoint uses
the existing strict POST/origin/bounded-body boundary, parameterized lookup,
valid-input gating, debounce and no-store responses; it adds no CORS permission.

## Production artwork derivatives

Only `public/art/` is shipped: seven WebP plates/overlays and the supplied two
one-ink PNG favicons, **735,915 bytes total**, rather than the design source tree.
`design/hanzi-garden/build-web-assets.py` reproduces these with Pillow; in this
environment use `/usr/bin/python3 design/hanzi-garden/build-web-assets.py`.
No source art was regenerated, sharpened or overwritten.

The background and overlays share one 1600×900 canvas; the extra generator
sky/water is cropped without stretching the temple/blossoms. Low-alpha edge
mattes are attenuated, the temple/reflection remains one aligned overlay, and
fog alpha fades at every texture edge. Two copies move independently between
depth layers with 5% overscan and small alternating 28/39-second transforms,
avoiding a hard loop reset or entering texture boundary. Tests sample live fog
transforms at different animation times and verify reduced-motion removal.
Mobile uses the approved bright 76% crop without a text scrim; all layers cover.
Login/list assets are static. Final desktop/mobile frames were visually compared
with the individual pinned previews, including the scrolled list.

## Remaining review limits

- Chromium desktop/mobile emulation and local workerd were verified, not physical
  iOS/Android devices, Safari/Firefox, hosted infrastructure or production data.
- The 720×405 check exercises 200%-zoom-equivalent reflow; a native browser UI
  zoom session and a screen-reader-user pass were not performed.
- Audio scheduling/mute/gesture behavior is automated evidence, **not subjective
  speaker/headphone listening approval**. Fog geometry and sampled rendered
  frames are verified, not a claim of human review of every frame of complete
  fog animation cycles.
- The supplied separate generated layers are not pixel-identical to the
  flattened concept (as documented in the approved handoff). The cleaned layered
  composition preserves their painterly style; final aesthetic sign-off remains
  human review, not something a passing test can establish.

No production deployment, remote migration, new curriculum/module mechanics,
account-recovery feature or issue closure was performed.
