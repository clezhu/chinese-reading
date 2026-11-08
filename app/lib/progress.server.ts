import { curriculum, findLesson, orderedLessons, type Curriculum } from "../content/curriculum";

export type LessonProgress = {
  lesson_id: string;
  phase: "introduction" | "flashcards" | "story" | "revision-flashcards" | "complete";
  attempt_id: string;
  first_completed_at: number | null;
  last_completed_at: number | null;
};
export type LessonStatus = "available" | "locked" | "in-progress" | "completed";

export async function getProgress(db: D1Database, userId: string): Promise<LessonProgress[]> {
  const rows = await db.prepare(
    "SELECT lesson_id, phase, attempt_id, first_completed_at, last_completed_at FROM lesson_progress WHERE user_id = ?",
  ).bind(userId).all<LessonProgress>();
  return rows.results;
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
    "INSERT INTO lesson_progress (user_id, lesson_id, phase, attempt_id, started_at, updated_at) VALUES (?, ?, 'introduction', ?, ?, ?) ON CONFLICT(user_id, lesson_id) DO NOTHING",
  ).bind(userId, lessonId, crypto.randomUUID(), now, now).run();
}

export async function startFlashcards(db: D1Database, userId: string, lessonId: string, attemptId: string) {
  const lesson = await requireLessonAccess(db, userId, lessonId);
  if (lesson.kind !== "learning") throw new Response("No initial flashcards for revision lessons", { status: 400 });
  const now = Date.now();
  // A directly visited, not-yet-started introduction has no row or attempt ID.
  const result = attemptId === ""
    ? await db.prepare("INSERT INTO lesson_progress (user_id, lesson_id, phase, attempt_id, started_at, updated_at) VALUES (?, ?, 'flashcards', ?, ?, ?) ON CONFLICT(user_id, lesson_id) DO NOTHING")
      .bind(userId, lessonId, crypto.randomUUID(), now, now).run()
    : await db.prepare("UPDATE lesson_progress SET phase = 'flashcards', updated_at = ? WHERE user_id = ? AND lesson_id = ? AND attempt_id = ? AND phase = 'introduction'")
      .bind(now, userId, lessonId, attemptId).run();
  if (result.meta.changes !== 1) throw new Response("This attempt changed. Reload the lesson to continue.", { status: 409 });
}

export async function passInitialDeck(db: D1Database, userId: string, lessonId: string, attemptId: string) {
  await requireLessonAccess(db, userId, lessonId);
  // Intentionally trust self-assessment, never browser-supplied phase/owner/milestones.
  // The conditional write makes stale tabs, replays, and wrong-phase claims harmless.
  const result = await db.prepare("UPDATE lesson_progress SET phase = 'story', updated_at = ? WHERE user_id = ? AND lesson_id = ? AND attempt_id = ? AND phase = 'flashcards'")
    .bind(Date.now(), userId, lessonId, attemptId).run();
  if (result.meta.changes !== 1) throw new Response("This attempt changed. Reload the lesson to continue.", { status: 409 });
}
