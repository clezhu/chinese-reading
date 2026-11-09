import assert from "node:assert/strict";
import test from "node:test";
import { authoringBrief, authoringPlan, fibonacciOffsets, frequencyGroup, lengthForIntroductions, trainingPool } from "../scripts/authoring-policy.mjs";
import { validateCurriculum, validatePublishedCurriculum } from "../scripts/content-tools.mjs";

const definition = (hanzi) => ({ id: hanzi, hanzi, pinyin: ["a"] });
const story = (hanzi) => ({ paragraphs: [[[...new Set(hanzi)].map((hanzi) => ({ hanzi, pinyin: "a" })).concat("。")]] });
const lessons = (content) => content.modules[0].lessons;
function fixture(count, { checkpoints = true } = {}) {
  const content = { modules: [{ id: "module", title: "Module", lessons: [] }] };
  for (let n = 1; n <= count; n++) {
    lessons(content).push({ id: `learning-${n}`, title: "Learning", description: "Structural policy fixture", kind: "learning", contentRevision: 1, newCharacters: frequencyGroup(n).map(definition) });
    if (checkpoints && n % 10 === 0) lessons(content).push({ id: `revision-${n}`, title: "Revision", description: "Checkpoint", kind: "revision", contentRevision: 1, newCharacters: [] });
  }
  const { plans } = authoringPlan(content);
  lessons(content).forEach((lesson, index) => lesson.story = story(plans[index].mandatory));
  return content;
}
const remove = (lesson, hanzi) => { lesson.story.paragraphs[0][0] = lesson.story.paragraphs[0][0].filter((token) => token.hanzi !== hanzi); };

test("length interpolates every segment, respects anchors and caps learning target at 400", () => {
  for (const [count, target] of [[5, 60], [50, 75], [100, 90], [250, 145], [500, 230], [1000, 400], [2000, 400]]) {
    assert.equal(lengthForIntroductions(count).target, target);
  }
  for (const [count, target] of [[0, 60], [10, 60 + 5 / 3], [75, 82.5], [175, 117.5], [375, 187.5], [750, 315]]) {
    const guidance = lengthForIntroductions(count);
    assert.equal(guidance.target, target);
    assert.equal(guidance.min, Math.floor(target * 0.75));
    assert.equal(guidance.max, Math.ceil(target * 1.25));
  }
  assert.deepEqual(lengthForIntroductions(50, { revision: true }), { target: 375, min: 281, max: 469, unit: "Hanzi occurrences" });
  assert.equal(lengthForIntroductions(1000, { revision: true }).target, 2000);
  for (const count of [-1, 1.5, NaN]) assert.throws(() => lengthForIntroductions(count));
});

test("Fibonacci uses successive gaps, including both initial ones", () => {
  assert.deepEqual(fibonacciOffsets(0), []);
  assert.deepEqual(fibonacciOffsets(1), [1]);
  assert.deepEqual(fibonacciOffsets(3), [1, 2]);
  assert.deepEqual(fibonacciOffsets(33), [1, 2, 4, 7, 12, 20, 33]);
  assert.throws(() => fibonacciOffsets(-1));
});

test("brief supplies definitions, top100, allowed and mandatory without previous story text", () => {
  const content = fixture(3), brief = authoringBrief(content, "learning-3");
  assert.equal(brief.prior.length, 10);
  assert.equal(brief.current.length, 5);
  assert.equal(brief.combined.length, 15);
  assert.equal(brief.trainingPool.length, 100);
  assert.deepEqual(brief.expectedIntroductions, [..."么在有个好"]);
  assert.deepEqual(brief.due, [..."我的你是了不们这一他"]);
  assert.equal(brief.mandatory.length, 15);
  assert.equal(brief.allowed.length, 100);
  assert.ok(!JSON.stringify(brief).includes("paragraphs"));
  assert.throws(() => authoringBrief(content, "missing"), /Unknown lesson/);
});

test("canonical publication enforces exact five-character frequency groups; structural mode is explicit", () => {
  const content = fixture(3);
  assert.deepEqual(validatePublishedCurriculum(content).errors, []);
  assert.deepEqual(frequencyGroup(1), [..."我的你是了"]);
  assert.deepEqual(frequencyGroup(2), [..."不们这一他"]);
  const first = lessons(content)[0];
  [first.newCharacters[0], first.newCharacters[1]] = [first.newCharacters[1], first.newCharacters[0]];
  assert.deepEqual(validateCurriculum(content, { policy: "structural", requireStories: true }).errors, []);
  assert.match(validatePublishedCurriculum(content).errors.join("\n"), /exact frequency introductions/);
  assert.throws(() => validateCurriculum(content, { policy: "unknown" }), /Unknown validation policy/);
  assert.throws(() => frequencyGroup(0));
  assert.throws(() => frequencyGroup(9999));
});

test("top100 boundary and taught outside top100 are allowed; other Hanzi are hard errors", () => {
  const content = fixture(1), first = lessons(content)[0];
  first.story.paragraphs[0][0].unshift({ hanzi: trainingPool[99], pinyin: "a" });
  assert.deepEqual(validatePublishedCurriculum(content).errors, []);
  const rank101 = frequencyGroup(21)[0];
  assert.ok(!trainingPool.includes(rank101));
  first.story.paragraphs[0][0].unshift({ hanzi: rank101, pinyin: "a" });
  assert.match(validatePublishedCurriculum(content).errors.join("\n"), /illegal Hanzi/);
  assert.deepEqual(validateCurriculum(content, { policy: "structural" }).errors, []);
  const later = fixture(22);
  lessons(later).at(-1).story.paragraphs[0][0].unshift({ hanzi: rank101, pinyin: "a" });
  assert.deepEqual(validatePublishedCurriculum(later).errors, []);
});

test("all new and due targets require one occurrence, not a minimum reuse count", () => {
  const content = fixture(5), first = lessons(content)[0];
  assert.deepEqual(validatePublishedCurriculum(content).errors, []);
  const missing = first.newCharacters[0].hanzi;
  remove(first, missing);
  assert.match(validatePublishedCurriculum(content).errors.join("\n"), /learning-1: missing mandatory target/);
  first.story = story(authoringBrief(content, first.id).mandatory);
  // Unscheduled appearance at lesson 4 does not reset the lesson-5 obligation.
  lessons(content)[3].story.paragraphs[0][0].unshift({ hanzi: missing, pinyin: "a" });
  assert.deepEqual(validatePublishedCurriculum(content).errors, []);
  remove(lessons(content)[4], missing);
  assert.match(validatePublishedCurriculum(content).errors.join("\n"), /learning-5: missing mandatory target/);
  assert.ok(!authoringBrief(content, "learning-4").due.includes(missing));
});

test("training-wheel pool is fully taught at 100 introductions and cannot expand later", () => {
  const content = fixture(21);
  lessons(content)[0].story.paragraphs[0][0].unshift({ hanzi: trainingPool[99], pinyin: "a" });
  const plan = authoringBrief(content, "learning-20");
  assert.equal(plan.combined.length, 100);
  assert.deepEqual(new Set(plan.allowed), new Set(plan.combined.map(({ hanzi }) => hanzi)));
  const result = validatePublishedCurriculum(content);
  assert.deepEqual(result.errors, []);
  assert.ok(result.reports[0].permanentHelp.includes(trainingPool[99]));
  const after100 = result.reports.findIndex(({ lessonId }) => lessonId === "learning-20");
  assert.ok(result.reports.slice(after100).every(({ permanentHelp }) => permanentHelp.length === 0));
});

test("revision checkpoints cover latest50, skip Fibonacci clock and never reset it", () => {
  const content = fixture(21), { plans } = authoringPlan(content);
  assert.deepEqual(validatePublishedCurriculum(content).errors, []);
  const revision10 = plans.find((plan) => plan.lessonId === "revision-10");
  const revision20 = plans.find((plan) => plan.lessonId === "revision-20");
  assert.equal(revision10.learningNumber, 10);
  assert.equal(revision10.mandatory.length, 50);
  assert.equal(revision10.current.length, 0);
  assert.deepEqual(revision10.due, []);
  assert.deepEqual(revision20.revisionTargets, Array.from({ length: 10 }, (_, i) => frequencyGroup(i + 11)).flat());
  assert.equal(revision10.guidance.target, 5 * plans.find((plan) => plan.lessonId === "learning-10").guidance.target);
  const learning11 = plans.find((plan) => plan.lessonId === "learning-11");
  assert.deepEqual(learning11.due, [4, 7, 9, 10].flatMap(frequencyGroup));
  const learning14 = plans.find((plan) => plan.lessonId === "learning-14");
  assert.ok(frequencyGroup(2).every((hanzi) => learning14.due.includes(hanzi))); // age12, despite revision
  const revision = lessons(content).find((lesson) => lesson.id === "revision-20");
  remove(revision, revision20.revisionTargets[0]);
  assert.match(validatePublishedCurriculum(content).errors.join("\n"), /revision-20: missing mandatory target/);
});

test("checkpoint boundaries reject misplaced/duplicate or skipped revisions, not future obligations", () => {
  const short = fixture(3), result = validatePublishedCurriculum(short);
  assert.deepEqual(result.errors, []);
  assert.equal(lessons(short).length, 3);
  assert.ok(result.pending.some((entry) => entry.type === "fibonacci" && entry.introducedAt === 2 && entry.learningNumber === 4));
  assert.ok(result.pending.some((entry) => entry.type === "revision" && entry.afterLearningNumber === 10));
  assert.ok(result.pending.every((entry) => entry.status === "pending"));
  const atBoundary = fixture(10, { checkpoints: false });
  assert.deepEqual(validatePublishedCurriculum(atBoundary).errors, []);
  assert.equal(validatePublishedCurriculum(atBoundary).pending.at(-1).afterLearningNumber, 10);
  assert.match(validatePublishedCurriculum(fixture(11, { checkpoints: false })).errors.join("\n"), /missing revision checkpoint/);
  const misplaced = fixture(10);
  const revision = lessons(misplaced).pop();
  lessons(misplaced).splice(9, 0, revision);
  assert.match(validatePublishedCurriculum(misplaced).errors.join("\n"), /revision checkpoint must occur/);
  const duplicate = fixture(10);
  lessons(duplicate).push({ ...structuredClone(lessons(duplicate).at(-1)), id: "duplicate-revision" });
  assert.match(validatePublishedCurriculum(duplicate).errors.join("\n"), /revision checkpoint must occur/);
});

test("short stories warn only, and publication requires stories even without an option", () => {
  const content = fixture(1), result = validatePublishedCurriculum(content);
  assert.deepEqual(result.errors, []);
  assert.match(result.warnings.join("\n"), /soft range/);
  delete lessons(content)[0].story;
  assert.match(validatePublishedCurriculum(content).errors.join("\n"), /requires a story/);
});
