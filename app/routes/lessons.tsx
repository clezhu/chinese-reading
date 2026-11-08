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
  return {
    username: user.username,
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
      <div className="page-heading"><div><p className="eyebrow">Your reading path</p><h1>Your lessons</h1><p>Welcome, <strong>{loaderData.username}</strong>. Build your character bank in order.</p></div><Form method="post" action="/logout"><button className="secondary" type="submit">Log out</button></Form></div>
      <aside className="notice">Early preview: these are illustrative curriculum fixtures, not final approved lessons. Read stories and practise characters you reveal. Revisiting a completed lesson preserves your completion and later lesson access.</aside>
      {loaderData.modules.map((module) => <section className="module" key={module.id} aria-labelledby={`module-${module.id}`}><h2 id={`module-${module.id}`}>{module.title}</h2><ol className="lesson-list" start={number + 1}>{module.lessons.map(({ lesson, status, phase, attemptId }) => <LessonCard key={lesson.id} lesson={lesson} status={status} phase={phase} attemptId={attemptId} number={++number} />)}</ol></section>)}
    </>
  );
}
