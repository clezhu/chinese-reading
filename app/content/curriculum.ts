import { fundamentalsStories } from "./fundamentals-stories";

export type Character = {
  /** Compatibility key for flashcards; equal to hanzi, not a second identity. */
  readonly id: string;
  readonly hanzi: string;
  readonly pinyin: readonly string[];
};

export type StoryToken = { readonly hanzi: string; readonly pinyin: string } | string;
export type Sentence = readonly StoryToken[];
export type Story = { readonly paragraphs: readonly (readonly Sentence[])[] };

type LessonBase = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly contentRevision: number;
  readonly story?: Story;
};
export type LearningLesson = LessonBase & { readonly kind: "learning"; readonly newCharacters: readonly Character[] };
export type RevisionLesson = LessonBase & { readonly kind: "revision"; readonly newCharacters: readonly never[] };
export type Lesson = LearningLesson | RevisionLesson;
export type Module = { readonly id: string; readonly title: string; readonly lessons: readonly Lesson[] };
export type Curriculum = { readonly modules: readonly Module[] };

// #7's original stories, author self-reviewed (not independent human approval).
// Exact SUBTLEX-CH introduction order; dictionary Mandarin reading lists exclude
// contextual tone sandhi. Sources/scope: authoring/PRONUNCIATION.md.
// Review record: authoring/drafts/REVIEW-7.md. Never infer pinyin at runtime.
export const curriculum = {
  modules: [
    {
      id: "foundations",
      title: "Fundamentals",
      lessons: [
        {
          id: "first-characters", title: "First characters", kind: "learning",
          description: "Two siblings discover that their mother belongs to both of them.",
          contentRevision: 3,
          story: fundamentalsStories["first-characters"],
          newCharacters: [
            { id: "我", hanzi: "我", pinyin: ["wǒ"] },
            { id: "的", hanzi: "的", pinyin: ["de", "dī", "dí", "dì"] },
            { id: "你", hanzi: "你", pinyin: ["nǐ"] },
            { id: "是", hanzi: "是", pinyin: ["shì"] },
            { id: "了", hanzi: "了", pinyin: ["le", "liǎo"] },
          ],
        },
        {
          id: "people-and-places", title: "People and places", kind: "learning",
          description: "A quiet storyteller finds the courage to join the conversation.",
          contentRevision: 3,
          story: fundamentalsStories["people-and-places"],
          newCharacters: [
            { id: "不", hanzi: "不", pinyin: ["bù"] },
            { id: "们", hanzi: "们", pinyin: ["men", "mén"] },
            { id: "这", hanzi: "这", pinyin: ["zhè", "zhèi"] },
            { id: "一", hanzi: "一", pinyin: ["yī", "yāo"] },
            { id: "他", hanzi: "他", pinyin: ["tā"] },
          ],
        },
        {
          id: "everyday-connections", title: "Everyday connections", kind: "learning",
          description: "A second pastry turns a possessive moment into a chance to share.",
          contentRevision: 3,
          story: fundamentalsStories["everyday-connections"],
          newCharacters: [
            { id: "么", hanzi: "么", pinyin: ["me", "mó", "ma", "má", "yāo"] },
            { id: "在", hanzi: "在", pinyin: ["zài"] },
            { id: "有", hanzi: "有", pinyin: ["yǒu", "yòu"] },
            { id: "个", hanzi: "个", pinyin: ["gè", "gě"] },
            { id: "好", hanzi: "好", pinyin: ["hǎo", "hào"] },
          ],
        },
      ],
    },
  ],
} as const satisfies Curriculum;

export function orderedLessons(content: Curriculum = curriculum): readonly Lesson[] {
  return content.modules.flatMap((module) => module.lessons);
}

export function findLesson(lessonId: string, content: Curriculum = curriculum): Lesson | undefined {
  return orderedLessons(content).find((lesson) => lesson.id === lessonId);
}

export function lessonKindLabel(lesson: Lesson) {
  return lesson.kind === "revision" ? "Revision" : "Learning";
}

/** Current and preceding introductions. Unknown IDs fail closed. */
export function taughtCharacters(lessonId: string, content: Curriculum = curriculum): Character[] {
  const lessons = orderedLessons(content);
  const index = lessons.findIndex((lesson) => lesson.id === lessonId);
  if (index < 0) throw new Error(`Unknown lesson: ${lessonId}`);
  return lessons.slice(0, index + 1).flatMap((lesson) => [...lesson.newCharacters]);
}
