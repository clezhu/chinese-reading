export type Character = {
  readonly id: string;
  readonly hanzi: string;
  readonly pinyin: readonly string[];
};

type LessonBase = { readonly id: string; readonly title: string; readonly description: string };
export type LearningLesson = LessonBase & { readonly kind: "learning"; readonly newCharacters: readonly Character[] };
export type RevisionLesson = LessonBase & { readonly kind: "revision"; readonly newCharacters: readonly [] };
export type Lesson = LearningLesson | RevisionLesson;
export type Module = { readonly id: string; readonly title: string; readonly lessons: readonly Lesson[] };
export type Curriculum = { readonly modules: readonly Module[] };

// Structural fixtures for #3, not the final frequency-checked/story curriculum.
// Authored reading lists include dictionary Mandarin readings (not contextual
// tone sandhi). Reference: CC-CEDICT https://www.mdbg.net/chinese/dictionary?page=cedict
// Final character-frequency selection and human language review belong to the
// later content ticket; no story or runtime pronunciation guessing is shipped.
export const curriculum = {
  modules: [
    {
      id: "foundations",
      title: "Foundations",
      lessons: [
        {
          id: "first-characters", title: "First characters", kind: "learning",
          description: "Five familiar sounds, five written characters.",
          newCharacters: [
            { id: "char-de", hanzi: "的", pinyin: ["de", "dī", "dí", "dì"] },
            { id: "char-yi", hanzi: "一", pinyin: ["yī"] },
            { id: "char-shi", hanzi: "是", pinyin: ["shì"] },
            { id: "char-bu", hanzi: "不", pinyin: ["bù"] },
            { id: "char-le", hanzi: "了", pinyin: ["le", "liǎo"] },
          ],
        },
        {
          id: "people-and-places", title: "People and places", kind: "learning",
          description: "Connect people to the world around them.",
          newCharacters: [
            { id: "char-wo", hanzi: "我", pinyin: ["wǒ"] },
            { id: "char-ni", hanzi: "你", pinyin: ["nǐ"] },
            { id: "char-ta", hanzi: "他", pinyin: ["tā"] },
            { id: "char-zai", hanzi: "在", pinyin: ["zài"] },
            { id: "char-ren", hanzi: "人", pinyin: ["rén"] },
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
          newCharacters: [
            { id: "char-you", hanzi: "有", pinyin: ["yǒu", "yòu"] },
            { id: "char-zhe", hanzi: "这", pinyin: ["zhè", "zhèi"] },
            { id: "char-ge", hanzi: "个", pinyin: ["gè", "gě"] },
            { id: "char-shang", hanzi: "上", pinyin: ["shàng", "shǎng"] },
            { id: "char-zhong", hanzi: "中", pinyin: ["zhōng", "zhòng"] },
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
