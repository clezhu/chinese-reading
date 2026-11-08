import type { RevisionLesson } from "../curriculum";
import { readerStories } from "./reader-stories";

// Checked illustrative fixture, NOT language approval or a published lesson.
// The isolated revision-fixture build reuses an already checked story so its
// familiar characters come entirely from the preceding learning lesson.
export const revisionLessonFixture = {
  id: "fixture-foundations-revision",
  title: "Foundations revision",
  description: "Revisit familiar characters without introducing new ones.",
  kind: "revision",
  contentRevision: 2,
  newCharacters: [],
  story: readerStories["first-characters"],
} as const satisfies RevisionLesson;
