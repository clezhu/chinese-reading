# Runtime tests

## No-server checks

```sh
npx tsc --noEmit -p tests/tsconfig.json
npx playwright test --config tests/playwright.noserver.config.ts
npm run test:revision:check
```

The dedicated no-server config runs pure flashcard/story tests, accessible SSR,
and `progress.ssr.spec.tsx` only. It has **no webServer configuration** and needs
no browser. The progress contract tests execute public progress operations and
real migration/JSON1 SQL in ephemeral `node:sqlite` databases (Node 22.12+;
experimental SQLite warnings are expected). Their small D1-method adapter does
not replace the real Worker/D1 browser suite or prove distributed concurrency.
On fresh checkouts, generate app route/binding types before the TypeScript check.

## Built Worker browser suites — coordinate serial execution

```sh
npm ci
npx playwright install chromium
npm test
npm run test:revision
```

Do not run these suites concurrently with another agent's server-backed run.
Even `npm test -- --project=ssr` starts the normal configured Worker; use the
explicit no-server config above when a server must not be started.

Normal browser tests build the app, migrate isolated local D1, and serve the
built Worker at `127.0.0.1:4173`. They never deploy or migrate remotely. Persistence
is `.wrangler/playwright`, not developer `.wrangler/state`; screenshots/traces
are under `.wrangler/playwright-results`. Existing servers are never reused.
Accounts have random usernames and do not rely on test ordering. Update tests
require Python 3 to modify only their own account's earlier-deployment row in
that isolated database, then assert public HTTP/browser behavior.

## Reading-pass contract

- Initial learning still follows introduction → initial flashcards → **Continue
  to story**. Revision-kind lessons start directly in the story.
- Finish with saved help freezes only that pass's occurrence-specific revision
  cards; earliest revealed story-order context wins, not click order.
- Recognising revision cards offers **Reread story**, never completion. Saving
  creates a new story attempt, clears `revealed`, and resets version to zero.
  Initial learning is not repeated during this automatic reread.
- Every taught occurrence starts hidden in each fresh pass; permanent help stays
  visible. The read → revision → reread cycle has no pass limit.
- Only a zero-reveal Finish earns/updates completion milestones and unlocks later
  lessons. Practice cannot write completion, including during an earned revisit.
- Fresh IDs reject old reveal/Finish/revision/initial-deck writes and isolate
  browser-local decks even when two consecutive revision sets have identical IDs.
- Explicit completed learning revisits return to introduction; revision-kind
  revisits return to story. First completion and later access are preserved.

`completion.browser.spec.ts` exercises repeated passes, retry/full confirmation,
reload/local deck restoration, stale tabs/writes and old-pass snapshots,
cross-device/account isolation,
rejected-save retry, milestone timing, explicit learning revisit, narrow revision
context, and ordered end-of-curriculum completion. `reader.browser.spec.ts` covers
independent occurrence help, frozen context, atomic/concurrent reveals and
Finish, no-click completion, invalid requests, retry/terminal failures, pending
reload loss, focus refresh, older responses, and desktop/narrow stable geometry.
`reader-updates.browser.spec.ts` covers unfinished reset, fresh identity, stale
writes, milestone preservation, downgrade refusal and canonical resource URLs.

Published story refs, readings, titles, counts, module order and revisions are
derived from `curriculum`/`enumerateStory` through `content-helpers.ts`, rather
than the old illustrative story coordinates. Deliberately small pure story/deck
fixtures remain appropriate for punctuation/polyphonic edge cases independent
of the current published language. The isolated revision adapter also reuses the
current first story instead of an obsolete copied story. See
[`revision-README.md`](revision-README.md).

Auth tests retain native form/origin/session/ownership guards. Initial flashcard
and mobile tests retain retry, keyboard, blocked-storage and save-failure cases.
Some older initial-flashcard/mobile scenarios still assume five-card decks and
stable first-lesson labels; these are not the source of reader-pass expectations.
No test claims language approval, Safari/Firefox, physical-device, OS virtual
keyboard or assistive-technology review.

## Reread-loop verification evidence

The integrated `npm test` run passed 80 cases (50 Chromium, 2 mobile, 28
pure/SSR/SQL); the isolated revision-kind run passed 3 more. App and test
TypeScript checks passed. These suites use local isolated Worker/D1.
Production deployment and separate hosted browser smoke evidence are recorded
in [`docs/release-7.md`](../docs/release-7.md).
