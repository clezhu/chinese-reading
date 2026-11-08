# Authored runtime content contract

`curriculum.ts` is the only ordered curriculum. Each learning lesson owns its
five `newCharacters`; revision lessons own none. There is no global character
dictionary, stored cumulative bank, or duplicated module membership on a story.
The three current lessons and stories are **illustrative fixtures**, not the
final language-approved release. Actual candidate stories are outside runtime
content under [`authoring/drafts/`](../../authoring/drafts/).

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
Existing unversioned fixtures establish revision 1; the reader fixtures use
revision 2 because stories and practice readings changed. Unapproved candidates
propose revision 3. The server handles stale-attempt reset and preserved completion
milestones; this content package does not store attempts or old story versions.

See [`authoring/README.md`](../../authoring/README.md) for checks/promotion and
[`authoring/PRONUNCIATION.md`](../../authoring/PRONUNCIATION.md) for sources,
reuse terms and pronunciation conventions.
