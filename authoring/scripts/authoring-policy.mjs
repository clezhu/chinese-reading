import { readFileSync } from "node:fs";

// Offline only. Never import authoring data or policy into the application.
const frequency = JSON.parse(readFileSync(new URL("../data/subtlex-ch-characters.json", import.meta.url), "utf8"));
export const trainingPool = Object.freeze(frequency.slice(0, 100).map(({ hanzi }) => hanzi));
const anchors = [[5, 60], [50, 75], [100, 90], [250, 145], [500, 230], [1000, 400]];

export function frequencyGroup(learningNumber) {
  if (!Number.isSafeInteger(learningNumber) || learningNumber < 1) throw new Error("Learning number must be a positive safe integer");
  const group = frequency.slice((learningNumber - 1) * 5, learningNumber * 5).map(({ hanzi }) => hanzi);
  if (group.length !== 5) throw new Error("Frequency table has no complete group for this learning number");
  return group;
}

/** Successive gaps 1,1,2,3,5,8… produce offsets 1,2,4,7,12,20… */
export function fibonacciOffsets(through) {
  if (!Number.isSafeInteger(through) || through < 0) throw new Error("Offset horizon must be a nonnegative safe integer");
  const offsets = [];
  let offset = 0, gap = 1, nextGap = 1;
  while (gap <= through - offset) {
    offset += gap;
    offsets.push(offset);
    [gap, nextGap] = [nextGap, gap + nextGap];
  }
  return offsets;
}

function nextOffset(age) {
  let offset = 0, gap = 1, nextGap = 1;
  do {
    offset += gap;
    [gap, nextGap] = [nextGap, gap + nextGap];
  } while (offset <= age);
  return offset;
}

/** Targets are fractional when interpolated; only the suggested bounds round. */
export function lengthForIntroductions(count, { revision = false } = {}) {
  if (!Number.isSafeInteger(count) || count < 0) throw new Error("Introduction count must be a nonnegative safe integer");
  let target = anchors.at(-1)[1];
  if (count <= anchors[0][0]) target = anchors[0][1];
  else {
    for (let i = 1; i < anchors.length; i++) {
      const [x, y] = anchors[i], [px, py] = anchors[i - 1];
      if (count <= x) { target = py + (count - px) * (y - py) / (x - px); break; }
    }
  }
  if (revision) target *= 5;
  return { target, min: Math.floor(target * 0.75), max: Math.ceil(target * 1.25), unit: "Hanzi occurrences" };
}

/** Pure static schedule. Extra appearances and revisions never reset a clock. */
export function authoringPlan(content) {
  const lessons = content.modules.flatMap((module) => module.lessons);
  const introductions = [], plans = [], errors = [];
  let learningNumber = 0, checkpointCovered = 0;
  for (const lesson of lessons) {
    const prior = introductions.map(({ character }) => character);
    const current = [...lesson.newCharacters];
    let due = [], revisionTargets = [], expectedIntroductions = [];
    if (lesson.kind === "learning") {
      if (learningNumber > 0 && learningNumber % 10 === 0 && checkpointCovered !== learningNumber) {
        errors.push(`${lesson.id}: missing revision checkpoint after learning lesson ${learningNumber}`);
      }
      learningNumber++;
      expectedIntroductions = frequencyGroup(learningNumber);
      const offsets = new Set(fibonacciOffsets(learningNumber - 1));
      due = introductions.filter((entry) => offsets.has(learningNumber - entry.learningNumber)).map(({ character }) => character.hanzi);
      introductions.push(...current.map((character) => ({ character, learningNumber })));
    } else if (lesson.kind === "revision") {
      if (!learningNumber || learningNumber % 10 !== 0 || checkpointCovered === learningNumber) {
        errors.push(`${lesson.id}: revision checkpoint must occur once after each 10 learning lessons / 50 introductions`);
      }
      revisionTargets = prior.slice(-50).map((character) => character.hanzi);
      checkpointCovered = learningNumber;
    }
    const combined = [...prior, ...current];
    plans.push({
      lessonId: lesson.id, kind: lesson.kind, learningNumber,
      cumulativeIntroduced: introductions.length,
      prior, current, combined, expectedIntroductions, trainingPool: [...trainingPool],
      allowed: [...new Set([...combined.map((character) => character.hanzi), ...trainingPool])],
      newTargets: current.map((character) => character.hanzi), due, revisionTargets,
      mandatory: [...new Set([...current.map((character) => character.hanzi), ...due, ...revisionTargets])],
      guidance: lengthForIntroductions(introductions.length, { revision: lesson.kind === "revision" }),
    });
  }
  // Only the next future obligation per introduction is needed; the rule defines
  // all subsequent ones. End-of-publication obligations are pending, not errors.
  const pending = introductions.map(({ character, learningNumber: introducedAt }) => ({
    type: "fibonacci", hanzi: character.hanzi, introducedAt,
    learningNumber: introducedAt + nextOffset(learningNumber - introducedAt), status: "pending",
  }));
  const checkpoint = learningNumber && learningNumber % 10 === 0 && checkpointCovered !== learningNumber
    ? learningNumber : (Math.floor(learningNumber / 10) + 1) * 10;
  pending.push({ type: "revision", afterLearningNumber: checkpoint, introductions: 50, status: "pending" });
  return { plans, pending, errors };
}

export function authoringBrief(content, lessonId) {
  const plan = authoringPlan(content).plans.find((plan) => plan.lessonId === lessonId);
  if (!plan) throw new Error(`Unknown lesson: ${lessonId}`);
  return {
    ...plan,
    workflow: [
      "Use only this supplied brief and pronunciation references; do not read previous stories.",
      "Write freely: a coherent natural story within the allowed bank, including every mandatory target.",
      "Write enjoyable reading for an orally fluent Mandarin speaker: a complete small situation, natural dialogue where useful, not disconnected textbook sentences or forced childish exchanges.",
      "Reuse new characters many times where natural, but no fixed repetition count or padding is required. Change an unworkable premise rather than break character constraints.",
      "No theme, continuity, inherited style or comparison with earlier stories is required; accidental similarity is fine.",
      "Self-review meaningful use, naturalness, meaning, pronunciation, boundaries and training-wheel load.",
      "Run authoring:check on the candidate; revise and self-review until hard checks pass.",
    ],
  };
}

/** Invoke only after structural validation; occurrence coverage is mechanical,
 * meaningful reuse and language quality remain the author's self-review. */
export function validateAuthoringPolicy(content) {
  const schedule = authoringPlan(content);
  const errors = [...schedule.errors];
  const lessons = content.modules.flatMap((module) => module.lessons);
  for (const [index, lesson] of lessons.entries()) {
    const plan = schedule.plans[index];
    if (lesson.kind === "learning" && lesson.newCharacters.map(({ hanzi }) => hanzi).join("") !== plan.expectedIntroductions.join("")) {
      errors.push(`${lesson.id}: exact frequency introductions required: ${plan.expectedIntroductions.join("")}`);
    }
    const occurrences = new Set(lesson.story?.paragraphs.flat(2).filter((token) => typeof token !== "string").map(({ hanzi }) => hanzi));
    const allowed = new Set(plan.allowed);
    for (const hanzi of occurrences) if (!allowed.has(hanzi)) errors.push(`${lesson.id}: illegal Hanzi ${hanzi}; allowed set is taught + top 100`);
    for (const hanzi of plan.mandatory) if (!occurrences.has(hanzi)) errors.push(`${lesson.id}: missing mandatory target ${hanzi} (new, Fibonacci due, or revision coverage; requires at least one occurrence)`);
  }
  return { errors, plans: schedule.plans, pending: schedule.pending };
}
