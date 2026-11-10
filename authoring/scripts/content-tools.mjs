import { lengthForIntroductions, validateAuthoringPolicy } from "./authoring-policy.mjs";

const hanziPattern = /^\p{Script=Han}$/u;
const punctuationPattern = /^\p{Punctuation}+$/u;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const pinyinPattern = /^[a-züê]+$/u;
const syllables = new Set((
  "a ai an ang ao ba bai ban bang bao bei ben beng bi bia bian biao bie bin bing bo bu " +
  "ca cai can cang cao ce cen ceng cha chai chan chang chao che chen cheng chi chong chou chu chua chuai chuan chuang chui chun chuo ci cong cou cu cuan cui cun cuo " +
  "da dai dan dang dao de dei den deng di dia dian diao die ding diu dong dou du duan dui dun duo " +
  "e ei en eng er ê fa fan fang fei fen feng fo fou fu " +
  "ga gai gan gang gao ge gei gen geng gong gou gu gua guai guan guang gui gun guo " +
  "ha hai han hang hao he hei hen heng hong hou hu hua huai huan huang hui hun huo " +
  "ji jia jian jiang jiao jie jin jing jiong jiu ju juan jue jun " +
  "ka kai kan kang kao ke kei ken keng kong kou ku kua kuai kuan kuang kui kun kuo " +
  "la lai lan lang lao le lei leng li lia lian liang liao lie lin ling liu lo long lou lu luan lun luo lü lüe " +
  "ma mai man mang mao me mei men meng mi mian miao mie min ming miu mo mou mu " +
  "na nai nan nang nao ne nei nen neng ni nian niang niao nie nin ning niu nong nou nu nuan nuo nü nüe " +
  "o ou pa pai pan pang pao pei pen peng pi pian piao pie pin ping po pou pu " +
  "qi qia qian qiang qiao qie qin qing qiong qiu qu quan que qun " +
  "ran rang rao re ren reng ri rong rou ru rua ruan rui run ruo " +
  "sa sai san sang sao se sen seng sha shai shan shang shao she shei shen sheng shi shou shu shua shuai shuan shuang shui shun shuo si song sou su suan sui sun suo " +
  "ta tai tan tang tao te teng ti tian tiao tie ting tong tou tu tuan tui tun tuo " +
  "wa wai wan wang wei wen weng wo wu xi xia xian xiang xiao xie xin xing xiong xiu xu xuan xue xun " +
  "ya yan yang yao ye yi yin ying yo yong you yu yuan yue yun za zai zan zang zao ze zei zen zeng " +
  "zha zhai zhan zhang zhao zhe zhei zhen zheng zhi zhong zhou zhu zhua zhuai zhuan zhuang zhui zhun zhuo zi zong zou zu zuan zui zun zuo m n ng hm hng"
).split(" "));
const record = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const plain = (reading) => reading.normalize("NFD").replace(/[\u0300\u0301\u0304\u030c]/gu, "").normalize("NFC");
export function validPinyin(value) {
  if (typeof value !== "string" || value !== value.normalize("NFC")) return false;
  const base = plain(value);
  if (!pinyinPattern.test(base) || !syllables.has(base)) return false;
  const tones = value.normalize("NFD").match(/[\u0300\u0301\u0304\u030c]/gu) ?? [];
  if (!tones.length) return true;
  if (tones.length !== 1) return false;
  // Mark a first, then e (including ê), then o in ou; otherwise the last
  // vowel (iu/ui included). Vowelless syllables mark their syllabic m/n.
  let index = base.indexOf("a");
  if (index < 0) index = base.search(/[eê]/u);
  if (index < 0) index = base.indexOf("ou");
  if (index < 0) index = base.search(/[iouü](?!.*[iouü])/u);
  if (index < 0) index = base.search(/[mn]/u);
  const canonical = (base.slice(0, index + 1) + tones[0] + base.slice(index + 1)).normalize("NFC");
  return value === canonical;
}

export function availableBank(content, lessonId) {
  const lessons = content.modules.flatMap((module) => module.lessons);
  const index = lessons.findIndex((lesson) => lesson.id === lessonId);
  if (index < 0) throw new Error(`Unknown lesson: ${lessonId}`);
  const prior = lessons.slice(0, index).flatMap((lesson) => lesson.newCharacters);
  const current = [...lessons[index].newCharacters];
  return { lessonId, prior, current, combined: [...prior, ...current] };
}

/** Soft target only: learning level is 1-based, revision uses preceding level. */
export function lengthGuidance(level, { revision = false } = {}) {
  if (!Number.isInteger(level) || level < 1) throw new Error("Level must be a positive integer");
  return lengthForIntroductions(level * 5, { revision });
}

function consistentReading(hanzi, reading, readings) {
  if (readings.includes(reading)) return true;
  // Surface sandhi is authored, never inferred by the runtime. Neutral readings
  // share the lexical syllable; appropriateness still needs language review.
  if (reading === plain(reading) && readings.some((r) => plain(r) === reading)) return true;
  if (hanzi === "一" && readings.includes("yī") && ["yí", "yì"].includes(reading)) return true;
  return hanzi === "不" && readings.includes("bù") && reading === "bú";
}

// Structural mode is for generic fixtures, not publication. Use the named
// publication API below (also used by CLI/build) for the canonical policy.
export function validateCurriculum(content, options = {}) {
  return validateContent(content, options);
}

/** Scoped validation is explicitly not publication approval. Metadata is global. */
export function validatePlannedLessons(content, lessonIds) {
  if (!Array.isArray(lessonIds) || new Set(lessonIds).size !== lessonIds.length) throw new Error("Expected unique lesson IDs");
  const known = new Set(content.modules.flatMap((module) => module.lessons.map((lesson) => lesson.id)));
  for (const id of lessonIds) if (!known.has(id)) throw new Error(`Unknown planned lesson: ${id}`);
  return { ...validateContent(content, { policy: "published" }, new Set(lessonIds)), policy: "planned-lessons" };
}

function validateContent(content, { requireStories = false, policy = "structural" } = {}, storyLessonIds) {
  if (!["structural", "published"].includes(policy)) throw new Error("Unknown validation policy");
  if (policy === "published") requireStories = true;
  const errors = [], warnings = [], reports = [];
  const fail = (path, message) => errors.push(`${path}: ${message}`);
  const keys = (value, allowed, path) => {
    for (const key of Object.keys(value)) if (!allowed.includes(key)) fail(path, `unexpected field ${key}`);
  };
  if (!record(content) || !Array.isArray(content.modules) || !content.modules.length) {
    return { errors: ["curriculum: expected nonempty ordered modules array"], warnings, reports, policy };
  }
  keys(content, ["modules"], "curriculum");
  const ids = new Set(), introductions = new Map(), lessons = [];
  function id(value, path) {
    if (typeof value !== "string" || !slugPattern.test(value)) fail(path, "expected stable slug ID");
    else if (ids.has(value)) fail(path, `duplicate ID ${value}`);
    else ids.add(value);
  }
  for (const [mi, module] of content.modules.entries()) {
    const mp = `modules[${mi}]`;
    if (!record(module)) { fail(mp, "expected module object"); continue; }
    keys(module, ["id", "title", "lessons"], mp);
    id(module.id, mp);
    if (typeof module.title !== "string" || !module.title.trim()) fail(mp, "title required");
    if (!Array.isArray(module.lessons) || !module.lessons.length) { fail(mp, "expected nonempty ordered lessons array"); continue; }
    for (const [li, lesson] of module.lessons.entries()) {
      const lp = `${mp}.lessons[${li}]`;
      if (!record(lesson)) { fail(lp, "expected lesson object"); continue; }
      keys(lesson, ["id", "title", "description", "kind", "contentRevision", "newCharacters", "story"], lp);
      id(lesson.id, lp);
      for (const field of ["title", "description"]) {
        if (typeof lesson[field] !== "string" || !lesson[field].trim()) fail(lp, `${field} required`);
      }
      if (!Number.isSafeInteger(lesson.contentRevision) || lesson.contentRevision < 1) fail(lp, "contentRevision must be a positive safe integer");
      if (!["learning", "revision"].includes(lesson.kind)) fail(lp, "unknown lesson kind");
      const chars = lesson.newCharacters;
      if (!Array.isArray(chars)) { fail(lp, "newCharacters must be an array"); continue; }
      if (lesson.kind === "learning" && chars.length !== 5) fail(lp, "initial learning lessons must introduce five characters");
      if (lesson.kind === "revision" && chars.length) fail(lp, "revision lessons must introduce zero characters");
      const validChars = [];
      for (const [ci, character] of chars.entries()) {
        const cp = `${lp}.newCharacters[${ci}]`;
        if (!record(character)) { fail(cp, "expected character object"); continue; }
        keys(character, ["id", "hanzi", "pinyin"], cp);
        if (typeof character.hanzi !== "string" || !hanziPattern.test(character.hanzi)) { fail(cp, "expected one Hanzi"); continue; }
        if (character.id !== character.hanzi) fail(cp, "character id must equal hanzi");
        if (introductions.has(character.hanzi)) fail(cp, `duplicate introduction ${character.hanzi}`);
        if (!Array.isArray(character.pinyin) || !character.pinyin.length || character.pinyin.some((r) => !validPinyin(r))) {
          fail(cp, "complete nonempty authored reading list with valid pinyin required");
        } else {
          if (new Set(character.pinyin).size !== character.pinyin.length) fail(cp, "duplicate reading");
          introductions.set(character.hanzi, character.pinyin);
        }
        validChars.push(character);
      }
      lessons.push({ lesson, chars: validChars, path: lp });
    }
  }
  const taught = new Set();
  let level = 0;
  for (const { lesson, chars, path } of lessons) {
    chars.forEach((c) => taught.add(c.hanzi));
    if (lesson.kind === "learning") level++;
    const report = { lessonId: lesson.id, hanziCount: 0, taughtCount: 0, permanentHelp: [], guidance: lengthGuidance(Math.max(1, level), { revision: lesson.kind === "revision" }) };
    reports.push(report);
    if (storyLessonIds && !storyLessonIds.has(lesson.id)) {
      report.status = "not-checked";
      continue;
    }
    if (lesson.story === undefined) {
      if (requireStories) fail(path, "published/candidate lesson requires a story");
      else warnings.push(`${lesson.id}: no story yet`);
      continue;
    }
    const story = lesson.story;
    if (!record(story)) { fail(path, "story must be an object"); continue; }
    keys(story, ["paragraphs"], `${path}.story`);
    if (!Array.isArray(story.paragraphs) || !story.paragraphs.length) { fail(path, "story requires nonempty paragraphs"); continue; }
    const unfamiliar = new Set();
    for (const [pi, paragraph] of story.paragraphs.entries()) {
      const pp = `${path}.story.paragraphs[${pi}]`;
      if (!Array.isArray(paragraph) || !paragraph.length) { fail(pp, "paragraph requires sentences"); continue; }
      for (const [si, sentence] of paragraph.entries()) {
        const sp = `${pp}[${si}]`;
        if (!Array.isArray(sentence) || !sentence.length) { fail(sp, "sentence requires tokens"); continue; }
        let hanziCount = 0;
        for (const [ti, token] of sentence.entries()) {
          const tp = `${sp}[${ti}]`;
          if (typeof token === "string") {
            if (!punctuationPattern.test(token)) fail(tp, "string tokens must contain punctuation only");
            continue;
          }
          if (!record(token)) { fail(tp, "expected Hanzi token or punctuation string"); continue; }
          keys(token, ["hanzi", "pinyin"], tp);
          if (typeof token.hanzi !== "string" || !hanziPattern.test(token.hanzi)) { fail(tp, "expected one Hanzi per token"); continue; }
          hanziCount++; report.hanziCount++;
          if (taught.has(token.hanzi)) report.taughtCount++;
          else unfamiliar.add(token.hanzi);
          if (!validPinyin(token.pinyin)) fail(tp, "valid authored occurrence pinyin required");
          else if (introductions.has(token.hanzi) && !consistentReading(token.hanzi, token.pinyin, introductions.get(token.hanzi))) {
            fail(tp, `${token.hanzi} reading ${token.pinyin} conflicts with authored introductions`);
          }
        }
        if (!hanziCount) fail(sp, "sentence requires at least one Hanzi");
        // Sentence segmentation cannot be proven by shape alone, but obvious
        // paragraph-as-sentence mistakes should not silently pass.
        const text = sentence.map((t) => typeof t === "string" ? t : t?.hanzi ?? "").join("");
        if (!/[。！？][”’」』）]*$/u.test(text)) fail(sp, "sentence must end in Chinese sentence punctuation (optional closing quote)");
        if (/[。！？][”’」』）]*[^。！？”’」』）]/u.test(text)) fail(sp, "split separate sentences into separate arrays");
      }
    }
    report.permanentHelp = [...unfamiliar];
    if (report.hanziCount < report.guidance.min || report.hanziCount > report.guidance.max) {
      warnings.push(`${lesson.id}: ${report.hanziCount} Hanzi; soft range ${report.guidance.min}–${report.guidance.max} (not a validity error)`);
    }
  }
  if (policy === "published" && !errors.length) {
    const authoring = validateAuthoringPolicy(content, { storyLessonIds });
    errors.push(...authoring.errors);
    for (const [index, report] of reports.entries()) {
      const { newTargets, due, revisionTargets, mandatory, expectedIntroductions } = authoring.plans[index];
      Object.assign(report, { newTargets, due, revisionTargets, mandatory, expectedIntroductions });
    }
    return { errors, warnings, reports, policy: storyLessonIds ? "planned-lessons" : policy, pending: authoring.pending };
  }
  return { errors, warnings, reports, policy };
}

export function validatePublishedCurriculum(content) {
  return validateCurriculum(content, { policy: "published" });
}

/** Candidate lessons REPLACE matching stable IDs in their existing positions. */
export function withDrafts(content, drafts) {
  if (!Array.isArray(drafts)) throw new Error("Expected drafts array");
  const replacements = new Map();
  const ids = new Set(content.modules.flatMap((m) => m.lessons.map((l) => l.id)));
  for (const draft of drafts) {
    if (draft?.status !== "draft" || !record(draft.lesson)) throw new Error("Expected {status: 'draft', lesson}");
    const lesson = draft.lesson;
    if (!ids.has(lesson.id)) throw new Error(`Unknown draft target: ${lesson.id}`);
    if (replacements.has(lesson.id)) throw new Error(`Duplicate draft target: ${lesson.id}`);
    const current = content.modules.flatMap((m) => m.lessons).find((l) => l.id === lesson.id);
    if (!Number.isSafeInteger(lesson.contentRevision) || lesson.contentRevision <= current.contentRevision) throw new Error(`Draft ${lesson.id} must propose a newer contentRevision`);
    replacements.set(lesson.id, lesson);
  }
  return { ...content, modules: content.modules.map((m) => ({ ...m, lessons: m.lessons.map((l) => replacements.get(l.id) ?? l) })) };
}

/** Offline reference check; reader/server additionally enforce attempt and taught status. */
export function validateOccurrenceReference(lesson, reference) {
  if (!record(reference) || reference.contentRevision !== lesson.contentRevision) return ["contentRevision mismatch"];
  const { paragraphIndex: p, sentenceIndex: s, tokenIndex: t } = reference;
  if (![p, s, t].every((i) => Number.isSafeInteger(i) && i >= 0)) return ["indexes must be nonnegative safe integers"];
  const token = lesson.story?.paragraphs?.[p]?.[s]?.[t];
  return record(token) && hanziPattern.test(token.hanzi) ? [] : ["reference must address a Hanzi token, not punctuation or a missing index"];
}
