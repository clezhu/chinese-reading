import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { loadContent, repoRoot } from "../scripts/load-content.mjs";
import { availableBank, lengthGuidance, validateCurriculum, validatePublishedCurriculum, validateOccurrenceReference, validPinyin, withDrafts } from "../scripts/content-tools.mjs";
import { authoringBrief, authoringPlan, frequencyGroup } from "../scripts/authoring-policy.mjs";

const { curriculum, taughtCharacters, orderedLessons } = await loadContent("app/content/curriculum.ts");
// Exercise replacement mechanics independently of archived/proposed real drafts.
const drafts = orderedLessons().map((lesson) => ({ status: "draft", title: lesson.title, lesson: { ...structuredClone(lesson), contentRevision: lesson.contentRevision + 1 } }));
const { revisionLessonFixture } = await loadContent("app/content/fixtures/revision.ts");
const copy = () => structuredClone(curriculum);
const first = (c) => c.modules[0].lessons[0];
const checkMutation = (mutate, pattern) => {
  const candidate = copy(); mutate(candidate);
  assert.match(validateCurriculum(candidate).errors.join("\n"), pattern);
};

// Frozen publication fingerprints include stories, reading lists and metadata.
// Sort object keys so formatting/property order changes are not content changes.
const canonical = (value) => Array.isArray(value) ? value.map(canonical)
  : value && typeof value === "object" ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])])) : value;
const fingerprint = (lessons) => createHash("sha256").update(JSON.stringify(canonical(lessons))).digest("hex");

test("publication preserves the first 110 lessons and appends 55 further lessons in order", async () => {
  const published = orderedLessons();
  assert.deepEqual(curriculum.modules.map(({ id, title }) => ({ id, title })), [{ id: "foundations", title: "Fundamentals" }]);
  assert.deepEqual(published.slice(0, 11).map(({ id, title, description, kind, contentRevision }) => ({ id, title, description, kind, contentRevision })), [
    { id: "first-characters", title: "First characters", description: "Two siblings discover that their mother belongs to both of them.", kind: "learning", contentRevision: 3 },
    { id: "people-and-places", title: "People and places", description: "A quiet storyteller finds the courage to join the conversation.", kind: "learning", contentRevision: 3 },
    { id: "everyday-connections", title: "Everyday connections", description: "A second pastry turns a possessive moment into a chance to share.", kind: "learning", contentRevision: 3 },
    { id: "an-extra-pair-of-hands", title: "An extra pair of hands", description: "A child learns to make pastries by watching his mother.", kind: "learning", contentRevision: 1 },
    { id: "an-unspoken-invitation", title: "An unspoken invitation", description: "An invitation never reaches Grandma because everyone thinks someone else passed it on.", kind: "learning", contentRevision: 1 },
    { id: "more-than-a-thank-you", title: "More than a thank-you", description: "A child has a more generous reply in mind than the expected thank-you.", kind: "learning", contentRevision: 1 },
    { id: "a-welcome-visit", title: "A welcome visit", description: "Someone who thinks she needs a reason to visit finds she is already welcome.", kind: "learning", contentRevision: 1 },
    { id: "more-than-the-pastries", title: "More than the pastries", description: "An imperfect pastry is no reason to miss a visit to Mum.", kind: "learning", contentRevision: 1 },
    { id: "seeing-for-herself", title: "Seeing for herself", description: "One visitor checks a place out instead of accepting the group's verdict.", kind: "learning", contentRevision: 1 },
    { id: "a-birthday-change", title: "A birthday change", description: "A parent discovers that being present matters more than a birthday treat.", kind: "learning", contentRevision: 1 },
    { id: "the-birthday-surprise", title: "The birthday surprise", description: "Three generations discover that a birthday gathering says more than the invitation.", kind: "revision", contentRevision: 1 },
  ]);
  assert.equal(fingerprint(published.slice(0, 11)), "5850eb784791dabd1b25a71b110ab4f98fc7d5b2660daa364eda56e69441b132");
  const appended = published.slice(11, 55);
  assert.equal(appended.length, 44);
  assert.deepEqual(appended.map((lesson) => lesson.id), Array.from({ length: 4 }, (_, block) => [
    ...Array.from({ length: 10 }, (_, i) => `learning-${11 + block * 10 + i}`), `revision-${20 + block * 10}`,
  ]).flat());
  assert.ok(appended.every((lesson) => lesson.contentRevision === 1));
  // Captured from the frozen authoring output for this expansion; no ignored
  // draft or local run files are imported/read by this regression test.
  assert.equal(fingerprint(appended), "4e97cf823fd939b604e9a33cb5ce8955e15918f4471d671741241a177a9757dd");
  // First-55 fingerprint captured independently from the next-55 manifest's
  // baseline lessons, verified unchanged in its validated candidate.json.
  assert.equal(fingerprint(published.slice(0, 55)), "8dda76fbc2ea714e1e0c5ac0a278f18867229aa94fbcc0a2ba4054784714ed0f");
  const continuation = published.slice(55, 110);
  assert.equal(continuation.length, 55);
  assert.deepEqual(continuation.map((lesson) => lesson.id), Array.from({ length: 5 }, (_, block) => [
    ...Array.from({ length: 10 }, (_, i) => `learning-${51 + block * 10 + i}`), `revision-${60 + block * 10}`,
  ]).flat());
  assert.ok(continuation.every((lesson) => lesson.contentRevision === 1));
  // Independently frozen from .authoring-runs/next-55/candidate.json after
  // publication validation; ignored authoring artifacts are not read at runtime.
  assert.equal(fingerprint(continuation), "12b17fb616e39fa11f9f1989ad8c322cacab59bd92e76a60a42a3ebb9e31aae4");
  // Captured from the published 110-story baseline before this integration.
  assert.equal(fingerprint(published.slice(0, 110)), "d746b0bcddbc844cdc036066083339f8b311a0a2e7110bb7ac384ff550954187");
  const { frequencyFurtherLessons } = await loadContent("app/content/frequency-further.ts");
  const further = published.slice(110);
  assert.equal(further.length, 55);
  assert.deepEqual(further, frequencyFurtherLessons);
  assert.deepEqual(further.map((lesson) => lesson.id), Array.from({ length: 5 }, (_, block) => [
    ...Array.from({ length: 10 }, (_, i) => `learning-${101 + block * 10 + i}`), `revision-${110 + block * 10}`,
  ]).flat());
  assert.ok(further.every((lesson) => lesson.contentRevision === 1));
});

test("published curriculum has 150 ordered frequency groups and fifteen latest-50 revisions", () => {
  const published = orderedLessons();
  assert.equal(published.length, 165);
  assert.deepEqual(published.map((l) => l.kind), Array.from({ length: 15 }, () => [...Array(10).fill("learning"), "revision"]).flat());
  assert.deepEqual(validatePublishedCurriculum(curriculum).errors, []);
  for (const [index, lesson] of published.filter((lesson) => lesson.kind === "learning").entries()) {
    assert.deepEqual(lesson.newCharacters.map((c) => c.hanzi), frequencyGroup(index + 1));
    assert.ok(lesson.contentRevision > 0);
    lesson.newCharacters.forEach((c) => assert.equal(c.id, c.hanzi));
  }
  for (const [index, revision] of published.filter((lesson) => lesson.kind === "revision").entries()) {
    assert.deepEqual(revision.newCharacters, []);
    const bank = taughtCharacters(revision.id);
    assert.equal(bank.length, (index + 1) * 50);
    assert.equal(new Set(bank.map((c) => c.hanzi)).size, (index + 1) * 50);
    const occurrences = new Set(revision.story.paragraphs.flat(2).filter((t) => typeof t !== "string").map((t) => t.hanzi));
    for (const { hanzi } of bank.slice(-50)) assert.ok(occurrences.has(hanzi), `${revision.id} must cover ${hanzi}`);
    const brief = availableBank(curriculum, revision.id);
    assert.equal(brief.prior.length, (index + 1) * 50);
    assert.deepEqual(brief.current, []);
    assert.deepEqual(brief.combined, bank);
    assert.deepEqual(authoringBrief(curriculum, revision.id).revisionTargets, bank.slice(-50).map((c) => c.hanzi));
  }
});

test("published stories satisfy actual Fibonacci due groups and revision does not advance the schedule", () => {
  const { plans, pending, errors } = authoringPlan(curriculum);
  assert.deepEqual(errors, []);
  const dueGroups = [[], [1], [1, 2], [2, 3], [1, 3, 4], [2, 4, 5], [3, 5, 6], [1, 4, 6, 7], [2, 5, 7, 8], [3, 6, 8, 9]];
  for (const [index, groups] of dueGroups.entries()) {
    const plan = plans[index], lesson = orderedLessons()[index];
    assert.equal(plan.learningNumber, index + 1);
    assert.equal(plan.cumulativeIntroduced, (index + 1) * 5);
    assert.deepEqual(plan.due, groups.flatMap(frequencyGroup));
    const occurrences = new Set(lesson.story.paragraphs.flat(2).filter((t) => typeof t !== "string").map((t) => t.hanzi));
    for (const hanzi of [...frequencyGroup(index + 1), ...groups.flatMap(frequencyGroup)]) {
      assert.ok(occurrences.has(hanzi), `${lesson.id} must cover new/due ${hanzi}`);
    }
  }
  // Extend coverage to every learning lesson while retaining the explicit
  // first-ten due-group baseline above. Checkpoints never advance this clock.
  // Explicit independent oracle: offset 88 is first due at learning lesson 89;
  // 143 is due within this expansion; 232 is the next pending offset for
  // the earliest groups (successive Fibonacci gaps, not Fibonacci offsets).
  const offsets = [1, 2, 4, 7, 12, 20, 33, 54, 88, 143, 232];
  for (const [index, lesson] of orderedLessons().entries()) {
    const plan = plans[index];
    const learningNumber = lesson.kind === "learning" ? index - Math.floor(index / 11) + 1 : (Math.floor(index / 11) + 1) * 10;
    assert.equal(plan.learningNumber, learningNumber);
    if (lesson.kind === "learning") {
      const groups = Array.from({ length: learningNumber - 1 }, (_, i) => i + 1)
        .filter((introducedAt) => offsets.includes(learningNumber - introducedAt));
      assert.deepEqual(plan.due, groups.flatMap(frequencyGroup));
      assert.deepEqual(plan.mandatory, [...frequencyGroup(learningNumber), ...groups.flatMap(frequencyGroup)]);
      assert.equal(plan.cumulativeIntroduced, learningNumber * 5);
      assert.equal(plan.guidance.target, lengthGuidance(learningNumber).target);
    } else {
      assert.equal(plan.cumulativeIntroduced, learningNumber * 5);
      assert.deepEqual(plan.due, []);
      assert.deepEqual(plan.revisionTargets, Array.from({ length: 10 }, (_, i) => frequencyGroup(learningNumber - 9 + i)).flat());
      assert.deepEqual(plan.mandatory, plan.revisionTargets);
      assert.equal(plan.guidance.target, lengthGuidance(learningNumber, { revision: true }).target);
    }
    const occurrences = new Set(lesson.story.paragraphs.flat(2).filter((t) => typeof t !== "string").map((t) => t.hanzi));
    for (const hanzi of plan.mandatory) assert.ok(occurrences.has(hanzi), `${lesson.id} must cover ${hanzi}`);
  }
  const revision = plans.at(-1);
  assert.equal(revision.lessonId, "revision-150");
  assert.equal(revision.learningNumber, 150);
  assert.equal(revision.cumulativeIntroduced, 750);
  assert.deepEqual(revision.due, []);
  assert.deepEqual(revision.revisionTargets, Array.from({ length: 10 }, (_, i) => frequencyGroup(i + 141)).flat());
  assert.deepEqual(revision.mandatory, revision.revisionTargets);
  assert.equal(plans.at(-2).guidance.target, 315);
  assert.equal(revision.guidance.target, 1575);
  const beforeRevision = { modules: curriculum.modules.map((module) => ({ ...module, lessons: module.lessons.filter((lesson) => lesson.kind === "learning") })) };
  assert.deepEqual(pending.filter((entry) => entry.type === "fibonacci"), authoringPlan(beforeRevision).pending.filter((entry) => entry.type === "fibonacci"));
  assert.equal(pending.filter((entry) => entry.type === "fibonacci").length, 750);
  assert.deepEqual(pending.filter((entry) => entry.type === "fibonacci"), Array.from({ length: 150 }, (_, i) => {
    const introducedAt = i + 1;
    return frequencyGroup(introducedAt).map((hanzi) => ({
      type: "fibonacci", hanzi, introducedAt,
      learningNumber: introducedAt + offsets.find((offset) => introducedAt + offset > 150), status: "pending",
    }));
  }).flat());
  assert.deepEqual(pending.filter((entry) => entry.type === "revision"), [{ type: "revision", afterLearningNumber: 160, introductions: 50, status: "pending" }]);
  assert.ok(pending.every((entry) => entry.status === "pending" && (entry.type !== "fibonacci" || entry.learningNumber > 150)));
});

test("available bank derives prior/current/combined readings across module boundaries", () => {
  const bank = availableBank(curriculum, "everyday-connections");
  assert.equal(bank.prior.length, 10);
  assert.equal(bank.current.length, 5);
  assert.equal(bank.combined.length, 15);
  assert.deepEqual(bank.combined, taughtCharacters(bank.lessonId));
  assert.equal(availableBank(curriculum, "first-characters").prior.length, 0);
  const reordered = copy();
  const original = reordered.modules[0];
  reordered.modules = [
    { ...original, lessons: original.lessons.slice(0, 2) },
    { id: "second-module", title: "Second module", lessons: original.lessons.slice(2) },
  ];
  assert.equal(availableBank(reordered, "everyday-connections").prior.length, 10);
  reordered.modules.reverse();
  assert.equal(taughtCharacters("everyday-connections", reordered).length, 5);
  assert.throws(() => taughtCharacters("missing"), /Unknown lesson/);
  assert.throws(() => availableBank(curriculum, "missing"), /Unknown lesson/);
});

test("isolated structural revision introduces nothing, inherits the first-three bank, and stays unpublished", () => {
  const content = { modules: [{ ...copy().modules[0], lessons: [...structuredClone(orderedLessons().slice(0, 3)), revisionLessonFixture] }] };
  assert.deepEqual(validateCurriculum(content).errors, []);
  assert.equal(taughtCharacters(revisionLessonFixture.id, content).length, 15);
  assert.ok(!orderedLessons().some((lesson) => lesson.id === revisionLessonFixture.id));
  const invalid = structuredClone(content); invalid.modules.at(-1).lessons.at(-1).newCharacters = first(content).newCharacters;
  assert.match(validateCurriculum(invalid).errors.join("\n"), /zero characters/);
});

test("published stories have paragraphs, individual occurrences and derived permanent help", () => {
  const lesson = first(curriculum);
  assert.ok(lesson.story.paragraphs.length >= 2);
  const tokens = lesson.story.paragraphs.flat(2).filter((t) => typeof t !== "string");
  const report = validateCurriculum(curriculum).reports[0];
  assert.ok(report.permanentHelp.every((hanzi) => !lesson.newCharacters.some((character) => character.hanzi === hanzi)));
  assert.equal(report.hanziCount, tokens.length);
  assert.ok(report.taughtCount > 0 && report.taughtCount < report.hanziCount);
});

test("candidate drafts replace lessons together, reuse the taught bank, and remain unpublished", () => {
  assert.equal(drafts.length, 165);
  const candidate = withDrafts(curriculum, drafts);
  assert.deepEqual(validateCurriculum(candidate).errors, []);
  assert.equal(orderedLessons(candidate).length, 165);
  assert.equal(orderedLessons(candidate).at(-1).kind, "revision");
  assert.deepEqual(orderedLessons(candidate).at(-1).newCharacters, []);
  assert.ok(orderedLessons(candidate).every((l, i) => l.contentRevision === orderedLessons()[i].contentRevision + 1));
  for (const lesson of orderedLessons(candidate)) {
    const storyHanzi = new Set(lesson.story.paragraphs.flat(2).filter((t) => typeof t !== "string").map((t) => t.hanzi));
    lesson.newCharacters.forEach((c) => assert.ok(storyHanzi.has(c.hanzi), `${lesson.id} must use ${c.hanzi}`));
  }
  assert.throws(() => withDrafts(curriculum, [drafts[0], drafts[0]]), /Duplicate draft/);
  assert.throws(() => withDrafts(curriculum, [{ ...drafts[0], lesson: { ...drafts[0].lesson, id: "unknown" } }]), /Unknown draft/);
  assert.throws(() => withDrafts(curriculum, [{ ...drafts[0], lesson: { ...drafts[0].lesson, contentRevision: first(curriculum).contentRevision } }]), /newer/);
  const changed = structuredClone(drafts);
  changed[1].lesson.newCharacters[0] = changed[0].lesson.newCharacters[0];
  assert.match(validateCurriculum(withDrafts(curriculum, changed)).errors.join("\n"), /duplicate introduction/);
});

test("validator rejects invalid IDs, membership, revisions, introductions and incomplete definitions", () => {
  checkMutation((c) => c.modules.push(c.modules[0]), /duplicate ID/);
  checkMutation((c) => c.modules.push({ id: "duplicate-membership", title: "Duplicate membership", lessons: [first(c)] }), /duplicate ID/);
  checkMutation((c) => first(c).id = "bad id", /stable slug/);
  checkMutation((c) => first(c).contentRevision = 0, /positive safe integer/);
  checkMutation((c) => first(c).newCharacters.pop(), /five characters/);
  checkMutation((c) => c.modules[0].lessons[1].newCharacters[0] = first(c).newCharacters[0], /duplicate introduction/);
  checkMutation((c) => first(c).newCharacters[0].id = "char-de", /must equal hanzi/);
  checkMutation((c) => first(c).newCharacters[0].pinyin = [], /complete nonempty/);
  checkMutation((c) => first(c).newCharacters[0].pinyin = ["de", "de"], /duplicate reading/);
  checkMutation((c) => first(c).newCharacters[0].pinyin = ["de5"], /valid pinyin/);
});

test("publication checks require stories while standalone structural fixtures may omit them", () => {
  const candidate = copy();
  delete first(candidate).story;
  assert.match(validateCurriculum(candidate, { requireStories: true }).errors.join("\n"), /requires a story/);
  assert.deepEqual(validateCurriculum(candidate).errors, []);
});

test("validator rejects malformed stories and checks authored reading consistency including sandhi", () => {
  checkMutation((c) => first(c).story = { paragraphs: [] }, /nonempty paragraphs/);
  checkMutation((c) => first(c).story.paragraphs[0] = [], /requires sentences/);
  checkMutation((c) => first(c).story.paragraphs[0][0] = [], /requires tokens/);
  checkMutation((c) => first(c).story.paragraphs[0][0][0] = "你好", /punctuation only/);
  checkMutation((c) => first(c).story.paragraphs[0][0][0] = { hanzi: "你好", pinyin: "nǐ hǎo" }, /one Hanzi/);
  checkMutation((c) => first(c).story.paragraphs[0][0][0].pinyin = "", /occurrence pinyin/);
  checkMutation((c) => first(c).story.paragraphs[0][0][0] = { hanzi: first(c).newCharacters[0].hanzi, pinyin: "shí" }, /conflicts with authored/);
  checkMutation((c) => first(c).story.paragraphs[0][0][0].trainingWheel = true, /unexpected field/);
  checkMutation((c) => first(c).story.paragraphs[0][0].push(...structuredClone(first(c).story.paragraphs[0][0])), /split separate sentences/);
  assert.deepEqual(validateCurriculum(curriculum).errors, []);
  const sandhi = copy();
  first(sandhi).newCharacters = [
    { id: "一", hanzi: "一", pinyin: ["yī"] }, { id: "不", hanzi: "不", pinyin: ["bù"] },
    { id: "个", hanzi: "个", pinyin: ["gè"] }, { id: "的", hanzi: "的", pinyin: ["de"] },
    { id: "是", hanzi: "是", pinyin: ["shì"] },
  ];
  sandhi.modules = [{ id: "sandhi", title: "Sandhi", lessons: [first(sandhi)] }];
  first(sandhi).story = { paragraphs: [[[
    { hanzi: "一", pinyin: "yí" }, { hanzi: "一", pinyin: "yì" },
    { hanzi: "不", pinyin: "bú" }, { hanzi: "个", pinyin: "ge" }, "。",
  ]]] };
  assert.deepEqual(validateCurriculum(sandhi, { policy: "structural" }).errors, []);
  for (const p of ["shì", "liǎo", "lüè", "nǚ", "de", "yāo"]) assert.ok(validPinyin(p));
  for (const p of ["shi4", "nǐ hǎo", "blah", "", "Shì", "shìì"]) assert.ok(!validPinyin(p));
});

test("pinyin accepts canonical tone positions, ü/ê and syllabic consonants", () => {
  const bases = ["a", "ai", "ao", "ei", "ou", "bia", "xiao", "yao", "jie", "liu", "gui", "lü", "nüe", "ê", "m", "n", "ng", "hm", "hng"];
  const marked = ["ā", "āi", "āo", "ēi", "ōu", "biā", "xiāo", "yāo", "jiē", "liū", "guī", "lǖ", "nüē", "ê\u0304", "m\u0304", "n\u0304", "n\u0304g", "hm\u0304", "hn\u0304g"];
  for (const p of bases) assert.ok(validPinyin(p), p);
  for (const p of marked) {
    for (const tone of ["\u0304", "\u0301", "\u030c", "\u0300"]) {
      const reading = p.normalize("NFD").replace("\u0304", tone).normalize("NFC");
      assert.ok(validPinyin(reading), reading);
    }
  }
  assert.equal(validPinyin("ü"), false); // ü alone is not an inventory syllable
});

test("pinyin rejects misplaced/multiple tones and noncanonical spellings", () => {
  for (const p of ["xǐao", "yaō", "xiáō", "aí", "aǒ", "eī", "oú", "jǐe", "lǐu", "gǔi", "nǘe", "ńg̀", "hḿg", "ḿa", "shìì", "nu\u0308\u0300", "e\u0302", "m\u0307", "lv", "nue", "êi", "shi4", "nǐ hǎo", "blah", "", "Shì", null, 3]) {
    assert.equal(validPinyin(p), false, String(p));
  }
  checkMutation((c) => first(c).newCharacters[0].pinyin = ["xǐao"], /valid pinyin/);
  checkMutation((c) => first(c).story.paragraphs[0][0][0].pinyin = "yaō", /occurrence pinyin/);
});

test("structural fixtures permit unfamiliar characters without imposing canonical policy", () => {
  const content = copy(); first(content).story.paragraphs[0][0][0] = { hanzi: "龟", pinyin: "guī" };
  const result = validateCurriculum(content, { policy: "structural" });
  assert.deepEqual(result.errors, []);
  assert.ok(result.reports[0].permanentHelp.includes("龟"));
});

test("revision-scoped references address individual Hanzi, not punctuation or an entire sentence", () => {
  const lesson = first(curriculum);
  const reference = { contentRevision: lesson.contentRevision, paragraphIndex: 0, sentenceIndex: 0, tokenIndex: 1 };
  assert.deepEqual(validateOccurrenceReference(lesson, reference), []);
  assert.match(validateOccurrenceReference(lesson, { ...reference, contentRevision: lesson.contentRevision - 1 }).join(), /mismatch/);
  for (const tokenIndex of [-1, 0.5, 999]) assert.ok(validateOccurrenceReference(lesson, { ...reference, tokenIndex }).length);
  assert.ok(validateOccurrenceReference(lesson, { ...reference, tokenIndex: lesson.story.paragraphs[0][0].length - 1 }).length);
  assert.ok(validateOccurrenceReference(lesson, { ...reference, paragraphIndex: 99 }).length);
});

test("length guidance counts Hanzi occurrences, excludes punctuation and remains soft/capped", () => {
  assert.deepEqual(lengthGuidance(1), { target: 60, min: 45, max: 75, unit: "Hanzi occurrences" });
  assert.equal(lengthGuidance(3).target, 60 + 10 / 3);
  assert.equal(lengthGuidance(200).target, 400);
  assert.equal(lengthGuidance(200, { revision: true }).target, 2000);
  const content = copy(); first(content).story = { paragraphs: [[[{ hanzi: "的", pinyin: "de" }, "！"]]] };
  const result = validateCurriculum(content);
  assert.deepEqual(result.errors, []);
  assert.equal(result.reports[0].hanziCount, 1);
  assert.match(result.warnings.join(), /soft range/);
});

test("CLI candidates repair older policy violations but cannot bypass hard checks; briefs allow unwritten stories", () => {
  const directory = mkdtempSync(join(tmpdir(), "authoring-candidate-"));
  const path = join(directory, "drafts.ts");
  let learningNumber = 0;
  const candidates = orderedLessons().map((lesson) => {
    const introductions = lesson.kind === "learning" ? frequencyGroup(++learningNumber) : [];
    return {
      status: "draft", lesson: {
        ...structuredClone(lesson), contentRevision: lesson.contentRevision + 1,
        newCharacters: introductions.map((hanzi) => ({ id: hanzi, hanzi, pinyin: ["a"] })),
        story: { paragraphs: [[[...Array.from({ length: learningNumber }, (_, i) => frequencyGroup(i + 1)).flat().map((hanzi) => ({ hanzi, pinyin: "a" })), "。"]]] },
      },
    };
  });
  assert.equal(candidates.at(-1).lesson.kind, "revision");
  assert.deepEqual(candidates.at(-1).lesson.newCharacters, []);
  const run = (command = "check", ...args) => {
    writeFileSync(path, `export const drafts = ${JSON.stringify(candidates)};`);
    return spawnSync(process.execPath, ["authoring/scripts/content.mjs", command, ...args, "--draft", path], { cwd: repoRoot, encoding: "utf8" });
  };
  try {
    const valid = run();
    assert.equal(valid.status, 0, valid.stderr);
    assert.equal(JSON.parse(valid.stdout).baselinePolicy, "structural");
    assert.equal(JSON.parse(valid.stdout).policy, "published");
    const revisionSentence = candidates.at(-1).lesson.story.paragraphs[0][0];
    // Older taught characters are optional here: remove a latest-50 target.
    const target = frequencyGroup(learningNumber - 9)[0];
    const targetIndex = revisionSentence.findIndex((token) => typeof token !== "string" && token.hanzi === target);
    assert.ok(targetIndex >= 0);
    const [removedRevisionTarget] = revisionSentence.splice(targetIndex, 1);
    assert.match(run().stderr, new RegExp(`${candidates.at(-1).lesson.id}: missing mandatory target`));
    revisionSentence.splice(targetIndex, 0, removedRevisionTarget);
    const illegal = { hanzi: frequencyGroup(21)[0], pinyin: "a" };
    candidates[0].lesson.story.paragraphs[0][0].unshift(illegal);
    assert.match(run().stderr, /illegal Hanzi/);
    candidates[0].lesson.story.paragraphs[0][0].shift();
    candidates[2].lesson.story.paragraphs[0][0].shift();
    assert.match(run().stderr, /missing mandatory target/);
    delete candidates[2].lesson.story;
    const brief = run("bank", candidates[2].lesson.id);
    assert.equal(brief.status, 0, brief.stderr);
    assert.equal(JSON.parse(brief.stdout).mandatory.length, 15);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("CLI checks current and candidate sets, prints bank definitions and rejects invalid arguments", () => {
  const run = (...args) => spawnSync(process.execPath, ["authoring/scripts/content.mjs", ...args], { cwd: repoRoot, encoding: "utf8" });
  const directory = mkdtempSync(join(tmpdir(), "authoring-cli-"));
  try {
    const path = join(directory, "drafts.ts");
    writeFileSync(path, `export const drafts = ${JSON.stringify(drafts)};`);
    for (const args of [["check"], ["check", "--draft", path]]) {
      const result = run(...args);
      assert.equal(result.status, 0, result.stderr);
      assert.equal(JSON.parse(result.stdout).status, "checked-author-self-review-required");
      assert.equal(JSON.parse(result.stdout).policy, "published");
      assert.equal(JSON.parse(result.stdout).baselinePolicy, args.length === 1 ? "published" : "structural");
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
  const bank = run("bank", "everyday-connections");
  assert.equal(bank.status, 0, bank.stderr);
  assert.equal(JSON.parse(bank.stdout).combined.length, 15);
  assert.equal(JSON.parse(bank.stdout).trainingPool.length, 100);
  assert.equal(JSON.parse(bank.stdout).mandatory.length, 15);
  for (const args of [["bank"], ["bank", "missing"], ["check", "--bad"], ["check", "--draft"], ["check", "--draft", "app/content/curriculum.ts"]]) {
    assert.notEqual(run(...args).status, 0);
  }
});
