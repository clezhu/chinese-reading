import { curriculum, findLesson, orderedLessons, type Curriculum } from "../content/curriculum";

export type LessonProgress = {
  lesson_id: string;
  phase: "introduction";
  first_completed_at: number | null;
  last_completed_at: number | null;
};
export type LessonStatus = "available" | "locked" | "in-progress" | "completed";

export async function getProgress(db: D1Database, userId: string): Promise<LessonProgress[]> {
  const rows = await db.prepare(
    "SELECT lesson_id, phase, first_completed_at, last_completed_at FROM lesson_progress WHERE user_id = ?",
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
    "INSERT INTO lesson_progress (user_id, lesson_id, phase, started_at, updated_at) VALUES (?, ?, 'introduction', ?, ?) ON CONFLICT(user_id, lesson_id) DO NOTHING",
  ).bind(userId, lessonId, now, now).run();
}
