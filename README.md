# Hanzi Garden

React Router 8 framework-mode, React, and TypeScript on Cloudflare Workers;
D1 holds accounts, sessions, and learner progress. Issues #3–#6 implement
accounts → ordered lesson list → character introduction → mastery flashcards
→ story reading → contextual practice → fresh rereading. A reading pass without
reveals completes the lesson; otherwise recognise that pass's collected deck,
then reread with taught pinyin hidden again. Repeat as needed. Explicit revisits
reset practice without undoing milestones or later access. **Fundamentals** now
contains 11 lessons: learning 1–10 in exact frequency order plus an all-50
revision. The user-requested expansion supersedes the former three-lesson cap;
there is no unit logic. #7's first three remain unchanged at revision 3; the
eight new lessons at revision 1 are integrated from `app/content/extended-fundamentals.ts`.
See [`REVIEW-expansion.md`](authoring/drafts/REVIEW-expansion.md) for new-content
sources/self-review. This is not independent human approval or a deployment claim.
The reader under `prototype/` remains unrelated throwaway work.

Issue #9 adds the approved Hanzi Garden interface without changing curriculum,
mastery or progression. See [`docs/qa/hanzi-garden.md`](docs/qa/hanzi-garden.md)
for implementation/verification evidence and final runtime screenshots.

See [`docs/release-7.md`](docs/release-7.md) for historical #7 local/hosted
verification evidence, not verification of the expansion.

## Local development

Requires Node.js 22.12+ and npm.

```sh
npm ci
npm run dev
```

`npm run dev` automatically applies pending local D1 migrations before starting
Vite. You can also run `npm run db:migrate` explicitly against an already-running
development server. D1 persists under `.wrangler/`; local migrations do not
affect Cloudflare's database. Open the local URL printed by Vite.
Register with a 3–32-character
ASCII letters/numbers/underscore username and an 8–128-character password with
ASCII uppercase, lowercase, number and punctuation symbol. Username availability
is checked before signup; the database remains authoritative under races.
Existing passwords still work at login, without the new creation policy.
Usernames are case-insensitive. There is no email or account/password recovery.

```sh
npm run typecheck
npx playwright install chromium
npm test
npm run test:revision
```

Tests build and serve the real Worker with a separate local D1 store under
`.wrangler/playwright`. They create unique accounts; no Cloudflare credentials
are required. See `tests/README.md`. Stop other processes on port 4173 first.
For a manual built-runtime check, run `npm run build && npm run preview`.

## Authoring resources

See [`authoring/README.md`](authoring/README.md) for the offline SUBTLEX-CH
frequency guide, provenance/licence, reproducible UTF-8 conversion, and small
candidate queries. The dataset is not imported by the runtime app.

```sh
npm run authoring:frequency -- --limit 30
npm run authoring:bank -- people-and-places
npm run authoring:check
npm run authoring:check:drafts
npm run authoring:test
```

Reimporting/verifying the upstream archive requires Python 3; normal queries
and authoring tests use Node.js and the checked-in JSON without network access.
The deployment-update browser tests also use Python 3 to seed old attempts in
the isolated local test database. `npm run build` runs current-content validation
first, so invalid introductions/story structures cannot silently ship. Draft
checks stay separate; a passing check does not replace author self-review.
The writing brief supplies the top-100 training pool, mandatory Fibonacci reuse,
and interpolated length guidance without previous story text. See
[`docs/authoring.md`](docs/authoring.md) for the agreed policy.

## Deployment

Hosting requires access to a Cloudflare account with Workers and D1 enabled.
The checked-in D1 ID binds the deployed `chinese-reading` database. The app is
deployed at <https://chinese-reading.chinese-reading.workers.dev>.
For a separate Cloudflare account, create a new database:

```sh
npx wrangler login
npx wrangler whoami
npx wrangler d1 create chinese-reading
```

Put the returned database ID into `wrangler.jsonc` (`d1_databases[0].database_id`).
Database IDs are configuration, not credentials. Then:

```sh
npm run db:migrate:remote
npm run deploy
```

Wrangler prints the hosted workers.dev URL. Enable a workers.dev subdomain in
Cloudflare if prompted. Smoke-test registration, logout/login, the first lesson,
and rejection of a locked lesson at that HTTPS URL before declaring deployment
complete. Apply future remote migrations before deploying code that needs them;
back up existing D1 data before destructive migrations.

Do not commit Cloudflare tokens, `.env`, or `.dev.vars`. CI can supply
`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` through its secret store.
This app needs no application secret: sessions use random opaque tokens, with
only SHA-256 token hashes persisted in D1. Future application secrets should
use `wrangler secret put NAME` and ignored `.dev.vars` locally.

## Storage and security boundaries

- `app/content/curriculum.ts`: typed authored module/lesson lists, stable IDs,
  lesson-owned reading definitions, revisioned stories, and paragraph/sentence/
  token arrays. Order defines progression; no curriculum database, global
  dictionary or stored cumulative bank. See `app/content/README.md`.
- `migrations/0001_accounts.sql` through `0003_reader.sql`: accounts, sessions,
  and one latest attempt per user/lesson. Reader migration adds content revision,
  monotonic response version, and first/latest completion revisions while
  preserving milestones. Apply migrations before running the updated Worker.
- No row means not started. Starting from the lesson list saves an introduction;
  directly visiting a lesson shows the same introduction without creating a row.
  Continue from the introduction saves `flashcards`; passing the complete original deck in one
  clean round (including the first) saves `story`. Finish freezes reveals and enters
  `revision-flashcards`, or completes directly if there are no reveals. Passing
  contextual cards atomically starts a fresh story pass with a new attempt ID
  and empty reveal set, without repeating initial flashcards or earning milestones.
- `app/lib/story.ts`: derive the taught bank and permanent help, enumerate
  revision-scoped `paragraph:sentence:token` references, and derive one revision
  card per character. Its context is the earliest revealed occurrence in story
  order, with the selected sentence's final help state and all target readings.
  No click order/history, snapshot deck, or runtime pronunciation guessing.
- `app/routes/reader.ts`: authenticated no-store resource at
  `/lessons/:lessonId/reader`. Atomic D1 JSON additions merge concurrent reveals;
  idempotent Finish freezes the server set. Writes validate owner, access,
  attempt, content revision, phase and revealable occurrence. Stale reveals
  after Finish are rejected. The shared completion operation also supports #6.
- `app/components/story-reader.tsx`: reserved two-row lanes flow through authored
  paragraphs. Reveal immediately, retry transient failures automatically, keep
  pending help in memory only, block Finish while unsaved, and refresh on focus
  and successful saves. Server versions reject stale responses. Closing before
  save may lose pending help; no localStorage backup or continuous live-sync.
- Relevant content edits must bump revisions. Older unfinished attempts restart
  the whole lesson with a fresh identity; completed milestones/revisions and
  later access remain. Already-finished lessons stay complete. Older deployments
  refuse to downgrade newer attempts; see the manual revision policy.
- `app/lib/flashcards.ts`: shared, arbitrary-size deck transitions. Any clean
  full-deck round completes, including the first. Otherwise repeat only misses;
  clearing a smaller subset leads back to the full original deck. A failed
  full-deck retry follows the same rule; no extra pass is required after success.
- Within-deck state is optional localStorage, keyed by user + lesson + attempt
  ID + deck purpose. Missing, malformed, stale-content, or inaccessible storage
  restarts the current whole deck, not the lesson. There is no D1 answer history
  or round checkpoint. D1 phase changes are explicit and errors are displayed
  without claiming the lesson result was saved.
- Native Workers `node:crypto` scrypt hashes passwords with random per-password
  salts (N=32768, r=8, p=3); raw passwords and session tokens are not stored.
- Production cookies are Secure, HttpOnly, SameSite=Lax, host-only cookies.
  Only loopback HTTP development uses a non-Secure cookie. Logout revokes the
  database session. Mutations check origin and derive ownership from the session,
  never browser-supplied user IDs. Locked reads and writes are checked server-side.
- Deck-passed claims are intentionally trusted self-assessment. The server checks
  phase order and attempt ID but does not verify individual answers. This and
  browser-local round progress supersede the original #1/#4 requirements; see
  [the agreed amendment](https://github.com/clezhu/chinese-reading/issues/4#issuecomment-6719667579).

Completed lessons offer View lesson and an explicit Revisit lesson action on
the list. An active revisit retains its Completed badge and offers only Resume
revisit, so returning cannot discard practice. Revisit replaces the current
attempt ID, clears reveals and browser-practice identity, and preserves first
completion and later access. Completing it updates only the latest milestone.
Stale/repeated revisit requests cannot replace an active attempt.

Revision-kind lessons enter the story directly with no new characters or initial
deck. `npm run test:revision` validates an unpublished fixture in a separate
build/D1 store. That fixture has the first three lessons plus an early revision
(four total), separate from production's 11 lessons. See
[`tests/revision-README.md`](tests/revision-README.md).

No R2, content administration, email/recovery system, or runtime content generation.
