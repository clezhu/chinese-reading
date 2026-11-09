import { curriculum, orderedLessons, type Curriculum, type Lesson } from "../app/content/curriculum";
import { enumerateStory } from "../app/lib/story";

// Runtime assertions follow authored order and authored occurrence pronunciation,
// not the illustrative stories/character lists from an earlier deployment.
export const lessons = orderedLessons();
export const first = lessons[0];
export const lessonPath = (lesson: Lesson) => `/lessons/${lesson.id}`;
export const firstTitle = first.title;
export const nextTitle = lessons[1].title;

export function storyCandidates(lesson: Lesson = first, content: Curriculum = curriculum) {
  const occurrences = enumerateStory(lesson, content);
  const taught = occurrences.filter((entry) => !entry.permanent);
  const permanent = occurrences.filter((entry) => entry.permanent);
  const distinct = taught.filter((entry, index) => taught.findIndex((other) => other.hanzi === entry.hanzi) === index);
  const repeated = taught.filter((entry) => entry.hanzi === taught[0]?.hanzi);
  const punctuation = (lesson.story?.paragraphs ?? []).flatMap((paragraph, p) => paragraph.flatMap((sentence, s) =>
    sentence.flatMap((token, t) => typeof token === "string" ? [`${p}:${s}:${t}`] : [])));
  if (taught.length < 2 || distinct.length < 2) throw new Error(`Test needs at least two taught characters in ${lesson.id}`);
  return { occurrences, taught, permanent, distinct, repeated, punctuation };
}

export const candidates = storyCandidates();
export const firstRef = candidates.taught[0].ref;
export const secondRef = candidates.taught[1].ref;
export const lastRef = candidates.taught.at(-1)!.ref;
export const punctuationRef = candidates.punctuation[0];
export const permanentRef = candidates.permanent[0]?.ref;
