import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { loadContent, repoRoot } from "../scripts/load-content.mjs";
import { availableBank, lengthGuidance, validateCurriculum, validateOccurrenceReference, validPinyin, withDrafts } from "../scripts/content-tools.mjs";

const { curriculum, taughtCharacters, orderedLessons } = await loadContent("app/content/curriculum.ts");
const { drafts } = await loadContent("authoring/drafts/initial-stories.ts");
const { revisionLessonFixture } = await loadContent("app/content/fixtures/revision.ts");
const copy = () => structuredClone(curriculum);
const first = (c) => c.modules[0].lessons[0];
const checkMutation = (mutate, pattern) => {
  const candidate = copy(); mutate(candidate);
  assert.match(validateCurriculum(candidate).errors.join("\n"), pattern);
};

test("illustrative curriculum keeps stable lesson IDs, five introductions each and Hanzi compatibility keys", () => {
  assert.deepEqual(orderedLessons().map((l) => l.id), ["first-characters", "people-and-places", "everyday-connections"]);
  assert.equal(validateCurriculum(curriculum).errors.length, 0);
  for (const lesson of orderedLessons()) {
    assert.equal(lesson.newCharacters.length, 5);
    assert.ok(lesson.contentRevision > 0);
    lesson.newCharacters.forEach((c) => assert.equal(c.id, c.hanzi));
  }
});

test("available bank derives prior/current/combined readings across module boundaries", () => {
  const bank = availableBank(curriculum, "everyday-connections");
  assert.equal(bank.prior.length, 10);
  assert.equal(bank.current.length, 5);
  assert.equal(bank.combined.length, 15);
  assert.deepEqual(bank.combined, taughtCharacters(bank.lessonId));
  assert.equal(availableBank(curriculum, "first-characters").prior.length, 0);
  const reordered = copy(); reordered.modules.reverse();
  assert.equal(taughtCharacters("everyday-connections", reordered).length, 5);
  assert.throws(() => taughtCharacters("missing"), /Unknown lesson/);
  assert.throws(() => availableBank(curriculum, "missing"), /Unknown lesson/);
});

test("revision lesson introduces nothing, inherits prior bank, and stays outside published lessons", () => {
  const content = copy(); content.modules.at(-1).lessons.push(revisionLessonFixture);
  assert.deepEqual(validateCurriculum(content).errors, []);
  assert.equal(taughtCharacters(revisionLessonFixture.id, content).length, 15);
  assert.equal(orderedLessons().length, 3);
  const invalid = structuredClone(content); invalid.modules.at(-1).lessons.at(-1).newCharacters = first(content).newCharacters;
  assert.match(validateCurriculum(invalid).errors.join("\n"), /zero characters/);
});

test("first fixture has repeated polyphonic taught 了, multi-sentence paragraphs and permanent-help occurrences", () => {
  const lesson = first(curriculum);
  assert.ok(lesson.story.paragraphs.length >= 2);
  lesson.story.paragraphs.forEach((p) => assert.ok(p.length >= 3));
  const readings = lesson.story.paragraphs.flat(2).filter((t) => typeof t !== "string" && t.hanzi === "了").map((t) => t.pinyin);
  assert.ok(readings.filter((r) => r === "le").length >= 2);
  assert.ok(readings.includes("liǎo"));
  const report = validateCurriculum(curriculum).reports[0];
  assert.ok(report.permanentHelp.includes("小"));
  assert.ok(!report.permanentHelp.includes("了"));
  assert.ok(report.taughtCount > 0 && report.taughtCount < report.hanziCount);
});

test("candidate drafts replace lessons together, reuse the taught bank, and remain unpublished", () => {
  assert.equal(drafts.length, 3);
  const candidate = withDrafts(curriculum, drafts);
  assert.deepEqual(validateCurriculum(candidate).errors, []);
  assert.equal(orderedLessons(candidate).length, 3);
  assert.ok(orderedLessons(candidate).every((l) => l.contentRevision === 3));
  assert.ok(orderedLessons().every((l) => l.contentRevision === 2));
  for (const lesson of orderedLessons(candidate)) {
    const storyHanzi = new Set(lesson.story.paragraphs.flat(2).filter((t) => typeof t !== "string").map((t) => t.hanzi));
    lesson.newCharacters.forEach((c) => assert.ok(storyHanzi.has(c.hanzi), `${lesson.id} must use ${c.hanzi}`));
  }
  assert.throws(() => withDrafts(curriculum, [drafts[0], drafts[0]]), /Duplicate draft/);
  assert.throws(() => withDrafts(curriculum, [{ ...drafts[0], lesson: { ...drafts[0].lesson, id: "unknown" } }]), /Unknown draft/);
  assert.throws(() => withDrafts(curriculum, [{ ...drafts[0], lesson: { ...drafts[0].lesson, contentRevision: 2 } }]), /newer/);
  const changed = structuredClone(drafts);
  changed[1].lesson.newCharacters[0] = changed[0].lesson.newCharacters[0];
  assert.match(validateCurriculum(withDrafts(curriculum, changed)).errors.join("\n"), /duplicate introduction/);
});

test("validator rejects invalid IDs, membership, revisions, introductions and incomplete definitions", () => {
  checkMutation((c) => c.modules.push(c.modules[0]), /duplicate ID/);
  checkMutation((c) => c.modules[1].lessons.push(first(c)), /duplicate ID/);
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
  checkMutation((c) => first(c).story.paragraphs[0][0][1].pinyin = "shí", /conflicts with authored/);
  checkMutation((c) => first(c).story.paragraphs[0][0][0].trainingWheel = true, /unexpected field/);
  checkMutation((c) => first(c).story.paragraphs[0][0].push(...first(c).story.paragraphs[0][1]), /split separate sentences/);
  assert.deepEqual(validateCurriculum(curriculum).errors, []); // includes yí/yì/bú and neutral ge
  for (const p of ["shì", "liǎo", "lüè", "nǚ", "de", "yāo"]) assert.ok(validPinyin(p));
  for (const p of ["shi4", "nǐ hǎo", "blah", "", "Shì", "shìì"]) assert.ok(!validPinyin(p));
});

test("pinyin accepts canonical tone positions, ü/ê and syllabic consonants", () => {
  const bases = ["a", "ai", "ao", "ei", "ou", "xiao", "yao", "jie", "liu", "gui", "lü", "nüe", "ê", "m", "n", "ng", "hm", "hng"];
  const marked = ["ā", "āi", "āo", "ēi", "ōu", "xiāo", "yāo", "jiē", "liū", "guī", "lǖ", "nüē", "ê\u0304", "m\u0304", "n\u0304", "n\u0304g", "hm\u0304", "hn\u0304g"];
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

test("unfamiliar characters are permanent help, never automatic validation errors", () => {
  const content = copy(); first(content).story.paragraphs[0][0][0] = { hanzi: "龟", pinyin: "guī" };
  const result = validateCurriculum(content);
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
  assert.equal(lengthGuidance(3).target, 100);
  assert.equal(lengthGuidance(99).target, 200);
  const content = copy(); first(content).story = { paragraphs: [[[{ hanzi: "的", pinyin: "de" }, "！"]]] };
  const result = validateCurriculum(content);
  assert.deepEqual(result.errors, []);
  assert.equal(result.reports[0].hanziCount, 1);
  assert.match(result.warnings.join(), /soft range/);
});

test("CLI checks current and candidate sets, prints bank definitions and rejects invalid arguments", () => {
  const run = (...args) => spawnSync(process.execPath, ["authoring/scripts/content.mjs", ...args], { cwd: repoRoot, encoding: "utf8" });
  for (const args of [["check"], ["check", "--draft", "authoring/drafts/initial-stories.ts"]]) {
    const result = run(...args);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(JSON.parse(result.stdout).status, "checked-not-language-approved");
  }
  const bank = run("bank", "everyday-connections");
  assert.equal(bank.status, 0, bank.stderr);
  assert.equal(JSON.parse(bank.stdout).combined.length, 15);
  for (const args of [["bank"], ["bank", "missing"], ["check", "--bad"], ["check", "--draft"], ["check", "--draft", "app/content/curriculum.ts"]]) {
    assert.notEqual(run(...args).status, 0);
  }
});
