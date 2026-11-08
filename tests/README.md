# Issues #3–#6 tests

```sh
npm ci
npx playwright install chromium
npm test
```

`npm test` builds the app with the existing build script, applies migrations
locally, and starts the **built Worker** using its generated Wrangler config.
This is real workerd/D1, not a mocked API or Vite's source dev server. It never
deploys or runs remote migrations. Port 4173 must be free; an existing server is
deliberately not reused.

Both migration and server commands use `.wrangler/playwright` for persistence,
separate from the developer's default `.wrangler/state`. Accounts have random
usernames, so reruns do not depend on a clean database or a test execution order.
Assertions inspect browser/HTTP behaviour, not password hashes or private table
shapes. Deployment-update tests use Python 3 to seed earlier-revision attempts
for their random test accounts in the isolated database, then assert public
behaviour and displayed milestones. This never touches `.wrangler/state` or D1
remotely.
Failure traces/screenshots go to `.wrangler/playwright-results`.

The Chromium browser suite covers auth, copied-token revocation, invalid forms,
same-origin writes, ordered curriculum, locked route/write protection, forged
completion claims, grouped readings, saved introductions and account isolation.
The mobile project checks narrow-screen overflow, touch-target heights, and
keyboard focus/activation. Browser emulation does not simulate an OS virtual
keyboard. The SSR project renders the shared lesson card using the unpublished
revision fixture; it adds no route or curriculum entry.

Flashcard browser tests exercise the real persisted introduction-to-story-phase
journey, clean first-pass completion, all-missed full-deck retries, subset retries,
failed/full-deck confirmation, localStorage resume,
invalid/missing/blocked-storage fallback, another-device phase retention,
ownership/attempt/phase guards, and an unsuccessful save followed by retry.
Mobile tests exercise the whole deck using keyboard focus and activation, with
overflow and touch-target checks. Focused public transition tests in the `ssr`
project cover repeated misses, non-five-card decks, reveal gating, and restore
validation without mocking browser or database operations.

To run only one project: `npm test -- --project=chromium` (or `mobile`, `ssr`).
The same isolated local Worker is started for each invocation.

## Reader and content checks

`reader.browser.spec.ts` covers contextual/polyphonic help, independent repeated
occurrences, derived/frozen revision, earliest revealed story-order context,
reload/cross-device persistence, no-click completion/unlocking, atomic concurrent
adds/Finish, invalid and cross-account writes, transient retries, unsaved reload
loss, terminal authentication/conflict feedback, focus refresh with pending help,
and out-of-order responses. Both 1280px and 320px geometry checks prove reserved
lanes/positions remain stable, paragraphs flow across sentence boundaries, and
wrapping/controls remain usable. Mixed/all-revealed screenshots are saved in
their `.wrangler/playwright-results` test directories for visual inspection.

`reader-updates.browser.spec.ts` covers whole-lesson resets from every unfinished
practice phase, fresh identity/cleared reveals, stale-write rejection, retained
first/latest completion dates and revisions, preserved later access, older-code
downgrade protection, and trailing-slash URLs. `story.ssr.spec.tsx` exercises the
pure public story/deck boundary and accessible SSR output, including revision
lesson fixtures without adding a fourth published lesson.

```sh
npm test -- tests/reader.browser.spec.ts tests/reader-updates.browser.spec.ts --project=chromium
npm run authoring:test
npm run authoring:check
npm run authoring:check:drafts
npm run authoring:typecheck
```

Builds run current-content validation automatically. Draft approval is a separate
human language-review step; no test claims #7 approval, Safari/Firefox coverage,
physical-device testing, or assistive-technology review.

Type-check tests as well as app code with `npx tsc --noEmit -p tests/tsconfig.json`
(after `npm run typegen` on a fresh checkout). Expected rejected cross-origin
requests can produce React Router CSRF errors in the server log; the suite
asserts their 400/403 responses.

## Completion and revisits

`completion.browser.spec.ts` covers contextual revision mastery, failed full-deck
confirmations, reload/another-device resume, narrow context wrapping, rejected
save/retry, first/latest completion, fresh and resumable revisits, retained later
access, phase/ownership/lock guards, and the full three-lesson end state. Lesson
card SSR tests cover completed status and non-destructive actions at every
revisit phase. No attempt-history or scheduling tables are added.

Run `npm run test:revision` for the separate checked revision-kind curriculum
and real Worker/D1 browser journey. See [`revision-README.md`](revision-README.md)
for isolation details; normal builds and tests retain three published lessons.
