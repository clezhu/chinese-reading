import { readerStories } from "./fixtures/reader-stories";

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

// Checked illustrative reader fixtures, NOT final language-approved curriculum.
// Authored reading lists include dictionary Mandarin readings (not contextual
// tone sandhi). Reference: CC-CEDICT https://www.mdbg.net/chinese/dictionary?page=cedict
// Final character-frequency selection and human language review belong to the
// later content ticket (#7). Never guess occurrence pronunciation at runtime.
export const curriculum = {
  modules: [
    {
      id: "foundations",
      title: "Foundations",
      lessons: [
        {
          id: "first-characters", title: "First characters", kind: "learning",
          description: "Five familiar sounds, five written characters.",
          contentRevision: 2,
          story: readerStories["first-characters"],
          newCharacters: [
            { id: "的", hanzi: "的", pinyin: ["de", "dī", "dí", "dì"] },
            { id: "一", hanzi: "一", pinyin: ["yī", "yāo"] },
            { id: "是", hanzi: "是", pinyin: ["shì"] },
            { id: "不", hanzi: "不", pinyin: ["bù"] },
            { id: "了", hanzi: "了", pinyin: ["le", "liǎo"] },
          ],
        },
        {
          id: "people-and-places", title: "People and places", kind: "learning",
          description: "Connect people to the world around them.",
          contentRevision: 2,
          story: readerStories["people-and-places"],
          newCharacters: [
            { id: "我", hanzi: "我", pinyin: ["wǒ"] },
            { id: "你", hanzi: "你", pinyin: ["nǐ"] },
            { id: "他", hanzi: "他", pinyin: ["tā"] },
            { id: "在", hanzi: "在", pinyin: ["zài"] },
            { id: "人", hanzi: "人", pinyin: ["rén"] },
          ],
        },
      ],
    },
    {
      id: "connections", title: "Building connections",
      lessons: [
        {
          id: "everyday-connections", title: "Everyday connections", kind: "learning",
          description: "Build on the characters you already know.",
          contentRevision: 2,
          story: readerStories["everyday-connections"],
          newCharacters: [
            { id: "有", hanzi: "有", pinyin: ["yǒu", "yòu"] },
            { id: "这", hanzi: "这", pinyin: ["zhè", "zhèi"] },
            { id: "个", hanzi: "个", pinyin: ["gè", "gě"] },
            { id: "上", hanzi: "上", pinyin: ["shàng", "shǎng"] },
            { id: "中", hanzi: "中", pinyin: ["zhōng", "zhòng"] },
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
