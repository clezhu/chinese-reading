import { Link, redirect } from "react-router";
import { cloudflareContext } from "../context";
import { requireUser } from "../lib/auth.server";
import { readForm, requireSameOriginPost } from "../lib/http.server";
import { requireLessonAccess, startIntroduction } from "../lib/progress.server";
import type { Route } from "./+types/lesson";

export async function loader({ request, context, params }: Route.LoaderArgs) {
  const db = context.get(cloudflareContext).env.DB;
  const user = await requireUser(request, db);
  const lesson = await requireLessonAccess(db, user.id, params.lessonId);
  return { lesson };
}

export async function action({ request, context, params }: Route.ActionArgs) {
  requireSameOriginPost(request);
  const db = context.get(cloudflareContext).env.DB;
  const user = await requireUser(request, db);
  await requireLessonAccess(db, user.id, params.lessonId);
  const form = await readForm(request);
  if (form.getAll("intent").length !== 1 || form.get("intent") !== "start") {
    throw new Response("Only starting the introduction is supported. Lessons cannot be completed here.", { status: 400 });
  }
  // Browser-supplied user IDs, phase, or completion fields are never consumed.
  await startIntroduction(db, user.id, params.lessonId);
  return redirect(`/lessons/${params.lessonId}`, { status: 303 });
}

export default function Lesson({ loaderData }: Route.ComponentProps) {
  const { lesson } = loaderData;
  return (
    <section>
      <Link className="back-link" to="/lessons">← Back to lessons</Link>
      <p className="eyebrow">{lesson.kind === "learning" ? "Learning · Character introduction" : "Revision"}</p>
      <h1>{lesson.title}</h1>
      {lesson.kind === "learning" ? <>
        <p className="intro-copy">Meet your five new characters together. Each card shows all its authored Mandarin readings, not just one pronunciation.</p>
        <ul className="character-grid" aria-label="New characters">{lesson.newCharacters.map((character) => <li className="character-card" key={character.id}><span className="hanzi" lang="zh-Hans">{character.hanzi}</span><span className="sr-only">Pinyin:</span><ul className="readings" aria-label={`Readings for ${character.hanzi}`}>{character.pinyin.map((reading) => <li lang="zh-Latn-pinyin" key={reading}>{reading}</li>)}</ul></li>)}</ul>
      </> : <p>Revision lessons introduce no new characters and start with a story. Revision practice is not published in this preview.</p>}
      <aside className="notice"><strong>Introduction only.</strong> Flashcard practice is coming next. Viewing these characters does not complete the lesson, and later lessons remain locked.</aside>
      <Link className="button secondary" to="/lessons">Return to lesson list</Link>
    </section>
  );
}
