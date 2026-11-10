import assert from "node:assert/strict";
import { loadContent } from "../authoring/scripts/load-content.mjs";
import { validateCurriculum } from "../authoring/scripts/content-tools.mjs";

const fixture = await loadContent("tests/revision-curriculum.ts");
const published = await loadContent("app/content/curriculum.ts");
const { revisionLessonFixture } = fixture;
const firstLearning = published.orderedLessons()[0];
const result = validateCurriculum(fixture.curriculum, { policy: "structural", requireStories: true });
assert.deepEqual(result.errors, []);
assert.equal(published.orderedLessons().length, 55, "the published curriculum has fifty learning lessons and five checkpoints");
assert.deepEqual(published.orderedLessons().map((lesson) => lesson.kind), Array.from({ length: 5 }, () => [...Array(10).fill("learning"), "revision"]).flat());
assert.deepEqual(revisionLessonFixture.story, firstLearning.story);
assert.equal(revisionLessonFixture.contentRevision, firstLearning.contentRevision);
assert.equal(published.findLesson(revisionLessonFixture.id), undefined);
assert.equal(fixture.orderedLessons().length, 4);
assert.deepEqual(fixture.orderedLessons().filter((lesson) => lesson.id !== revisionLessonFixture.id), published.orderedLessons().slice(0, 3));
for (const lesson of published.orderedLessons().slice(3)) {
  assert.equal(fixture.findLesson(lesson.id), undefined, "expanded lessons must not leak into the early-revision fixture");
}
assert.equal(fixture.findLesson(revisionLessonFixture.id).kind, "revision");
assert.deepEqual(fixture.findLesson(revisionLessonFixture.id).newCharacters, []);
assert.deepEqual(fixture.taughtCharacters(revisionLessonFixture.id), published.taughtCharacters(firstLearning.id));
console.log("Isolated four-lesson revision fixture checked; published 55-lesson curriculum is separate (not language approval).");
