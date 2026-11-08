import { curriculum, taughtCharacters, type Character, type Curriculum, type Lesson } from "../content/curriculum";

/** JSON wire contract shared by the reader loader, actions, and refresh endpoint.
 * version is a server-monotonic counter within an attempt (not a timestamp).
 * Occurrence references are zero-based `paragraph:sentence:token`, scoped by
 * lesson + contentRevision. Only saved reveals belong in this DTO.
 */
export type StoryState = {
  attemptId: string;
  contentRevision: number;
  phase: "introduction" | "flashcards" | "story" | "revision-flashcards" | "complete";
  revealed: string[];
  updatedAt: number;
  version: number;
};

export type StoryOccurrence = {
  ref: string;
  paragraphIndex: number;
  sentenceIndex: number;
  tokenIndex: number;
  hanzi: string;
  pinyin: string;
  permanent: boolean;
};

/** Character occurrences only, in story order; punctuation keeps its token index
 * but is never enumerated/revealable. Unknown lesson IDs fail closed.
 */
export function enumerateStory(lesson: Lesson, content: Curriculum = curriculum): StoryOccurrence[] {
  const taught = new Set(taughtCharacters(lesson.id, content).map((character) => character.hanzi));
  return (lesson.story?.paragraphs ?? []).flatMap((paragraph, paragraphIndex) =>
    paragraph.flatMap((sentence, sentenceIndex) => sentence.flatMap((token, tokenIndex) =>
      typeof token === "string" ? [] : [{
        ref: `${paragraphIndex}:${sentenceIndex}:${tokenIndex}`,
        paragraphIndex, sentenceIndex, tokenIndex,
        hanzi: token.hanzi, pinyin: token.pinyin, permanent: !taught.has(token.hanzi),
      }],
    )),
  );
}

/** Punctuation stays a string. `revealed` means saved help on that occurrence;
 * `showPinyin` includes permanent help. Neither is inferred from the target.
 */
export type RevisionSentenceToken = string | (StoryOccurrence & { revealed: boolean; showPinyin: boolean });
export type RevisionCard = {
  character: Character;
  /** Earliest REVEALED occurrence, not first appearance or interaction order. */
  occurrence: StoryOccurrence;
  /** Exactly its authored sentence, with final saved/permanent visibility. */
  sentence: RevisionSentenceToken[];
};

/** Pure derived deck; no stored deck, click ordering, or mastery state. Invalid,
 * duplicate and permanent-help references cannot add cards. Ordering is by the
 * selected occurrence in story order. Call with the frozen saved set for revision.
 */
export function revisionCards(lesson: Lesson, revealed: readonly string[], content: Curriculum = curriculum): RevisionCard[] {
  const saved = new Set(revealed);
  const occurrences = enumerateStory(lesson, content);
  const byRef = new Map(occurrences.map((occurrence) => [occurrence.ref, occurrence]));
  const characters = new Map(taughtCharacters(lesson.id, content).map((character) => [character.hanzi, character]));
  const selected = new Set<string>();
  const cards: RevisionCard[] = [];
  for (const occurrence of occurrences) {
    if (occurrence.permanent || !saved.has(occurrence.ref) || selected.has(occurrence.hanzi)) continue;
    selected.add(occurrence.hanzi);
    const { paragraphIndex, sentenceIndex } = occurrence;
    const sentence = lesson.story!.paragraphs[paragraphIndex][sentenceIndex].map((token, tokenIndex): RevisionSentenceToken => {
      if (typeof token === "string") return token;
      const entry = byRef.get(`${paragraphIndex}:${sentenceIndex}:${tokenIndex}`)!;
      const revealed = !entry.permanent && saved.has(entry.ref);
      return { ...entry, revealed, showPinyin: entry.permanent || revealed };
    });
    cards.push({ character: characters.get(occurrence.hanzi)!, occurrence, sentence });
  }
  return cards;
}
