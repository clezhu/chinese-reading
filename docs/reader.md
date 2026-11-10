# Persisted reader loop (#5–#7)

## Content and identity

The exact authored schema and revision policy are in
[`app/content/README.md`](../app/content/README.md), and agent authoring workflow
in [`authoring/README.md`](../authoring/README.md). Each lesson has one current
story, with paragraphs containing sentence arrays containing Hanzi/pinyin objects
or punctuation strings. A paragraph renders as one continuous wrapping stream;
sentence boundaries define revision context, not forced visual line breaks.

References use `paragraph:sentence:token`, zero-based, scoped to lesson and
content revision. Indexes are stable within that revision only. D1 stores the
reveal set, not Hanzi, pinyin, interaction order, sentence snapshots or a deck.
Reading definitions belong to the introducing lesson; cumulative taught sets,
permanent help and revision cards are derived.

The current runtime curriculum has 55 lessons in the existing Fundamentals
module (`foundations`), with no unit logic: learning 1–50 plus five latest-50 revisions.
The user-requested expansion supersedes the former three-lesson cap. The first
three remain unchanged at revision 3; learning 4–10 and the checkpoint are
revision 1, integrated from `app/content/extended-fundamentals.ts`. The next 44
lessons are at revision 1 in `app/content/frequency-expansion.ts`; see
[`next-44-review/`](../authoring/drafts/next-44-review/) for their source/self-review
and local integration evidence. See
[`REVIEW-expansion.md`](../authoring/drafts/REVIEW-expansion.md) for new-content
sources/self-review, not deployment evidence. Content review status belongs to the authoring review records, not runtime
checks. Changing preceding introductions/order can affect later stories' taught
sets: bump every affected lesson, not just the edited one.

## Server boundary

`GET /lessons/:lessonId/reader` returns `{ state, cards }`, with a no-store JSON
response. Cards are supplied only after reading has entered revision.

POST accepts URL-encoded fields:

- `intent=reveal`, `attempt_id`, `content_revision`, `occurrence`.
- `intent=finish-reading`, `attempt_id`, `content_revision`.

State is `{ attemptId, contentRevision, phase, revealed, updatedAt, version }`.
The monotonic `version`, not wall-clock time, orders responses inside an attempt.
Attempt identity scopes versions, local flashcard storage, and late writes.

All writes validate session/ownership, same-origin POST, lesson access, attempt,
revision, phase and occurrence revealability. Browser-supplied identities,
milestones, phases or whole reveal lists are not trusted. Repeated fields are
rejected. Authentication/conflict/validation errors are terminal; infrastructure
failures return a retryable status without logging private request values.

Reveals use one SQLite JSON set-add statement with a conditional phase guard and
`RETURNING` snapshot. Duplicate submissions do not duplicate refs; simultaneous
tabs cannot overwrite one another's reveals. SQLite JSON support is documented
in [D1 SQL statements](https://developers.cloudflare.com/d1/sql-api/sql-statements/).

Finish uses one conditional statement to freeze the current server set and
change phase. Nonempty sets enter `revision-flashcards`; an empty set completes
immediately and records first/latest completion dates and content revisions.
Retrying a lost Finish response does not update milestones again. Late reveals
get 409. Revision cards use only the current pass: each character's earliest
**revealed** occurrence in story order and that sentence's final saved/permanent
pinyin, plus all target readings separately.

Learning has two core stages: initial flashcards, then story (the introduction
may precede them). Revision-kind lessons start directly in story. Passing the
contextual deck sends the guarded lesson action `intent=revision-passed`,
`attempt_id`, `content_revision`. A single conditional D1 `UPDATE … RETURNING`
changes `revision-flashcards` to `story`, rotates to a new random attempt ID,
clears the reveal set, and resets the version to zero. It never changes earned
completion milestones or returns to initial flashcards. All taught pinyin is
hidden again; permanent help remains visible. This loop has no pass limit. Only
a zero-reveal reading pass completes the lesson.

No new migration is needed: migration 0003 already supplies attempt identity,
reveal-set, phase, version and milestone fields. Existing complete rows remain
complete; existing frozen decks now lead to a reread. An attempt ID identifies a
reading pass rather than an immutable whole-lesson history. No history is stored.
Only one concurrent revision confirmation wins; other old-pass requests return
409. If a confirmation response is lost, reload to see the new story instead of
replaying the old deck. Phase and identity guards prevent double resets.

Relevant newer content resets the whole unfinished attempt to introduction
(story for a revision-kind lesson), with a fresh ID, cleared reveals and version
zero. First/latest completion milestones and their revisions survive, so later
access remains. A finished lesson stays complete. Older code refuses attempts
with newer revisions rather than downgrading and erasing them.

## Browser boundary

The reader reserves both pinyin and Hanzi lanes from first paint. Each Hanzi has
an independent wrapping unit; following punctuation stays attached. Words may
split across lines, while authored paragraphs remain separate. Permanent-help
tokens are non-buttons with double underlines; hidden/revealed controls differ
without relying on colour. Native buttons support Enter/Space and keep focus.

Help appears immediately and remains visible. Pending refs live in memory only.
Transient network/server failures retry with capped backoff; pending status is
explicit and Finish stays blocked until saves/refreshes settle. Leaving before
success can lose pending refs: this is the agreed no-localStorage trade-off.

Focus/visibility refresh and successful saves retrieve server state, combining it
with local pending help. Version guards ignore stale responses within a pass.
A changed identity freezes an old reader with reload feedback; a newly loaded
pass remounts the reader and aborts old requests. Attempt-scoped flashcard keys
include account, lesson and initial/revision kind, so a recognised local deck
cannot auto-pass the next reading pass, even if the same character needs help.
No continuous live-sync is used. Finish includes other tabs' saved refs, not
their unreceived requests. A stale tab receives actionable reload feedback after
the freeze or pass replacement.

## Verification and limits

`npm test` builds and runs the real local Worker/D1 with isolated accounts.
Reader suites cover polyphony, repeated occurrences, interaction-vs-story order,
later help in the selected sentence, paragraph-independent context, permanent
help, reload/another-device resume, automatic retries, duplicate/concurrent
writes, races with Finish, stale responses, cross-user access, content updates,
milestone preservation, and no-click completion/unlocking.

Desktop (1280px) and narrow (320px) checks compare every occurrence rectangle
before, during and after reveal, verify reserved lane geometry and no page
overflow, and save mixed/all-revealed screenshots under
`.wrangler/playwright-results/reader.browser-*`. These are automated geometry
checks, not a claim of manual visual review of the current stories. Pure/SSR
tests cover public deck derivation and accessible rendering; offline authoring
checks cover data/CLI validation and candidate-over-current composition.

No claim is made for physical phones, Safari/Firefox, screen-reader testing or
final Mandarin approval. Contextual revision uses the shared flashcard loop:
fronts show only the target character; backs add all readings and the frozen
sentence help. Its “Reread story” action starts a clean reading pass, not lesson
completion. Explicit revisits replace only the latest finished attempt, retaining
earned milestones; learning revisits begin with introduction/initial cards,
revision-kind revisits begin in story. Rereads within either kind skip initial
cards. The list offers Resume revisit while that attempt is unfinished and
retains later access based on the first completion milestone.

`tests/progress.ssr.spec.tsx` executes the actual progress operations and SQL with
repository migrations against ephemeral SQLite/JSON1. Together with pure/SSR
checks it runs without a server via
`npx playwright test --config tests/playwright.noserver.config.ts`. It covers
repeated pass identity rotation, cleared help, stale/foreign/wrong-phase writes,
no-click completion, and preserved revisit milestones. This does not substitute
for real Worker/D1 concurrency and browser tests. Run server-backed suites
serially (see `tests/README.md`); never start competing test servers.
An isolated checked four-lesson build (first three plus an early revision) tests
story-first entry separately from the full 55-lesson curriculum (see
`tests/revision-README.md`). Historical #7 hosted verification is in
[the release record](release-7.md), not evidence of expansion deployment. No new schema
migration is required for the reread loop.

### Local verification for the reread loop

Against the earlier three-lesson revision-3 curriculum, serial focused runs passed all 50
Chromium browser cases (completion, reader, updates, auth, curriculum and initial
flashcards), two mobile cases, three isolated revision-kind cases and 28
no-server pure/SSR/SQLite cases. App typecheck and test typecheck also passed.
The integrated run also passed all 80 app cases and 3 isolated revision cases.
The first browser run exposed missing test navigation/phase waits; those waits
were fixed and the affected suites rerun successfully. Hosted release smoke,
remote migration status and local visual inspection are recorded separately
in [release-7.md](release-7.md). Language self-review, not independent human
approval, is the owner-approved workflow.
