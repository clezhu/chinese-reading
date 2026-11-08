# Issue #2 — reader prototype findings

## Verdict

**Choose B: flowing occurrence cells with a reserved two-row layout.** It answers
the technical layout/interaction question positively for this fixture in desktop
Chromium and narrow emulated viewports. Human reading comfort remains a judgement
for the two intended learners, not something the geometry checks establish.

Reserve annotation space even while pinyin is hidden (`visibility: hidden`, not
`display: none`). Center the authored reading and Han glyph in the same cell;
allow width to grow for long syllables. Use at least 44px-wide controls, a 23px
annotation row, and a 42px character row. Keep closing punctuation attached to its
preceding cell. Keep state by **occurrence**, never character text.

This is a recommendation for a fresh production implementation, not permission
to merge this plain-JavaScript experiment or alter the stack in spec #1.

## Approaches compared

| Variant | Structure | What we learned |
| --- | --- | --- |
| A — compact ruby | Native `ruby` / `rt` inside inline occurrence controls; continuous paragraphs | Dense, familiar text; reserved annotations prevent reveal movement. Controls can be only 34px wide and the 12px annotations feel small next to B. Native ruby line-box geometry is less straightforward to inspect. Not chosen for the first touch-friendly reader. |
| B — occurrence lanes | Independent inline-grid cells, continuous paragraphs, wrapping between occurrences | Explicit alignment, generous targets, no reveal-driven movement. Chosen. Costs more vertical space and can split words such as 银行 across lines. |
| C — word-grouped bands | Labelled sentence rows; groups of cells wrap together at authored word boundaries | Keeps words together, but much more ragged/vertical at 320px and needs word-group authoring. Longer unbreakable groups would need a fallback. Not worth imposing that model for this ticket. |

Double-underlined permanent help uses non-button elements with accessible names
that explicitly say “permanent training-wheel pinyin”. Dotted-underlined controls
become solid-underlined after reveal. This remains distinguishable without colour.
One-way reveal uses a set of occurrence IDs; repeated activation does nothing.
Revealed buttons retain keyboard focus and expose `aria-disabled=true`; the next
Tab moves to the next occurrence. A small live region announces the pronunciation.

## Checks actually performed

Environment: Ego Lite, Chromium 156 on macOS. Initial desktop viewport
1848 × 928; layout measurements also used 1280 × 900, 390 × 900 and 320 × 900
CSS-pixel emulation. These are **not physical mobile-device tests**.

- All three variants, at all three measured widths: initial hidden state and all
  31 revealable occurrences revealed. No horizontal page overflow; zero changed
  occurrence rectangles when revealing all; no neighbouring pinyin rectangles
  intersected; no annotation extended horizontally beyond its occurrence cell.
- Maximum annotation/character center mismatch: 0.00390625 CSS px (rounding).
  B/C had zero annotation/character-row rectangle overlaps. A's ruby inline line
  boxes overlap by definition in this measurement; screenshots, not that box
  metric, were used to judge A's visible glyph separation.
- During checking, the permanent double underline exposed a small row-box
  overlap in the initial 38px character lane. Increasing it to 42px removed that
  overlap; the full width/variant matrix above was rerun afterward.
- Desktop pointer click on `s1-o9` reveals **háng**. Keyboard Enter on `s3-o5`
  reveals **xíng**. Other 行 occurrences (`s2-o2`, `s2-o7`) remain hidden.
- A CDP-dispatched touch start/end on `s1-o9` at 320px with mobile/touch emulation
  enabled reveals only that occurrence. This checks touch dispatch, not hardware.
- Repeated Space activation on already-revealed `s3-o5` adds nothing and cannot
  hide it. Tab retains predictable forward focus to `s3-o6`; Space reveals 走.
- Clicking the first 妈 (`s1-o5`, **mā**) leaves the second (`s1-o6`, **ma**)
  hidden. This checks different contextual readings even within a repeated word.
- All five permanent occurrences remain visible, have no button role, and are
  absent from the reveal set. The accessibility snapshot exposes useful,
  occurrence-specific control names without exposing hidden answers in them.
- Switcher buttons wrap B → C → A and preserve the reveal set. ArrowLeft wraps
  A → C. Reload preserves `?variant=C` but empties reveal state. New attempt also
  clears the set. Author view updates after actions and switches.
- `node --check` succeeds for both JavaScript files; `git diff --check` succeeds.
  `NODE_ENV=production node prototype/reader/server.mjs` exits with status 1 and
  explicitly refuses to serve the experiment/switcher.

These were ad-hoc browser probes and interaction checks, not an automated test
suite added to the repository.

## Screenshots

- [B — initial desktop, mixed hidden/permanent/revealed help](screenshots/B-desktop.png)
- [A — 320px compact ruby](screenshots/A-320.png)
- [B — 320px occurrence lanes](screenshots/B-320.png)
- [C — 320px word-grouped bands](screenshots/C-320.png)

Narrow screenshots are scrolled viewport captures, not complete-page images.
The desktop screenshot predates the 38px → 42px character-row adjustment; the
narrow screenshots and final geometry matrix are after it. Later full-page and
desktop capture attempts timed out in the browser tooling; no successful final
desktop screenshot is claimed.
The fixed prototype switcher can cover content temporarily while scrolling; it
is not part of the proposed production reader. Bottom page padding allows the
final content to scroll above it.

## Limits / production follow-through (not implemented here)

- No Safari, Firefox, physical iPhone/Android, VoiceOver/TalkBack, or user reading
  session. Accessibility names and keyboard behaviour are checked, not certified.
- One tabbable button per occurrence becomes tedious for long stories; revisit
  navigation and screen-reader reading order with actual users before scaling.
- Noninteractive Han text rendered with an explicit image-role label is an
  experimental accessibility choice. Validate a continuous-reading experience
  with assistive tech; do not copy it blindly into production.
- Native ruby remains worth a cross-browser check if denser text is preferred.
  These findings do not claim native ruby is inherently unsuitable.
- Only the fixture's comma/full stop closing punctuation is handled. Quotation
  marks, opening punctuation, broader Chinese line-breaking conventions, very
  long annotations, and user font/zoom settings need production checks.
- Training-wheel choices and sentences are illustrative, not frequency-graded
  lesson content. The README records the pinyin desk-check; no independent human
  curriculum review or dictionary-completeness claim is made.
- Reload deliberately loses all state. No persistence, first-click revision
  collection, flashcards, finish-reading transition, accounts, or deployment.
  Those belong to other tickets, not this experiment.
- Prototype occurrence offsets are safe only for this immutable fixture. Real
  authored content needs stable IDs that survive editing/reordering.

## Capture

Keep everything in this directory on `prototype/issue-2-reader`, outside main.
Issue #2 holds the branch link, recommendation, evidence, and limitations. No
winner has been promoted into production and no other ticket has been worked.
