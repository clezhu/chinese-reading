import { Form } from "react-router";
import { cloudflareContext } from "../context";
import { LessonCard } from "../components/lesson-card";
import { curriculum } from "../content/curriculum";
import { requireUser } from "../lib/auth.server";
import { getProgress, lessonStatus } from "../lib/progress.server";
import type { Route } from "./+types/lessons";

export async function loader({ request, context }: Route.LoaderArgs) {
  const db = context.get(cloudflareContext).env.DB;
  const user = await requireUser(request, db);
  const progress = await getProgress(db, user.id);
  const activeRevisit = curriculum.modules.flatMap((module) => module.lessons).find((lesson) => progress.some((row) => row.lesson_id === lesson.id && row.first_completed_at != null && row.phase !== "complete"));
  const nextUnfinished = curriculum.modules.flatMap((module) => module.lessons).find((lesson) => ["available", "in-progress"].includes(lessonStatus(lesson.id, progress)));
  return {
    username: user.username,
    guidanceId: activeRevisit?.id ?? nextUnfinished?.id,
    brandNew: progress.length === 0,
    modules: curriculum.modules.map((module) => ({ ...module, lessons: module.lessons.map((lesson) => {
      const current = progress.find((row) => row.lesson_id === lesson.id);
      return { lesson, status: lessonStatus(lesson.id, progress), phase: current?.phase, attemptId: current?.attempt_id };
    }) })),
  };
}

export default function Lessons({ loaderData }: Route.ComponentProps) {
  let number = 0;
  return (
    <>
      <div className="lessons-account"><span className="sr-only">{loaderData.username}</span><Form method="post" action="/logout"><button className="text-button" type="submit">Log out</button></Form></div>
      <h1>Lessons</h1>
      {loaderData.modules.map((module, index) => <section className="module" key={module.id} aria-labelledby={`module-${module.id}`}><h2 id={`module-${module.id}`}>Module {index + 1}: {module.title}</h2><p className="completion-count">{module.lessons.filter(({ status }) => status === "completed").length} of {module.lessons.length} lessons completed</p><ol className="lesson-list" start={number + 1}>{module.lessons.map(({ lesson, status, phase, attemptId }) => <LessonCard key={lesson.id} lesson={lesson} status={status} phase={phase} attemptId={attemptId} number={++number} guidance={loaderData.guidanceId === lesson.id ? loaderData.brandNew ? "Start here" : "Continue here" : undefined} />)}</ol></section>)}
      <p className="lessons-coming-soon">More lessons coming soon</p>
    </>
  );
}
