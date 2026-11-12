import assert from "node:assert/strict";
import { loadContent } from "../authoring/scripts/load-content.mjs";
import { validateCurriculum } from "../authoring/scripts/content-tools.mjs";

const fixture = await loadContent("tests/revision-curriculum.ts");
const published = await loadContent("app/content/curriculum.ts");
const { revisionLessonFixture } = fixture;
const firstLearning = published.orderedLessons()[0];
const result = validateCurriculum(fixture.curriculum, { policy: "structural", requireStories: true });
assert.deepEqual(result.errors, []);
const publishedLessons = published.orderedLessons();
const introductions = publishedLessons.flatMap((lesson) => lesson.newCharacters);
assert.equal(publishedLessons.length, 165, "the published curriculum has 165 stories");
assert.equal(publishedLessons.filter((lesson) => lesson.kind === "learning").length, 150, "the published curriculum has 150 learning lessons");
assert.equal(publishedLessons.filter((lesson) => lesson.kind === "revision").length, 15, "the published curriculum has fifteen revision checkpoints");
assert.equal(introductions.length, 750, "the published curriculum has 750 introductions");
assert.equal(new Set(introductions.map((character) => character.hanzi)).size, 750, "all 750 introduced characters are unique");
assert.deepEqual(publishedLessons.map((lesson) => lesson.kind), Array.from({ length: 15 }, () => [...Array(10).fill("learning"), "revision"]).flat());
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
console.log("Isolated four-lesson revision fixture checked; published 165-story curriculum (150 learning, fifteen revisions, 750 introductions) is separate (not language approval).");
