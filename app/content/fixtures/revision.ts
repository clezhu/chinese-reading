import type { RevisionLesson } from "../curriculum";

// Importable for content/list checks only. Not in the published curriculum.
export const revisionLessonFixture = {
  id: "fixture-foundations-revision",
  title: "Foundations revision",
  description: "Revisit familiar characters without introducing new ones.",
  kind: "revision",
  newCharacters: [],
} as const satisfies RevisionLesson;
