# Stories 56–110 release

Verified 2026-11-12 UTC for the owner's request to put all 55 authored stories
on the website.

## Initial production deployment

- URL: <https://chinese-reading.chinese-reading.workers.dev/lessons>
- Worker: `chinese-reading`, default/production configuration.
- Account: `25199d0c31150d259be2793febaba676`.
- Version: `0fb3bba3-8df9-43d6-98c9-8d13d720ddd3`.
- Deployment: `npx wrangler deploy --message 'Add authored stories 56–110; preserve existing 55 stories' --keep-vars --strict`.
- Existing D1 binding preserved; no schema change or remote migration performed.
- This initial deployment was from the local working tree. A subsequent
  commit-backed redeployment is identified by its Git commit in Cloudflare's
  deployment message; the version above records the initial release only.

The publication has **110 stories / 100 learning lessons / ten revisions /
500 introductions** in one Fundamentals module. Stories 1–55 are deeply
unchanged, including IDs, content revisions, introductions and story tokens.
Stories 56–110 start at revision 1 and are static authored content in
`app/content/frequency-continuation.ts`.

## Validation

| Check | Observed result |
| --- | --- |
| Combined candidate collector and full publication policy | zero hard errors; all 110 stories checked |
| Integrated curriculum versus candidate | exact deep equality |
| First 55 versus frozen baseline | exact deep equality; fixed fingerprint regression |
| Authoring tests | 80 passed |
| Authoring, app and test TypeScript checks | passed |
| Built Worker/D1 app/browser/SSR suite | 117 passed, including completion of all 110 through UI |
| Isolated revision-kind browser suite | 3 passed |
| Production rebuild after isolated fixture suite | passed |
| Deployment dry run | passed; intended production DB binding |
| Production deployment | successful, version above |

There are 54 advisory length warnings: 36 pre-existing and 18 new, documented
with the genuine worker self-reviews in `authoring/drafts/next-55-review/`.
The build also reports a large client chunk warning; this release does not
claim loading-performance optimization. Mechanical checks are separate from
author language self-review, not independent Mandarin approval or learner tests.

## Hosted browser smoke

Used an isolated temporary test account via ordinary production UI, without
changing the owner's progress or running direct production database edits.

1. Observed 55 lesson cards before deployment, then 110 after deployment.
   All 110 hosted lesson IDs and their order exactly matched the candidate.
2. Started story **56** (`learning-51`), saw its five introductions, completed
   its initial flashcards, and continued to the live story reader.
   All **183** Hanzi/pinyin token pairs exactly matched the authored candidate.
3. Started story **110** (`revision-100`) directly in the reader, with no
   initial flashcards. All **1053** Hanzi/pinyin token pairs exactly matched.
4. At a 390px mobile viewport, story 110 had no document horizontal overflow
   (scrollWidth = clientWidth = 390).
5. Finished story 110 without reveals; observed saved completion and the
   end-of-available-lessons message, with no next-lesson link. Reload preserved
   those observations.

A hosted screenshot capture timed out; the successful smoke evidence above is
DOM/UI observation and exact token comparison, not a claim of hosted visual
screenshot review. The automated suites cover reader layout and narrow geometry.
The browser task was closed after verification.

## Authoring artifacts

Source attribution, rare-reading scope, adapted-pronunciation licence and all
five author self-reviews are tracked in `authoring/drafts/next-55-review/`.
The integrated run is archived locally at
`.authoring-runs/archive/next-55/`, including the sealed plan, candidate,
collection report, check/build/deploy logs and hosted audit artifacts. It is
historical evidence, not an active replacement draft or a source imported by
the application. Do not collect or relaunch it against the expanded baseline.
