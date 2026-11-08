import { curriculum, findLesson, orderedLessons, type Curriculum } from "../content/curriculum";
import { enumerateStory, type StoryState } from "./story";

export type LessonProgress = {
  lesson_id: string;
  phase: "introduction" | "flashcards" | "story" | "revision-flashcards" | "complete";
  attempt_id: string;
  first_completed_at: number | null;
  last_completed_at: number | null;
  content_revision: number;
  revealed_occurrence_ids: string;
  updated_at: number;
  state_version: number;
  first_completed_content_revision: number | null;
  last_completed_content_revision: number | null;
};
export type LessonStatus = "available" | "locked" | "in-progress" | "completed";

export async function getProgress(db: D1Database, userId: string): Promise<LessonProgress[]> {
  const read = () => db.prepare("SELECT * FROM lesson_progress WHERE user_id = ?").bind(userId).all<LessonProgress>();
  const rows = await read();
  let reset = false;
  for (const row of rows.results) {
    const lesson = findLesson(row.lesson_id);
    if (!lesson || lesson.contentRevision === row.content_revision) continue;
    // Never let an older deployment/rollback downgrade newer saved practice.
    if (row.content_revision > lesson.contentRevision) {
      throw new Response("Saved progress uses newer lesson content. Reload after the site update finishes.", { status: 409 });
    }
    // A content edit replaces unfinished practice, never earned milestones.
    // A finished lesson stays finished; an active revisit restarts from scratch.
    await db.prepare(`UPDATE lesson_progress SET content_revision = ?, attempt_id = ?,
      phase = CASE WHEN phase = 'complete' THEN 'complete' ELSE ? END,
      revealed_occurrence_ids = '[]', state_version = 0, started_at = ?, updated_at = ?
      WHERE user_id = ? AND lesson_id = ? AND attempt_id = ? AND content_revision = ?`)
      .bind(lesson.contentRevision, crypto.randomUUID(), lesson.kind === "learning" ? "introduction" : "story",
        Date.now(), Date.now(), userId, lesson.id, row.attempt_id, row.content_revision).run();
    reset = true;
  }
  return reset ? (await read()).results : rows.results;
}

export function lessonStatus(lessonId: string, progress: readonly LessonProgress[], content: Curriculum = curriculum): LessonStatus {
  const lessons = orderedLessons(content);
  const index = lessons.findIndex((lesson) => lesson.id === lessonId);
  if (index < 0) return "locked";
  // Prerequisites are determined exclusively by ordered authored lists.
  if (lessons.slice(0, index).some((lesson) => progress.find((row) => row.lesson_id === lesson.id)?.first_completed_at == null)) return "locked";
  const current = progress.find((row) => row.lesson_id === lessonId);
  if (current?.first_completed_at != null) return "completed";
  return current ? "in-progress" : "available";
}

export async function requireLessonAccess(db: D1Database, userId: string, lessonId: string) {
  const lesson = findLesson(lessonId);
  if (!lesson) throw new Response("Lesson not found", { status: 404 });
  const progress = await getProgress(db, userId);
  if (lessonStatus(lessonId, progress) === "locked") throw new Response("Lesson locked", { status: 403 });
  return lesson;
}

export async function startIntroduction(db: D1Database, userId: string, lessonId: string) {
  // The write owns its own access check: do not rely on a previous page loader.
  const lesson = await requireLessonAccess(db, userId, lessonId);
  if (lesson.kind !== "learning") throw new Response("Revision practice is not available yet", { status: 400 });
  const now = Date.now();
  await db.prepare(
    "INSERT INTO lesson_progress (user_id, lesson_id, phase, attempt_id, started_at, updated_at, content_revision) VALUES (?, ?, 'introduction', ?, ?, ?, ?) ON CONFLICT(user_id, lesson_id) DO NOTHING",
  ).bind(userId, lessonId, crypto.randomUUID(), now, now, lesson.contentRevision).run();
}

export async function startFlashcards(db: D1Database, userId: string, lessonId: string, attemptId: string) {
  const lesson = await requireLessonAccess(db, userId, lessonId);
  if (lesson.kind !== "learning") throw new Response("No initial flashcards for revision lessons", { status: 400 });
  const now = Date.now();
  // A directly visited, not-yet-started introduction has no row or attempt ID.
  const result = attemptId === ""
    ? await db.prepare("INSERT INTO lesson_progress (user_id, lesson_id, phase, attempt_id, started_at, updated_at, content_revision) VALUES (?, ?, 'flashcards', ?, ?, ?, ?) ON CONFLICT(user_id, lesson_id) DO NOTHING")
      .bind(userId, lessonId, crypto.randomUUID(), now, now, lesson.contentRevision).run()
    : await db.prepare("UPDATE lesson_progress SET phase = 'flashcards', updated_at = ?, state_version = state_version + 1 WHERE user_id = ? AND lesson_id = ? AND attempt_id = ? AND content_revision = ? AND phase = 'introduction'")
      .bind(now, userId, lessonId, attemptId, lesson.contentRevision).run();
  if (result.meta.changes !== 1) throw new Response("This attempt changed. Reload the lesson to continue.", { status: 409 });
}

export async function passInitialDeck(db: D1Database, userId: string, lessonId: string, attemptId: string) {
  const lesson = await requireLessonAccess(db, userId, lessonId);
  // Intentionally trust self-assessment, never browser-supplied phase/owner/milestones.
  // The conditional write makes stale tabs, replays, and wrong-phase claims harmless.
  const result = await db.prepare("UPDATE lesson_progress SET phase = 'story', updated_at = ?, state_version = state_version + 1 WHERE user_id = ? AND lesson_id = ? AND attempt_id = ? AND content_revision = ? AND phase = 'flashcards'")
    .bind(Date.now(), userId, lessonId, attemptId, lesson.contentRevision).run();
  if (result.meta.changes !== 1) throw new Response("This attempt changed. Reload the lesson to continue.", { status: 409 });
}

export function storyState(row: LessonProgress): StoryState {
  return { attemptId: row.attempt_id, contentRevision: row.content_revision, phase: row.phase,
    revealed: JSON.parse(row.revealed_occurrence_ids), updatedAt: row.updated_at, version: row.state_version };
}

async function currentAttempt(db: D1Database, userId: string, lessonId: string, attemptId: string, revision: number) {
  const lesson = await requireLessonAccess(db, userId, lessonId);
  if (!lesson.story) throw new Response("Story not available", { status: 404 });
  if (revision !== lesson.contentRevision) throw new Response("Story content changed. Reload the lesson.", { status: 409 });
  const row = await db.prepare("SELECT * FROM lesson_progress WHERE user_id = ? AND lesson_id = ? AND attempt_id = ? AND content_revision = ?")
    .bind(userId, lessonId, attemptId, revision).first<LessonProgress>();
  if (!row) throw new Response("This attempt changed. Reload the lesson.", { status: 409 });
  return { lesson, row };
}

export async function revealOccurrence(db: D1Database, userId: string, lessonId: string, attemptId: string, revision: number, ref: string) {
  const { lesson } = await currentAttempt(db, userId, lessonId, attemptId, revision);
  if (!enumerateStory(lesson).some((entry) => entry.ref === ref && !entry.permanent)) {
    throw new Response("Invalid or permanent-help occurrence", { status: 400 });
  }
  // JSON set-add happens inside one SQLite statement, never read/modify/write.
  const row = await db.prepare(`UPDATE lesson_progress SET revealed_occurrence_ids =
    CASE WHEN EXISTS (SELECT 1 FROM json_each(revealed_occurrence_ids) WHERE value = ?)
      THEN revealed_occurrence_ids ELSE json_insert(revealed_occurrence_ids, '$[#]', ?) END,
    state_version = state_version + 1, updated_at = ?
    WHERE user_id = ? AND lesson_id = ? AND attempt_id = ? AND content_revision = ? AND phase = 'story'
    RETURNING *`).bind(ref, ref, Date.now(), userId, lessonId, attemptId, revision).first<LessonProgress>();
  if (!row) throw new Response("Reading already ended or the attempt changed. Reload the lesson.", { status: 409 });
  return storyState(row);
}

/** Shared completion assignments: the caller supplies a trusted SQL predicate,
 * never browser input. #6 can reuse this for a passed revision deck. */
function completionFields(when: string) {
  return `first_completed_at = CASE WHEN ${when} THEN COALESCE(first_completed_at, ?1) ELSE first_completed_at END,
    last_completed_at = CASE WHEN ${when} THEN MAX(COALESCE(last_completed_at, ?1), ?1) ELSE last_completed_at END,
    first_completed_content_revision = CASE WHEN ${when} THEN COALESCE(first_completed_content_revision, content_revision) ELSE first_completed_content_revision END,
    last_completed_content_revision = CASE WHEN ${when} THEN content_revision ELSE last_completed_content_revision END`;
}

export async function finishReading(db: D1Database, userId: string, lessonId: string, attemptId: string, revision: number) {
  const { row: previous } = await currentAttempt(db, userId, lessonId, attemptId, revision);
  // A lost Finish response can be retried without changing milestones/deck.
  if (previous.phase === "revision-flashcards" || previous.phase === "complete") return storyState(previous);
  const row = await db.prepare(`UPDATE lesson_progress SET
    phase = CASE WHEN json_array_length(revealed_occurrence_ids) = 0 THEN 'complete' ELSE 'revision-flashcards' END,
    ${completionFields("json_array_length(revealed_occurrence_ids) = 0")},
    updated_at = ?1, state_version = state_version + 1
    WHERE user_id = ?2 AND lesson_id = ?3 AND attempt_id = ?4 AND content_revision = ?5 AND phase = 'story'
    RETURNING *`).bind(Date.now(), userId, lessonId, attemptId, revision).first<LessonProgress>();
  if (row) return storyState(row);
  // Another concurrent Finish may have won while this one was in flight.
  const { row: latest } = await currentAttempt(db, userId, lessonId, attemptId, revision);
  if (latest.phase === "revision-flashcards" || latest.phase === "complete") return storyState(latest);
  throw new Response("This attempt is not in the story phase. Reload the lesson.", { status: 409 });
}

/** No public route accepts a revision-passed claim in #5. #6 connects this
 * shared, guarded completion operation to the revision mastery interface. */
export async function completeRevisionDeck(db: D1Database, userId: string, lessonId: string, attemptId: string, revision: number) {
  await currentAttempt(db, userId, lessonId, attemptId, revision);
  const row = await db.prepare(`UPDATE lesson_progress SET phase = 'complete', ${completionFields("1")},
    updated_at = ?1, state_version = state_version + 1
    WHERE user_id = ?2 AND lesson_id = ?3 AND attempt_id = ?4 AND content_revision = ?5 AND phase = 'revision-flashcards'
    RETURNING *`).bind(Date.now(), userId, lessonId, attemptId, revision).first<LessonProgress>();
  if (!row) throw new Response("This attempt changed. Reload the lesson.", { status: 409 });
  return storyState(row);
}
