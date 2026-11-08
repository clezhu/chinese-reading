# Authoring tools

This space holds offline authoring resources, not runtime application content. Published content lives in `app/content/`; its current three lessons are illustrative checked reader fixtures, **not final language-approved lessons**. Actual first drafts live separately in [`drafts/`](drafts/README.md), awaiting #7. Do not import the frequency dataset or drafts into the app. Frequency guides character selection, not a learner's saved progress or an obligatory teaching sequence.

## Frequency guidance

Use SUBTLEX-CH's character frequencies as the default guide. Read [data provenance and licence](data/README.md) before modifying or redistributing the table. Small changes among common characters are allowed for natural writing. This is a subtitle-based, simplified-oriented list, not a perfectly simplified-only list or a pedagogically validated teaching order. Review variants; do not silently merge them.

Request a small candidate window rather than reading the entire dataset into an agent's context:

```sh
npm run authoring:frequency -- --limit 30
npm run authoring:frequency -- --start 20 --limit 20 --exclude 我的是
npm run authoring:test
```

`--start` is the inclusive original source rank. Exclusions are applied before taking `--limit` results; returned ranks are never renumbered. Output includes only rank, character, and raw count. Limits are 1–200; default 30. The full UTF-8 JSON is available to code on disk, with all original numeric columns.

Reproduce or verify the dataset (Python 3, standard library only):

```sh
npm run authoring:frequency:import
python3 authoring/scripts/import_frequency.py --check
# Reuse a local source ZIP without network access:
python3 authoring/scripts/import_frequency.py --archive /path/to/Files_S1.zip --check
```

The importer verifies a pinned SHA-256 before decoding GB18030 and generating UTF-8. A changed checksum is a review requirement, not an invitation to bypass verification.

## Inspect the available bank

```sh
npm run authoring:bank -- first-characters
npm run authoring:bank -- everyday-connections
# Inspect proposed introductions as well as the current ones:
npm run authoring:bank -- people-and-places --draft authoring/drafts/initial-stories.ts
```

JSON contains `prior`, `current`, and `combined` character definitions (including
all authored lexical readings), derived from ordered module/lesson introductions.
The target ID must exist. There is no manually maintained cumulative bank or
global dictionary. Current lesson introductions count as taught during its story;
mere appearances in earlier stories do not. Other Hanzi get permanent pinyin
automatically, not a stored flag or exception list.

The runtime exports and exact paragraph → sentence → token structure are
documented in [`app/content/README.md`](../app/content/README.md). Read
[`PRONUNCIATION.md`](PRONUNCIATION.md) before authoring reading lists or contextual
pinyin: CC-CEDICT is the primary reference, with a documented supplemental check
for 有 yòu. Dictionary reference material is not imported into runtime content.

## Check content and candidate drafts

```sh
npm run authoring:check                 # current curriculum + revision-kind fixture
npm run authoring:check:drafts          # current baseline, then all three candidates together
npm run authoring:check -- --draft authoring/drafts/initial-stories.ts
npm run authoring:typecheck             # includes draft TypeScript, not only app files
npm run authoring:test                  # frequency + content/CLI tests
```

Draft modules export `draft` or `drafts` with records
`{ status: "draft", title, lesson }`. Each lesson is a **complete replacement**
for an existing stable lesson ID, proposing a higher `contentRevision`.
Repeated `--draft <path>` arguments validate several candidate modules together.
Duplicate/unknown targets fail. Replacements keep existing module membership and
position. The checker first validates current content, then validates the combined
candidate-over-current curriculum, catching cross-lesson introduction conflicts.
It never writes or promotes content. TS modules are executable **trusted repo
code**, not an upload format or sandbox.

Checks cover:

- Unique slug module/lesson IDs and nonempty ordered membership; no duplicate
  lesson membership or character introductions. Five introductions per initial
  learning lesson, none per revision lesson. Character compatibility `id` equals
  `hanzi`, and each has a nonempty, unique, correctly spelled pinyin list.
- Positive authored revisions and nested nonempty paragraphs/sentences/token
  arrays. One Hanzi per object, one authored syllable per occurrence; string
  tokens contain punctuation only. Reject unknown token/structure fields and
  obvious multiple sentences in one sentence array. Published/candidate lesson
  checks require a story; the separate structural revision fixture may remain
  storyless. `npm run build` gates publication on current-content validation.
- Pronunciation consistency with lesson-owned reading lists where established,
  including documented 一/不 sandhi and neutral-tone spelling. No runtime
  pronunciation guessing or external dictionary dependency.
- Revision-scoped occurrence bounds and Hanzi-versus-punctuation references via
  the exported offline `validateOccurrenceReference(lesson, reference)` helper
  and tests. The server owns its wire format and additional authorization,
  attempt, phase and revealability checks.

Reports include Hanzi occurrence count, taught occurrences and distinct
permanent-help characters for language review. Unfamiliar characters are **not
validity errors**. A checker cannot prove complete dictionary coverage,
naturalness, correct sentence meaning or appropriate polyphonic/neutral choices.
It does not imply Mandarin approval, progression correctness or learner testing.
See the exact scope and outstanding approval in `PRONUNCIATION.md`.

Tools/tests run on the project's Node >=22.12 with the existing `typescript`
dependency. A tiny authoring-only transpilation loader handles the app's
extensionless TS imports, rather than requiring a new TS runner, changing app
imports, or relying on a newer Node's type-stripping behaviour. No network access
is needed for normal validation/tests; upstream source rechecks are separate.

## Soft passage-length guidance

For 1-based **learning lesson level** `n` in curriculum order:

```text
target = min(200, 60 + 20 × (n − 1)) Hanzi occurrences
suggested range = floor(0.75 × target) … ceil(1.25 × target)
```

Thus initial ranges are 45–75, 60–100, and 75–125 Hanzi. Count every occurrence
of a Hanzi token, including permanent-help characters and repeats; exclude
punctuation, pinyin, spaces and metadata. Revision-kind stories use the preceding
learning level (at least 1) and do not advance it. Six short sentences at the
first target allow a tiny narrative; modest growth offers more reuse without
turning early practice into an essay. The 200 target cap remains short even as
the bank grows. This is a drafting heuristic, not an empirical reading-speed or
curriculum claim. It is deliberately **soft**: shorter/longer texts only get a
warning, and stories need not grow monotonically. Never pad a natural story to
satisfy the formula. Review permanent-help load separately from length.

## Agent workflow and promotion

1. Read these instructions and provenance notes; inspect the target and prior/
   current/combined bank. Query a small frequency window, excluding already
   introduced Hanzi if choosing future introductions. Current three sets and
   stable lesson IDs are preserved for compatibility; frequency does not certify
   their exact ordering as final curriculum.
2. Choose five introductions with complete authored reading lists and source
   checks. Avoid duplicate introductions. Revision lessons introduce none.
3. Create/edit candidate records in `drafts/`. Draft a natural, coherent story,
   deliberately reusing earlier introductions and using each current character.
   Author every occurrence's pinyin, sentence boundary and paragraph boundary.
   No IDs, help flags, stored cumulative bank or dictionary inference on tokens.
4. Run candidate-over-current validation, inspect length/permanent-help reports,
   run authoring tests/typecheck, and resolve structural/pronunciation conflicts.
5. Obtain a separate Mandarin review of all readings, contextual pinyin,
   naturalness and help load. Record actual reviewer/date/outstanding questions in
   #7. Do **not** relabel a draft approved because a validator passed. Revise and
   rerun checks after review changes.
6. Only after approval, manually move the reviewed story/introductions into its
   existing `app/content/` lesson. Do not import `authoring/` from the app or add
   the draft as a fourth lesson. Replace illustrative fixtures rather than
   retaining multiple active story versions; archive/remove stale drafts so an
   obsolete candidate cannot silently overwrite a future published revision.
7. Apply the **manual revision policy**: bump the lesson for changed token indexes,
   story/context pinyin, introductions or flashcard readings. If earlier
   introductions/order alter later taught banks, bump all affected lessons too.
   Cosmetic title/description edits alone need not bump. Keep lesson IDs stable.
   A candidate's proposed revision is not permission to reuse a number already
   published. Old stories need not be retained for attempts; server reset and
   milestone preservation are separate responsibilities.
8. Rerun `authoring:check`, `authoring:typecheck`, `authoring:test`, app/test
   typechecks and the reader/browser suite. Audit that only the intended three
   lessons are published and the app cannot import dataset/draft files. #7 owns
   final approval and hosted release validation; this toolkit does not deploy.
