# Reader implementation (#5)

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

The current illustrative reader fixtures use revision 2; revision 1 is the
pre-reader fixture baseline used for migrated rows. Actual story drafts propose
revision 3 but are not yet approved or published. Changing preceding
introductions/order can affect later stories' taught sets: bump every affected
lesson, not just the edited one.

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
and records first/latest completion dates and content revisions. Retrying a lost
Finish response does not update milestones again. Late reveals get 409. Revision
cards use each character's earliest **revealed** occurrence in story order and
that sentence's final saved/permanent pinyin, plus all target readings separately.

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
with local pending help. Version guards ignore stale responses. No continuous
live-sync is used. Finish includes other tabs' saved refs, not their unreceived
requests. A stale tab receives actionable reload feedback after the freeze.

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
`.wrangler/playwright-results/reader.browser-*`. Both mixed screenshots were
visually inspected during implementation. Pure/SSR tests cover public deck
derivation and accessible rendering; offline authoring checks cover data/CLI
validation and candidate-over-current composition.

No claim is made for physical phones, Safari/Firefox, screen-reader testing or
final Mandarin approval. Revision mastery now uses the shared flashcard loop:
fronts show only the target character; backs add all readings and the frozen
sentence help. A passed revision deck completes through the guarded lesson
action. Explicit revisits replace only the latest attempt, retaining earned
milestones; the list offers Resume revisit while that attempt is unfinished.
An isolated checked revision-kind build tests story-first entry without adding
a published lesson (see `tests/revision-README.md`). #7 owns final
story review/promotion and complete hosted release verification. This change
does not deploy or apply remote migrations.
