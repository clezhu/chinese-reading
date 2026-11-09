import assert from "node:assert/strict";
import { loadContent } from "../authoring/scripts/load-content.mjs";
import { validateCurriculum } from "../authoring/scripts/content-tools.mjs";

const fixture = await loadContent("tests/revision-curriculum.ts");
const published = await loadContent("app/content/curriculum.ts");
const { revisionLessonFixture } = fixture;
const firstLearning = published.orderedLessons()[0];
const result = validateCurriculum(fixture.curriculum, { requireStories: true });
assert.deepEqual(result.errors, []);
assert.equal(published.orderedLessons().length, 3, "the published curriculum must stay at three lessons");
assert.deepEqual(revisionLessonFixture.story, firstLearning.story);
assert.equal(revisionLessonFixture.contentRevision, firstLearning.contentRevision);
assert.equal(published.findLesson(revisionLessonFixture.id), undefined);
assert.equal(fixture.orderedLessons().length, 4);
assert.equal(fixture.findLesson(revisionLessonFixture.id).kind, "revision");
assert.deepEqual(fixture.findLesson(revisionLessonFixture.id).newCharacters, []);
assert.deepEqual(fixture.taughtCharacters(revisionLessonFixture.id), published.taughtCharacters(firstLearning.id));
console.log("Revision fixture curriculum checked; published curriculum remains three lessons (not language approval).");
