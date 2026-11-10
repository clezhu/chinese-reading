# Next 44 lessons — local integration

Integrated locally on 2026-11-10, at the owner's request. No remote deployment,
remote migration or hosted verification was performed.

## Content and preservation

- `app/content/frequency-expansion.ts` contains the 44 collected lessons:
  learning-11 through learning-50, with revision-20/30/40/50 in sequence.
- `app/content/curriculum.ts` appends them to the existing Fundamentals module.
  Total: **55 lessons, 50 learning + five revision checkpoints, 250 introductions**.
- All new lessons retain their stable assigned IDs and authored revision 1.
  The first 11 lessons, including their stories, pinyin, definitions, titles,
  descriptions and revision numbers, are unchanged. Regression fingerprints
  cover both the original 11 and the exact collected 44.
- A direct deep-equality check confirmed the complete runtime curriculum equals
  the full validated collected candidate. There are no authoring/dataset/draft
  imports into the runtime content; only static authored lesson data was copied.

## Author review and sources

The four authors' actual self-reviews are preserved as `worker-1.md` through
`worker-4.md`. These describe meaningful target use, contextual pinyin decisions,
language revisions, source consultations and limitations. `readings-review.md`
preserves the coordinator's reference-based reading-list preparation and scope.
Their references to draft filenames/commands describe historical authoring work,
not commands that should be rerun against a changed publication.

CC-CEDICT contributors / MDBG, adapted pronunciation material under
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). The consulted
archive SHA-256 is
`2e8921a90b9abdca2ce78b8a6af104368f848681b7afe8020043f500fbe0238a`.
Preserve attribution and share-alike terms with reused adapted pronunciation
material. SUBTLEX-CH attribution/licence remains in `authoring/data/README.md`.
Original stories are not copied dictionary examples.

The full temporary run was archived locally at
`.authoring-runs/archive/next-44-20261109/`; it is ignored, not runtime content,
and not a replacement draft for the now-expanded publication. Its old launch
journal/assignments remain historical evidence; do not relaunch or recollect it.

## Validation actually performed

| Check | Result |
| --- | --- |
| Combined candidate collection, then published runtime policy check | 55 lessons, zero hard errors |
| `npm run authoring:test` | 80 passed |
| `npm run authoring:typecheck` | passed |
| `npm run typecheck` | passed |
| `npx tsc --noEmit -p tests/tsconfig.json` | passed |
| `npm test` | 110 passed, Chromium/mobile/SSR |
| All-55 UI completion regression | passed; all five revisions start directly in story; final completion/reload verified |
| `npm run test:revision` | three isolated revision-fixture tests passed |
| `npm run build` | normal production-mode local build passed after fixture tests |
| Local development server | `http://127.0.0.1:5173/login` returned HTTP 200 |

The isolated revision guard was updated from its stale 11-lesson expectation to
55; its test curriculum remains the same four-lesson fixture, not runtime data.

**36 soft passage-length warnings remain**, all in new learning stories. They
are not hidden, promoted to hard errors or waived coverage obligations. The
authors explain retaining complete scenes/dialogue rather than padding/cutting
solely for a soft target. Mechanical passes do not establish natural Mandarin,
reading-list completeness, learner suitability, independent approval or learning
efficacy. No independent language review is claimed.
