import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { execFileSync } from "node:child_process";
import { applyWorkerLessons, checkRun, makeBatch, planRun, quoteShellArgument, sealRun, verifySealedRun } from "../scripts/authoring-batch.mjs";
import { launchAuthoring } from "../scripts/launch-authoring.mjs";
import { authoringBrief, authoringPlan, frequencyGroup, nextLessonSpec, trainingPool } from "../scripts/authoring-policy.mjs";
import { validatePlannedLessons, validatePublishedCurriculum } from "../scripts/content-tools.mjs";
import { loadContent, repoRoot } from "../scripts/load-content.mjs";

const lessons = (content) => content.modules.flatMap((module) => module.lessons);
const lessonById = (content, id) => lessons(content).find((lesson) => lesson.id === id);
const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const saveJson = (path, value) => writeFile(path, `${JSON.stringify(value, null, 2)}\n`);

test("generated shell arguments preserve expansions, quotes and whitespace literally", () => {
  for (const path of ["/tmp/with spaces", "/tmp/'quoted'", "/tmp/$HOME/$(false)/`false`", "/tmp/line\nbreak"]) {
    assert.equal(execFileSync("/bin/sh", ["-c", `printf %s ${quoteShellArgument(path)}`], { encoding: "utf8" }), path);
  }
});

// Deliberately synthetic TEST-ONLY readings and coverage strings, not Mandarin
// stories or pronunciation guidance. Nothing in this file publishes content.
const definition = (hanzi) => ({ id: hanzi, hanzi, pinyin: ["a"] });
const syntheticStory = (targets, definitions = []) => {
  const readings = new Map(definitions.map(({ hanzi, pinyin }) => [hanzi, pinyin[0]]));
  return { paragraphs: [[[...new Set(targets)].map((hanzi) => ({ hanzi, pinyin: readings.get(hanzi) ?? "a" })).concat("。")]] };
};

function fixture(count = 10, { checkpoints = true } = {}) {
  const content = { modules: [{ id: "test-module", title: "Test-only module", lessons: [] }] };
  for (let n = 1; n <= count; n++) {
    content.modules[0].lessons.push({
      id: `learning-${n}`, title: `Test learning ${n}`, description: "Synthetic test fixture only",
      kind: "learning", contentRevision: 1, newCharacters: frequencyGroup(n).map(definition),
    });
    if (checkpoints && n % 10 === 0) content.modules[0].lessons.push({
      id: `revision-${n}`, title: `Test revision ${n}`, description: "Synthetic test checkpoint only",
      kind: "revision", contentRevision: 1, newCharacters: [],
    });
  }
  const { plans } = authoringPlan(content);
  lessons(content).forEach((lesson, index) => { lesson.story = syntheticStory(plans[index].mandatory); });
  return content;
}

function fillTestReadings(manifest) {
  const assigned = new Set(manifest.workers.flatMap((worker) => worker.lessonIds));
  for (const lesson of lessons(manifest.content)) {
    if (assigned.has(lesson.id)) lesson.newCharacters.forEach((character) => { character.pinyin = ["a"]; });
  }
}

function completeTestLesson(content, lesson) {
  // Preserve real baseline readings in the integration fixture; only newly
  // planned definitions use the explicitly fake "a" reading above.
  lesson.story = syntheticStory(authoringBrief(content, lesson.id).mandatory,
    lessons(content).flatMap((entry) => entry.newCharacters));
}

test("4 × 11 appends deterministic, disjoint, contiguous assignments with canonical checkpoints", () => {
  const baseline = fixture(), before = structuredClone(baseline);
  assert.deepEqual(validatePublishedCurriculum(baseline).errors, []);
  const manifest = makeBatch(baseline, [11, 11, 11, 11]);
  assert.deepEqual(manifest, makeBatch(baseline, [11, 11, 11, 11]));
  assert.deepEqual(baseline, before, "planning must not mutate the baseline");
  assert.equal(manifest.version, 1);
  assert.equal(manifest.repoRoot, repoRoot);
  assert.match(manifest.baselineHash, /^[a-f0-9]{64}$/);
  const expected = Array.from({ length: 4 }, (_, index) => {
    const start = 11 + index * 10;
    return { id: `worker-${index + 1}`, lessonIds: [
      ...Array.from({ length: 10 }, (_, i) => `learning-${start + i}`), `revision-${start + 9}`,
    ] };
  });
  assert.deepEqual(manifest.workers, expected);
  const assigned = manifest.workers.flatMap((worker) => worker.lessonIds);
  assert.equal(new Set(assigned).size, 44);
  const appended = lessons(manifest.content).slice(lessons(baseline).length);
  assert.deepEqual(appended.map(({ id }) => id), assigned);
  assert.deepEqual(lessons(manifest.content).slice(0, lessons(baseline).length), lessons(baseline));
  let learningNumber = 10;
  for (const lesson of appended) {
    assert.equal(lesson.contentRevision, 1);
    assert.equal(lesson.story, undefined);
    if (lesson.kind === "learning") {
      learningNumber++;
      assert.deepEqual(lesson.newCharacters.map(({ hanzi }) => hanzi), frequencyGroup(learningNumber));
      assert.ok(lesson.newCharacters.every((character) => character.id === character.hanzi && character.pinyin.length === 0),
        "the planner must not guess readings");
    } else {
      assert.equal(learningNumber % 10, 0);
      assert.deepEqual(lesson.newCharacters, []);
    }
  }
  fillTestReadings(manifest);
  const metadataCheck = validatePlannedLessons(manifest.content, []);
  assert.deepEqual(metadataCheck.errors, []);
  assert.ok(metadataCheck.reports.every(({ status }) => status === "not-checked"));
});

test("one lesson and uneven worker counts retain order even when a checkpoint splits workers", () => {
  const one = makeBatch(fixture(1), [1]);
  assert.deepEqual(one.workers, [{ id: "worker-1", lessonIds: ["learning-2"] }]);
  assert.deepEqual(lessons(one.content).at(-1).newCharacters.map(({ hanzi }) => hanzi), frequencyGroup(2));
  const uneven = makeBatch(fixture(9), [1, 3, 2]);
  assert.deepEqual(uneven.workers, [
    { id: "worker-1", lessonIds: ["learning-10"] },
    { id: "worker-2", lessonIds: ["revision-10", "learning-11", "learning-12"] },
    { id: "worker-3", lessonIds: ["learning-13", "learning-14"] },
  ]);
  const boundary = makeBatch(fixture(10, { checkpoints: false }), [1, 1]);
  assert.deepEqual(boundary.workers, [
    { id: "worker-1", lessonIds: ["revision-10"] },
    { id: "worker-2", lessonIds: ["learning-11"] },
  ]);
});

test("nextLessonSpec owns the learning/checkpoint boundary and ignores story availability", () => {
  assert.deepEqual(nextLessonSpec({ modules: [] }), { kind: "learning", learningNumber: 1, introductions: frequencyGroup(1) });
  assert.deepEqual(nextLessonSpec(fixture(9)), { kind: "learning", learningNumber: 10, introductions: frequencyGroup(10) });
  assert.deepEqual(nextLessonSpec(fixture(10, { checkpoints: false })), { kind: "revision", learningNumber: 10, introductions: [] });
  const content = fixture(10), before = structuredClone(content);
  assert.deepEqual(nextLessonSpec(content), { kind: "learning", learningNumber: 11, introductions: frequencyGroup(11) });
  assert.deepEqual(content, before);
  lessons(content).forEach((lesson) => { delete lesson.story; });
  assert.deepEqual(nextLessonSpec(content), { kind: "learning", learningNumber: 11, introductions: frequencyGroup(11) });
  assert.throws(() => nextLessonSpec(fixture(11, { checkpoints: false })), /missing revision checkpoint/);
  const duplicate = fixture(10);
  duplicate.modules[0].lessons.push({ ...structuredClone(lessons(duplicate).at(-1)), id: "duplicate-checkpoint" });
  assert.throws(() => nextLessonSpec(duplicate), /revision checkpoint must occur once/);
});

test("planning follows global order across modules and refuses generated ID collisions", () => {
  const content = fixture(10);
  const tail = content.modules[0].lessons.splice(5);
  content.modules.push({ id: "test-tail", title: "Test tail", lessons: tail });
  const before = structuredClone(content);
  const manifest = makeBatch(content, [1]);
  assert.deepEqual(manifest.content.modules[0], before.modules[0]);
  assert.equal(manifest.content.modules[1].lessons.at(-1).id, "learning-11");
  assert.deepEqual(content, before);
  const collision = fixture(1);
  collision.modules[0].id = "learning-2";
  assert.throws(() => makeBatch(collision, [1]), /Generated ID collision: learning-2/);
});

test("invalid sizes and invalid published baselines fail without mutating input", () => {
  const baseline = fixture(1), before = structuredClone(baseline);
  for (const counts of [undefined, null, 1, "1", [], [0], [-1], [1.5], [NaN], [Infinity], [Number.MAX_SAFE_INTEGER + 1], ["1"], [1, 0]]) {
    assert.throws(() => makeBatch(baseline, counts), /positive safe integer lesson count/);
  }
  assert.deepEqual(baseline, before);
  const missingStory = fixture(1);
  delete lessons(missingStory)[0].story;
  assert.throws(() => makeBatch(missingStory, [1]), /requires a story/);
});

test("nextLessonSpec and makeBatch reject frequency dataset exhaustion rather than a partial group", () => {
  // Discover the endpoint through the small-group API, never copy/load the
  // frequency table into test source or context. Build the near-end baseline
  // once, instead of asking the planner to allocate the whole dataset.
  let completeGroups = 0;
  while (true) {
    try { frequencyGroup(completeGroups + 1); completeGroups++; }
    catch (error) {
      assert.match(error.message, /no complete group/);
      break;
    }
  }
  assert.ok(completeGroups > 50);
  const baseline = fixture(completeGroups);
  assert.throws(() => nextLessonSpec(baseline), /no complete group/);
  assert.throws(() => makeBatch(baseline, [1]), /no complete group/);
});

test("scoped validation checks only selected stories, clearly marking all others not-checked", () => {
  const content = fixture(12), selected = "learning-12";
  const published = validatePublishedCurriculum(content);
  assert.deepEqual(published.errors, []);
  for (const lesson of lessons(content)) if (lesson.id !== selected) delete lesson.story;
  const result = validatePlannedLessons(content, [selected]);
  assert.deepEqual(result.errors, []);
  assert.equal(result.policy, "planned-lessons");
  assert.deepEqual(result.reports.find(({ lessonId }) => lessonId === selected), published.reports.find(({ lessonId }) => lessonId === selected));
  assert.deepEqual(result.warnings, published.warnings.filter((warning) => warning.startsWith(`${selected}:`)));
  assert.deepEqual(result.pending, published.pending);
  assert.ok(result.reports.filter(({ lessonId }) => lessonId !== selected).every(({ status }) => status === "not-checked"));
  assert.match(validatePublishedCurriculum(content).errors.join("\n"), /requires a story/);
  delete lessonById(content, selected).story;
  const metadataOnly = validatePlannedLessons(content, []);
  assert.deepEqual(metadataOnly.errors, []);
  assert.ok(metadataOnly.reports.every(({ status }) => status === "not-checked"));
  assert.match(validatePlannedLessons(content, [selected]).errors.join("\n"), /requires a story/);
});

const structuralStoryCases = [
  ["missing story", (lesson) => { delete lesson.story; }, /requires a story/],
  ["null story", (lesson) => { lesson.story = null; }, /story must be an object/],
  ["unknown story field", (lesson) => { lesson.story.guessed = true; }, /unexpected field guessed/],
  ["empty paragraphs", (lesson) => { lesson.story.paragraphs = []; }, /nonempty paragraphs/],
  ["empty paragraph", (lesson) => { lesson.story.paragraphs = [[]]; }, /paragraph requires sentences/],
  ["empty sentence", (lesson) => { lesson.story.paragraphs = [[[]]]; }, /sentence requires tokens/],
  ["Hanzi as string", (lesson) => { lesson.story.paragraphs[0][0].unshift("我"); }, /punctuation only/],
  ["unknown token field", (lesson) => { lesson.story.paragraphs[0][0][0].help = true; }, /unexpected field help/],
  ["multiple Hanzi token", (lesson) => { lesson.story.paragraphs[0][0][0].hanzi = "我的"; }, /one Hanzi per token/],
  ["numbered pinyin", (lesson) => { lesson.story.paragraphs[0][0][0].pinyin = "ni3"; }, /valid authored occurrence pinyin/],
  ["misplaced pinyin tone", (lesson) => { lesson.story.paragraphs[0][0][0].pinyin = "xǐao"; }, /valid authored occurrence pinyin/],
  ["reading conflicts with definition", (lesson) => { lesson.story.paragraphs[0][0][0].pinyin = "ba"; }, /conflicts with authored introductions/],
  ["punctuation-only sentence", (lesson) => { lesson.story.paragraphs.push([["。"]]); }, /at least one Hanzi/],
  ["missing sentence ending", (lesson) => { lesson.story.paragraphs[0][0].pop(); }, /must end in Chinese sentence punctuation/],
  ["two sentences in one array", (lesson) => { lesson.story.paragraphs[0][0].push({ ...lesson.story.paragraphs[0][0][0] }, "。"); }, /split separate sentences/],
];

for (const [name, change, expected] of structuralStoryCases) {
  test(`selected story uses the full publication structural/pinyin rules: ${name}`, () => {
    const content = fixture(12), selected = "learning-12";
    change(lessonById(content, selected));
    const scoped = validatePlannedLessons(content, [selected]);
    const full = validatePublishedCurriculum(content);
    assert.match(scoped.errors.join("\n"), expected);
    assert.deepEqual(scoped.errors, full.errors);
  });
}

for (const [selected, targetKind] of [["learning-12", "newTargets"], ["learning-12", "due"], ["revision-10", "revisionTargets"]]) {
  test(`selected story enforces the same mandatory ${targetKind} coverage as publication`, () => {
    const content = fixture(12), target = authoringBrief(content, selected)[targetKind][0];
    assert.ok(target);
    const lesson = lessonById(content, selected);
    lesson.story.paragraphs[0][0] = lesson.story.paragraphs[0][0].filter((token) => token.hanzi !== target);
    const scoped = validatePlannedLessons(content, [selected]);
    assert.match(scoped.errors.join("\n"), new RegExp(`${selected}: missing mandatory target ${target}`));
    assert.deepEqual(scoped.errors, validatePublishedCurriculum(content).errors);
  });
}

test("scoped allowed-Hanzi rules match publication: top100 or taught, never future introductions", () => {
  const content = fixture(22), selected = "learning-12", rank101 = frequencyGroup(21)[0];
  const sentence = lessonById(content, selected).story.paragraphs[0][0];
  sentence.unshift({ hanzi: trainingPool[99], pinyin: "a" });
  const allowed = validatePlannedLessons(content, [selected]);
  assert.deepEqual(allowed.errors, []);
  assert.deepEqual(allowed.reports.find(({ lessonId }) => lessonId === selected).permanentHelp, [trainingPool[99]]);
  assert.deepEqual(validatePublishedCurriculum(content).errors, []);
  sentence.unshift({ hanzi: rank101, pinyin: "a" });
  const illegal = validatePlannedLessons(content, [selected]);
  assert.match(illegal.errors.join("\n"), /illegal Hanzi.*allowed set is taught \+ top 100/);
  assert.deepEqual(illegal.errors, validatePublishedCurriculum(content).errors);
  sentence.shift();
  lessonById(content, "learning-22").story.paragraphs[0][0].unshift({ hanzi: rank101, pinyin: "a" });
  assert.deepEqual(validatePlannedLessons(content, ["learning-22"]).errors, []);
  assert.deepEqual(validatePublishedCurriculum(content).errors, []);
});

test("unselected metadata remains globally validated: frequency order, definitions, revisions and checkpoints", () => {
  const cases = [
    [(content) => { lessonById(content, "learning-1").newCharacters.reverse(); }, /exact frequency introductions/],
    [(content) => { lessonById(content, "learning-1").newCharacters[0].pinyin = []; }, /complete nonempty authored reading list/],
    [(content) => { lessonById(content, "learning-1").contentRevision = 0; }, /positive safe integer/],
    [(content) => { content.modules[0].lessons = lessons(content).filter(({ id }) => id !== "revision-10"); }, /missing revision checkpoint/],
    [(content) => {
      const revision = content.modules[0].lessons.splice(10, 1)[0];
      content.modules[0].lessons.splice(9, 0, revision);
    }, /revision checkpoint must occur once/],
    [(content) => { content.modules[0].lessons.splice(11, 0, { ...structuredClone(lessonById(content, "revision-10")), id: "duplicate-revision" }); }, /revision checkpoint must occur once/],
  ];
  for (const [change, expected] of cases) {
    const content = fixture(12);
    change(content);
    for (const selected of [[], ["learning-12"]]) {
      const result = validatePlannedLessons(content, selected);
      assert.match(result.errors.join("\n"), expected);
      assert.deepEqual(result.errors, validatePublishedCurriculum(content).errors);
    }
  }
});

test("scoped validation refuses unknown, duplicate and non-array selections", () => {
  const content = fixture(1);
  assert.throws(() => validatePlannedLessons(content, ["unknown"]), /Unknown planned lesson: unknown/);
  assert.throws(() => validatePlannedLessons(content, ["learning-1", "unknown"]), /Unknown planned lesson/);
  for (const selected of [undefined, null, "learning-1", new Set(["learning-1"]), ["learning-1", "learning-1"]]) {
    assert.throws(() => validatePlannedLessons(content, selected), /Expected unique lesson IDs/);
  }
});

test("applyWorkerLessons permits story/title edits but freezes ownership, order, kinds, revisions and definitions", () => {
  const manifest = makeBatch(fixture(), [2, 1]);
  fillTestReadings(manifest);
  const worker = manifest.workers[0];
  const drafts = worker.lessonIds.map((id) => structuredClone(lessonById(manifest.content, id)));
  drafts.forEach((lesson) => {
    lesson.title = "Test-only authored title";
    lesson.description = "Test-only authored description";
    completeTestLesson(manifest.content, lesson);
  });
  const before = structuredClone(manifest), draftsBefore = structuredClone(drafts);
  const applied = applyWorkerLessons(manifest, worker, drafts);
  assert.deepEqual(lessons(applied).filter(({ id }) => worker.lessonIds.includes(id)), drafts);
  assert.deepEqual(lessons(applied).filter(({ id }) => !worker.lessonIds.includes(id)),
    lessons(manifest.content).filter(({ id }) => !worker.lessonIds.includes(id)));
  assert.deepEqual(manifest, before);
  assert.deepEqual(drafts, draftsBefore);
  const changes = [
    [(output) => { output[0] = structuredClone(lessonById(manifest.content, manifest.workers[1].lessonIds[0])); }, /exactly its assigned lessons/],
    [(output) => { output[0] = structuredClone(lessons(manifest.content)[0]); }, /exactly its assigned lessons/],
    [(output) => { output.reverse(); }, /exactly its assigned lessons/],
    [(output) => { output.pop(); }, /exactly its assigned lessons/],
    [(output) => { output.push(structuredClone(output[0])); }, /exactly its assigned lessons/],
    [(output) => { output[1].id = output[0].id; }, /exactly its assigned lessons/],
    [(output) => { output[0].kind = "revision"; }, /frozen kind changed/],
    [(output) => { output[0].contentRevision++; }, /frozen contentRevision changed/],
    [(output) => { output[0].newCharacters.reverse(); }, /frozen newCharacters changed/],
    [(output) => { output[0].newCharacters.pop(); }, /frozen newCharacters changed/],
    [(output) => { output[0].newCharacters[0].pinyin = ["ba"]; }, /frozen newCharacters changed/],
    [(output) => { output[0].newCharacters[0].hanzi = "我"; }, /frozen newCharacters changed/],
    [(output) => { output[0].newCharacters[0].id = "foreign"; }, /frozen newCharacters changed/],
    [(output) => { output[0].newCharacters[0].guessed = true; }, /frozen newCharacters changed/],
  ];
  for (const [change, expected] of changes) {
    const output = structuredClone(drafts);
    change(output);
    assert.throws(() => applyWorkerLessons(manifest, worker, output), expected);
    assert.deepEqual(manifest, before);
  }
  assert.throws(() => applyWorkerLessons(manifest, worker, null), /exactly its assigned lessons/);
});

test("temporary real-baseline run: plan, test-only readings, seal, independent scoped check and collection", async (t) => {
  const temporary = await mkdtemp(join(tmpdir(), "authoring-batch-test-"));
  t.after(() => rm(temporary, { recursive: true, force: true }));
  const directory = join(temporary, "run with spaces"), manifestPath = join(directory, "manifest.json");
  const baseline = (await loadContent("app/content/curriculum.ts")).curriculum;
  const baselineBefore = structuredClone(baseline), baselineCount = lessons(baseline).length;
  const planned = await planRun(directory, [2]);
  assert.equal(planned.status, "needs-authored-readings");
  assert.deepEqual(planned.workers.map(({ lessonIds }) => lessonIds.length), [2]);
  const manifest = await readJson(manifestPath);
  assert.equal(lessons(manifest.content).length, baselineCount + 2);
  assert.deepEqual(lessons(manifest.content).slice(0, baselineCount), lessons(baseline));
  assert.ok(lessons(manifest.content).slice(baselineCount).every((lesson) => lesson.story === undefined && lesson.newCharacters.every(({ pinyin }) => pinyin.length === 0)));
  const unsealedBytes = await readFile(manifestPath, "utf8");
  await assert.rejects(planRun(directory, [2]), { code: "EEXIST" });
  assert.equal(await readFile(manifestPath, "utf8"), unsealedBytes);
  await assert.rejects(verifySealedRun(directory), /unsealed/);
  await assert.rejects(sealRun(directory), /complete nonempty authored reading list/);
  assert.deepEqual(await readdir(directory), ["manifest.json"]);

  fillTestReadings(manifest); // Pure test fixture, NEVER publish these readings.
  // Full validation compares even earlier top100 occurrences with all authored
  // definitions, including future introductions. Keep those existing readings
  // alongside fake "a", otherwise the unchanged real baseline would conflict.
  // This is fixture compatibility, not dictionary inference or content authoring.
  const existingReadings = new Map();
  for (const lesson of lessons(baseline)) {
    for (const token of lesson.story.paragraphs.flat(2)) {
      if (typeof token === "string") continue;
      if (!existingReadings.has(token.hanzi)) existingReadings.set(token.hanzi, new Set());
      existingReadings.get(token.hanzi).add(token.pinyin);
    }
  }
  for (const lesson of lessons(manifest.content).slice(baselineCount)) {
    for (const character of lesson.newCharacters) {
      character.pinyin = [...new Set(["a", ...(existingReadings.get(character.hanzi) ?? [])])];
    }
  }
  await saveJson(manifestPath, manifest);
  assert.equal((await sealRun(directory)).status, "sealed");
  const sealed = await verifySealedRun(directory);
  assert.deepEqual(sealed, await verifySealedRun(directory, baseline));
  const launcherCalls = [];
  const dryRun = await launchAuthoring(directory, {
    dryRun: true, cwd: repoRoot,
    env: { HERDR_ENV: "1", HERDR_WORKSPACE_ID: "w-test", HERDR_TAB_ID: "t-test", HERDR_PANE_ID: "p-test" },
    runner: async (file, args) => {
      launcherCalls.push([file, ...args]);
      assert.equal(file, "git", "dry-run admission never invokes Herdr");
      return { stdout: `${repoRoot}\n` };
    },
  });
  assert.equal(dryRun.status, "dry-run");
  assert.equal(launcherCalls.length, 1);
  for (const filename of ["assignment.md", "briefs.json"]) {
    const path = join(directory, sealed.workers[0].id, filename);
    const original = await readFile(path, "utf8");
    await writeFile(path, `${original} `);
    await assert.rejects(verifySealedRun(directory), /Immutable run artifact changed/);
    await writeFile(path, original);
  }
  const sealedBytes = await readFile(manifestPath, "utf8");
  await assert.rejects(sealRun(directory), /Already sealed/);
  const staleBaseline = structuredClone(baseline);
  staleBaseline.modules[0].title += " changed";
  await assert.rejects(verifySealedRun(directory, staleBaseline), /Published curriculum changed/);
  const worker = sealed.workers[0], workerPath = join(directory, worker.id, "lessons.json");
  const drafts = await readJson(workerPath), briefs = await readJson(join(directory, worker.id, "briefs.json"));
  assert.deepEqual(drafts.map(({ id }) => id), worker.lessonIds);
  assert.ok(drafts.every((lesson) => lesson.story === undefined));
  assert.deepEqual(briefs, worker.lessonIds.map((id) => authoringBrief(sealed.content, id)));
  assert.ok(!JSON.stringify(briefs).includes("paragraphs"), "worker briefs must not contain previous stories");
  const assignment = await readFile(join(directory, worker.id, "assignment.md"), "utf8");
  assert.ok(worker.lessonIds.every((id) => assignment.includes(id)));

  const last = drafts.at(-1);
  completeTestLesson(sealed.content, last);
  await saveJson(workerPath, drafts);
  const scoped = await checkRun(directory, { workerId: worker.id, lessonId: last.id });
  assert.equal(scoped.status, "scoped-drafts-checked-not-publication");
  assert.equal(scoped.policy, "planned-lessons");
  assert.deepEqual(scoped.errors, []);
  assert.ok(scoped.reports.filter(({ lessonId }) => lessonId !== last.id).every(({ status }) => status === "not-checked"));
  assert.equal(drafts[0].story, undefined, "the previous assigned story is still absent");
  await assert.rejects(checkRun(directory, { workerId: worker.id }), /requires a story/);
  await assert.rejects(checkRun(directory, { collect: true }), /requires a story/);
  await assert.rejects(readFile(join(directory, "candidate.json")), { code: "ENOENT" });
  await assert.rejects(checkRun(directory, { workerId: "worker-999" }), /known --worker/);
  await assert.rejects(checkRun(directory, { workerId: worker.id, lessonId: lessons(baseline)[0].id }), /not owned by this worker/);

  const tampered = structuredClone(sealed);
  tampered.content.modules[0].title += " tampered";
  await saveJson(manifestPath, tampered);
  await assert.rejects(verifySealedRun(directory), /plan changed/);
  await assert.rejects(checkRun(directory, { workerId: worker.id, lessonId: last.id }), /plan changed/);
  await assert.rejects(checkRun(directory, { collect: true }), /plan changed/);
  await writeFile(manifestPath, sealedBytes);
  const changedDrafts = structuredClone(drafts);
  changedDrafts.at(-1).newCharacters[0].pinyin = ["ba"];
  await saveJson(workerPath, changedDrafts);
  await assert.rejects(checkRun(directory, { workerId: worker.id, lessonId: last.id }), /frozen newCharacters changed/);

  completeTestLesson(sealed.content, drafts[0]);
  await saveJson(workerPath, drafts);
  assert.deepEqual((await checkRun(directory, { workerId: worker.id })).errors, []);
  const collected = await checkRun(directory, { collect: true });
  assert.equal(collected.status, "combined-candidate-checked-not-published");
  assert.equal(collected.policy, "published");
  assert.deepEqual(collected.errors, []);
  const candidate = await readJson(join(directory, "candidate.json"));
  assert.deepEqual(candidate, applyWorkerLessons(sealed, worker, drafts));
  assert.deepEqual(collected.reports, validatePublishedCurriculum(candidate).reports);
  delete drafts[0].story;
  await saveJson(workerPath, drafts);
  await assert.rejects(checkRun(directory, { collect: true }), /requires a story/);
  await assert.rejects(readFile(join(directory, "candidate.json")), { code: "ENOENT" });
  assert.deepEqual(lessons(candidate).slice(0, baselineCount), lessons(baseline));
  assert.equal(await readFile(manifestPath, "utf8"), sealedBytes);
  assert.deepEqual((await loadContent("app/content/curriculum.ts")).curriculum, baselineBefore,
    "collection only writes the temporary candidate, never the publication");
});
