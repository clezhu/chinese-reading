# Authoring tools

For configurable parallel writing through Herdr, see
[`parallel-authoring.md`](parallel-authoring.md). Its planner and scoped checker
adapt the existing policy/validation core; they do not define separate rules.

This space holds offline authoring resources, not runtime application content.
Published content lives in `app/content/`. The user-requested expansion explicitly
supersedes the former three-lesson cap and fourth-lesson prohibition: the existing
**Fundamentals** module now contains 100 learning lessons and ten latest-50
revision checkpoints (110 stories, 500 introductions), with no unit logic. The
first 55 stories remain unchanged. Learning lessons 51–100 and checkpoints
60/70/80/90/100 are integrated from `app/content/frequency-continuation.ts`,
exporting `frequencyContinuationLessons`, at revision 1; see
[`drafts/next-55-review/`](drafts/next-55-review/) for sources and author self-reviews.
Learning lessons 11–50 and checkpoints
20/30/40/50 are integrated from `app/content/frequency-expansion.ts`, at revision 1;
see [`drafts/next-44-review/`](drafts/next-44-review/) for historical sources, worker
self-reviews and local validation. The first three remain at revision 3;
learning lessons 4–10 and the first checkpoint start at revision 1 in
`app/content/extended-fundamentals.ts`, now integrated by `curriculum.ts`.
See [`drafts/REVIEW-expansion.md`](drafts/REVIEW-expansion.md) for new-content
sources/self-review; integration does not establish deployment. Candidates live
separately in [`drafts/`](drafts/README.md). Never import authoring data, drafts or scheduling
helpers into the app. #7's newly owner-approved rules below supersede the older
frequency flexibility, unfamiliar-character allowance and separate-review gate.
These are static authoring obligations, not per-user progress or runtime scheduling.

## Frequency guidance

Use SUBTLEX-CH's **exact source order**, five introductions per learning lesson:
ranks 1–5, 6–10, 11–15, and so on. The initial sets are `我的你是了`,
`不们这一他`, `么在有个好`. Do not reorder, skip, substitute, merge variants or
rerank ties for natural writing. Read [data provenance and licence](data/README.md)
before modifying or redistributing the table. This subtitle-based,
simplified-oriented source is not a pedagogically validated teaching order.

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

JSON is a static writing brief, containing:

- `prior`, `current`, `combined`: character definitions with authored readings,
  derived from ordered module/lesson introductions; no hand-maintained bank.
- `expectedIntroductions`: the exact next group of five in source order.
- `trainingPool`: the fixed top 100 frequency Hanzi, including any already taught.
- `allowed`: taught (prior + current) **union top 100**. No other story Hanzi.
- `newTargets`, `due`, `revisionTargets`, `mandatory`: occurrence obligations.
- `learningNumber`, `cumulativeIntroduced`, soft `guidance`, and workflow prompts.

The target ID must exist; a candidate may omit its story while obtaining a brief.
The bank command checks structure only, not publication policy. Its
`expectedIntroductions` is authoritative if the proposed group is wrong.
The brief supplies no prior story text: write without
reading previous stories. Current introductions count as taught in their story;
extra appearances do not introduce characters. Unintroduced allowed Hanzi still
receive permanent pinyin automatically; the authoring pool is not a stored
runtime flag, allowance list or global dictionary.

The runtime exports and exact paragraph → sentence → token structure are
documented in [`app/content/README.md`](../app/content/README.md). Read
[`PRONUNCIATION.md`](PRONUNCIATION.md) before authoring reading lists or contextual
pinyin: CC-CEDICT is the primary reference, with a documented supplemental check
for 有 yòu. Dictionary reference material is not imported into runtime content.

## Check content and candidate drafts

```sh
npm run authoring:check                 # published policy + separate structural revision fixture
npm run authoring:check:drafts          # current baseline + initial candidates, if still current
npm run authoring:check -- --draft authoring/drafts/initial-stories.ts
npm run authoring:typecheck             # includes draft TypeScript, not only app files
npm run authoring:test                  # frequency + content/CLI tests
```

Replacement draft modules export `draft` or `drafts` with records
`{ status: "draft", title, lesson }`. Each lesson is a **complete replacement**
for an existing stable lesson ID, proposing a higher `contentRevision`.
Repeated `--draft <path>` arguments validate several candidate modules together.
Duplicate/unknown targets fail. Replacements keep existing module membership and
position. For replacements the checker first validates current content's
structure, then applies full publication policy to the combined candidate-over-
current curriculum, catching cross-lesson conflicts. This allows a replacement
to repair older policy violations; it does not weaken the final candidate check.
Without drafts, `check`/build apply full publication policy to current content.
It never writes or promotes content. TS modules are executable **trusted repo
code**, not an upload format or sandbox.

New lessons may also be authored in `drafts/`, then manually appended to the
runtime curriculum and checked as a whole publication. The replacement CLI is
not an append interface: unknown target IDs still fail.

Checks cover:

- Unique slug module/lesson IDs and nonempty ordered membership; no duplicate
  lesson membership or character introductions. Five introductions per
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

Publication checks additionally enforce exact frequency groups, revision
placement, **at least one occurrence of every new/due/revision target**, and no
Hanzi outside taught + top 100. Meaningful reuse is **self-review only**: a tool
cannot prove naturalness, sentence meaning, complete dictionary coverage or
appropriate polyphonic/neutral choices. Reports include occurrence/taught counts,
permanent-help characters, coverage targets, soft warnings and future `pending`
obligations. A passing check is mechanical evidence, not a claim of language
quality or learner testing.

API: `validatePublishedCurriculum(content)` (or
`validateCurriculum(content, { policy: "published" })`) requires stories and all
canonical rules. CLI checks and the build gate use this API. Generic, small or
storyless fixtures use `validateCurriculum(content, { policy: "structural" })`;
this is the backward-compatible default, **not publication validation**.
`requireStories: true` by itself checks structure, not the canonical policy.
Structural fixtures may model early revision behaviour without falsely failing
the real checkpoint schedule. They must never be promoted as published content.

Tools/tests run on the project's Node >=22.12 with the existing `typescript`
dependency. A tiny authoring-only transpilation loader handles the app's
extensionless TS imports, rather than requiring a new TS runner, changing app
imports, or relying on a newer Node's type-stripping behaviour. No network access
is needed for normal validation/tests; upstream source rechecks are separate.

## Static reuse and revision schedule

Count **learning lessons only**, across module boundaries. A character introduced
at learning lesson `n` is due at `n + {1, 2, 4, 7, 12, 20, 33, …}`: successive gaps
are Fibonacci `1, 1, 2, 3, 5, 8, 13, …`, not offsets `1, 1, 2, 3, …`.
Every learning story must contain its new characters and all characters due at
that learning number. Extra/early appearances never reset or satisfy a later
due obligation. Revision appearances do not advance or reset this clock.

After each 10 learning lessons / 50 introductions, place one revision checkpoint
before the next learning lesson. Introduce zero characters; cover every one of
the **latest 50 introductions** at least once. It does not acquire the next
learning lesson's Fibonacci targets. No early or duplicate checkpoints.

The helper reports each introduced character's next Fibonacci obligation and
the next checkpoint as `pending` beyond the authored sequence. A curriculum
ending at a checkpoint boundary may leave that checkpoint pending; omission
becomes an error only if the next learning lesson is already present. The current
110-story publication includes ten latest-50 checkpoints; later obligations
remain pending, **not missing lessons or errors**. This schedule is an
authoring heuristic, not a claim that research establishes these exact gaps.

## Soft passage-length guidance

Interpolate linearly between these anchors, by **cumulative introductions**:

| Introduced | 5 | 50 | 100 | 250 | 500 | 1000 |
| --- | --- | --- | --- | --- | --- | --- |
| Learning target (Hanzi) | 60 | 75 | 90 | 145 | 230 | 400 |

Cap the learning target at 400 (use 60 below the first anchor). Interpolated
targets need not be integers. Suggested range is `floor(0.75 × target)` through
`ceil(1.25 × target)`. A revision target is **5 × the preceding learning target**
(up to 2000), with the same ±25% range. The first three targets are 60, 61⅔,
63⅓, with integer ranges 45–75, 46–78, 47–80.

Count every Hanzi token occurrence, including repeats and permanent-help
characters; exclude punctuation, pinyin and metadata. Length is **warning only**,
not a coverage exemption, empirical reading-speed claim or forced monotonic
increase. Never pad a natural story to meet a soft range.

## Agent workflow and promotion

1. Read these rules and source notes. Let `authoring:bank` supply the static brief
   and prompt; inspect only small frequency/reference windows. Do not read
   previous stories to construct the next one.
2. Write freely in `drafts/` from that brief: a coherent, natural story using the
   allowed bank and every mandatory target. Use exact introductions and complete
   authored reading lists. Author per-occurrence pinyin, sentences and paragraphs;
   no token IDs, help flags, stored cumulative bank or dictionary inference.
   Aim for enjoyable reading for an orally fluent Mandarin speaker: a complete
   small situation, natural dialogue where useful, not disconnected textbook
   sentences or forced childish exchanges. Repeat new characters often where
   natural, without a fixed count or padding. Change an unworkable premise
   rather than break the character constraints. No theme, continuity, inherited
   style or enforced uniqueness; accidental similarity to another story is fine.
3. **Author self-review**: check meaningful use of every target, naturalness,
   intended meanings, contextual pinyin, reading-list completeness, boundaries
   and permanent-help load. Consult pronunciation references as needed.
4. **Tool check**: validate replacements candidate-over-current, or append new
   lessons and validate the whole publication; inspect hard errors and soft
   reports, run tests/typechecks. Revise, self-review and rerun until hard checks
   pass. No separate reviewer, mandatory fluent-speaker approval or human gate.
   Do not describe a tool pass as proof of meaningfulness or Mandarin quality.
5. Promote replacements manually into their existing `app/content/` lessons,
   preserving stable IDs; append new lessons in authored order with new stable
   IDs and revision 1. Do not import authoring files. Archive/remove stale drafts so an obsolete
   candidate cannot overwrite a newer publication; the checker rejects stale
   proposed revisions rather than silently accepting them.
6. Apply the **manual revision policy**: bump the lesson for changed token indexes,
   story/context pinyin, introductions or flashcard readings. If earlier
   introductions/order alter later taught banks, bump all affected lessons too.
   Cosmetic title/description edits alone need not bump. Keep lesson IDs stable.
   A candidate's proposed revision is not permission to reuse a number already
   published. Old stories need not be retained for attempts; server reset and
   milestone preservation are separate responsibilities.
7. Rerun `authoring:check`, `authoring:typecheck`, `authoring:test`, app/test
   typechecks and the reader/browser suite. Audit the intended 110-story
   publication and that the app cannot import dataset/draft files. Record
   actual self-review and validation results with the relevant review; hosted release verification
   is separate from this toolkit. Do not invent an independent reviewer.
