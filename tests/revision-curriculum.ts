import {
  curriculum as published,
  findLesson as publishedFindLesson,
  orderedLessons as publishedOrderedLessons,
  taughtCharacters as publishedTaughtCharacters,
  type Curriculum,
  type RevisionLesson,
} from "../app/content/curriculum";

const firstLearning = publishedOrderedLessons()[0];
// Test-only content follows the currently published first story and revision;
// never keep stale copies of its tokens/character selection in this adapter.
export const revisionLessonFixture: RevisionLesson = {
  id: "fixture-foundations-revision", title: "Foundations revision",
  description: "Revisit familiar characters without introducing new ones.",
  kind: "revision", contentRevision: firstLearning.contentRevision,
  newCharacters: [], story: firstLearning.story,
};

export type { Character, StoryToken, Sentence, Story, LearningLesson, RevisionLesson, Lesson, Module, Curriculum } from "../app/content/curriculum";
export { lessonKindLabel } from "../app/content/curriculum";

// Build-only replacement, never imported by production application code. Keep
// this deliberately small early-revision scenario isolated from the expanded
// published checkpoint; the normal browser suite covers the full curriculum.
// Reuse only the unchanged original three entries and the real helper functions.
export const curriculum: Curriculum = {
  modules: [{
    ...published.modules[0],
    lessons: [firstLearning, revisionLessonFixture, ...publishedOrderedLessons().slice(1, 3)],
  }],
};

export const orderedLessons = (content: Curriculum = curriculum) => publishedOrderedLessons(content);
export const findLesson = (id: string, content: Curriculum = curriculum) => publishedFindLesson(id, content);
export const taughtCharacters = (id: string, content: Curriculum = curriculum) => publishedTaughtCharacters(id, content);
