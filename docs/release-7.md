# #7 release evidence

Verified 2026-11-09. Owner-confirmed scope amendment:
https://github.com/clezhu/chinese-reading/issues/7#issuecomment-6730942695

## Release

- URL: https://chinese-reading.chinese-reading.workers.dev
- Worker: `chinese-reading`, production/default configuration.
- Deployed version: `0b583713-6bc5-43f1-b754-c7efd12fbe9c`.
- Deployment command: `npx wrangler deploy --message 'Issue 7: Fundamentals stories, Fibonacci authoring policy and reread completion loop'`
  after `npm run build` and `npx wrangler deploy --dry-run`.
- Existing `DB` binding preserved. `wrangler d1 migrations list DB --remote`
  reported no pending migrations. The pass reset uses existing columns; no
  schema change or destructive migration was required.
- The initial deployment above was from the local working tree. See #7 for the
  subsequent commit/push and commit-backed deployment record.

## Requirement audit

| Requirement | Evidence |
| --- | --- |
| Exactly three learning lessons, five unique introductions each, one Fundamentals module | `app/content/curriculum.ts`; canonical authoring tests and curriculum browser tests |
| Exact frequency order; bounded permanent-help pool | `authoring/scripts/authoring-policy.mjs`; frequency provenance in `authoring/data/README.md`; policy tests include rank 100/101 and complete training-wheel fade-out at 100 introductions |
| Deterministic Fibonacci reuse and latest-50 revision checkpoints | Static brief/checker and policy tests; learning-only counter, successive gaps, skipped revisions, nonresetting extra appearances and pending future obligations covered |
| Interpolated normal target and 5x revision target | Policy tests cover anchors, every interpolation segment, cap and soft warnings |
| Natural stories, mandatory coverage, explicit contextual pinyin and complete reading lists | `app/content/fundamentals-stories.ts`, `authoring/PRONUNCIATION.md`, `authoring/drafts/REVIEW-7.md`; 62/64/68 Hanzi; author self-review before/after correction and checks; no independent human approval claimed |
| Promotion, fixture separation and revision bumps | All three lesson revisions are 3; stale candidate export retired; no fourth lesson; `authoring:check`, candidate API tests, separate revision fixture build |
| Initial cards, saved story/revision, fresh reread, zero-reveal completion, unlocking and end state | Full Worker/D1 browser suite plus hosted three-lesson journey |
| Pass-local decks, unlimited rereads, stale-tab/account safety and frozen contextual pinyin | Completion/reader browser tests and public progress SQL tests; new attempt ID and cleared reveals on each reread |
| Content-update reset, preserved milestones/access, failed-save retries and concurrency | `reader-updates.browser.spec.ts`, `reader.browser.spec.ts`, `completion.browser.spec.ts` |
| Revision-kind path without publishing extra content | Three isolated `test:revision` browser cases; no initial cards, current-pass revision, fresh reread, zero-reveal completion and revisits |
| Desktop/mobile readable paragraphs, fixed reveal layout and keyboard actions | Browser geometry/keyboard tests; 1280px desktop and 320px narrow screenshots visually inspected; no clipped pinyin/overlap observed |
| Continuing authoring/development/deployment commands | Root `README.md`, `authoring/README.md`, `docs/authoring.md`, `docs/reader.md`, `tests/README.md` |

## Local verification

- `npm test`: **80 passed** (50 Chromium, 2 mobile, 28 pure/SSR/SQL).
- `npm run test:revision`: **3 passed**, separate Worker/build/D1.
- `npm run authoring:test`: **28 passed**, including explicit fade-out at 100.
- `python3 authoring/scripts/import_frequency.py --check`: verified pinned
  upstream checksum, conversion and committed UTF-8 dataset.
- `npm run authoring:check` and `npm run authoring:check:drafts`: pass;
  published content has no errors or length warnings. The compatibility draft
  export is empty after promotion, not three unpromoted replacements.
- App, authoring and test TypeScript checks: pass.
- Production build, deployment dry run and `git diff --check`: pass.
- App source/built module audit: no runtime authoring dataset, draft or policy
  import. No new dependencies, R2, CMS, runtime generation or user-specific
  scheduling were added.

## Hosted browser smoke

Used one temporary account and the ordinary production UI:

1. Registration, single Fundamentals heading and three ordered lessons;
   requesting the locked second lesson returned 403.
2. First lesson: five initial cards; reveal one occurrence, wait for save,
   reload and observe that exactly one taught occurrence remains revealed.
3. Finish reading; contextual revision card contains the original sentence and
   final help. Recognise the card and choose **Reread story**.
4. Authoritative state returns to `story`, with a changed attempt ID, empty
   reveal set and no visible taught pinyin. Finish without reveals completes
   and offers the second lesson.
5. Second lesson: five initial cards, no-reveal completion, third lesson unlock.
6. Third lesson: initial cards and saved story phase; log out, confirm reader
   resource returns 401, log back in and resume the story rather than initial
   cards. No-reveal completion shows the end-of-curriculum message and no
   broken next link.
7. All three lessons display Completed. Revisit first lesson: fresh introduction
   and cleared help, completion milestone still visible, list offers Resume
   revisit, third lesson remains accessible (200). An old-identity reveal
   request returns 409.
8. Closed the task browser space. Deleted only the temporary test account;
   confirmed zero matching accounts remain. `PRAGMA quick_check` returned `ok`.
   Temporary credentials were removed and are not in source or this record.

Hosted browser screenshot capture timed out in the browser tool; visual review
used the successful local built-Worker screenshots instead. No hosted mobile,
physical-device, Safari/Firefox or assistive-technology test is claimed.

## Boundaries

The owner explicitly chose author self-review for this toy project, not a
separate reviewer or human language gate. Rare/variant readings of 么 have a
documented reference-scope caveat. Immediate no-help reading is a local practice
milestone, not proof of durable literacy. Fibonacci lesson spacing and the
50-character checkpoints are design heuristics, not validated optimal memory
intervals; see `research/spaced-character-review.md`.

Only three lessons ship. Later revision checkpoints, training-wheel fade-out
and long-term length progression are enforced/tested authoring policies, not
a claim that a 100- or 3,500-character curriculum has already been written.
