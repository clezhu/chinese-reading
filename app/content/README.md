# Authored runtime content contract

`curriculum.ts` is the only ordered curriculum. Each learning lesson owns its
five `newCharacters`; revision lessons own none. There is no global character
dictionary, stored cumulative bank, or duplicated module membership on a story.
The three current lessons are #7's original **author-self-reviewed** stories in
`fundamentals-stories.ts`, published locally in the single `foundations` module
named **Fundamentals**. There is no `connections` module. Stable lesson IDs are
`first-characters`, `people-and-places`, and `everyday-connections`; all have
`contentRevision: 3`. This is not independent human approval. Hosted deployment
and smoke evidence are recorded separately in [`docs/release-7.md`](../../docs/release-7.md).

The exact introduction groups are `我的你是了`, `不们这一他`, `么在有个好`,
in SUBTLEX-CH source order. Story lengths are 62/64/68 Hanzi occurrences.
Each story meaningfully uses every introduction, and later stories reuse all
Fibonacci-due characters: group 1 in lesson 2; groups 1 and 2 in lesson 3.
Authored characters are taught + the fixed top-100 pool only. This offline
authoring policy does not become a runtime dictionary or per-user scheduler.

The Chinese/pinyin self-review and checks are recorded in
[`authoring/drafts/REVIEW-7.md`](../../authoring/drafts/REVIEW-7.md).
Future candidates belong outside runtime in `authoring/drafts/`; the old
`initial-stories.ts` path exports an empty list after promotion, keeping its
existing CLI command usable without stale candidates. The earlier illustrative
`fixtures/reader-stories.ts` remains separate, used only by the isolated
structural revision fixture; it is not imported by the published curriculum.

Exports from `curriculum.ts`:

```ts
type Character = { readonly id: string; readonly hanzi: string; readonly pinyin: readonly string[] };
type StoryToken = { readonly hanzi: string; readonly pinyin: string } | string;
type Sentence = readonly StoryToken[];
type Story = { readonly paragraphs: readonly (readonly Sentence[])[] };
// Both LearningLesson and RevisionLesson have:
// contentRevision: number; story?: Story
// Also exported: Lesson, Module, Curriculum, curriculum, orderedLessons,
// findLesson, lessonKindLabel, taughtCharacters.
```

`Character.id === Character.hanzi`: `id` exists only for existing generic
flashcard compatibility. Story tokens have no IDs and do not reference character
IDs. A string token contains punctuation only (possibly a run such as `：“`).
Each token object contains exactly one Hanzi and its explicitly authored
occurrence pronunciation. Arrays are paragraphs → sentences → tokens. Sentences
sharing a paragraph remain independent revision contexts, not visual lines.

`taughtCharacters(lessonId, content = curriculum): Character[]` derives current
and preceding introductions in module/lesson order. Unknown lesson IDs throw.
Hanzi in that set start with pinyin hidden; every other Hanzi has permanent help.
There are no training-wheel flags or allowance lists. Earlier story appearances
do not constitute teaching. A reveal records help use, not individual knowledge.

Occurrence identity is lesson ID + authored content revision + zero-based
paragraph/sentence/token indexes. The reader/server owns its reference wire
format and occurrence enumeration; no extra runtime helper is imposed here.
The offline checker demonstrates revision-scoped bounds/token checks using
`{contentRevision, paragraphIndex, sentenceIndex, tokenIndex}`. Server operations
must additionally check learner/attempt ownership, taught status and phase.

**Bump contentRevision** for story edits that change indexes, characters,
contextual pinyin, taught bank, or flashcard/pronunciation content. A change to
an earlier introduction/order can affect later taught banks: audit and bump
every affected lesson, not just the edited lesson. Cosmetic title/description
edits alone need not bump it. Revisions are positive integers, manually authored,
not hashes or multiple simultaneously active versions. Keep stable lesson IDs.
Existing unversioned fixtures establish revision 1; the illustrative reader
fixtures use revision 2. The actual #7 publication uses revision 3 for all three
lessons, covering new stories, contextual readings, introductions and affected
later taught banks. Future candidates must propose a higher revision, not reuse
3. The server handles stale-attempt reset and preserved completion
milestones; this content package does not store attempts or old story versions.

See [`authoring/README.md`](../../authoring/README.md) for checks/promotion and
[`authoring/PRONUNCIATION.md`](../../authoring/PRONUNCIATION.md) for sources,
reuse terms and pronunciation conventions.
