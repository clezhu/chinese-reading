import { data, Form, Link, redirect, useNavigation } from "react-router";
import { Flashcards } from "../components/flashcards";
import { cloudflareContext } from "../context";
import { requireUser } from "../lib/auth.server";
import { readForm, requireSameOriginPost } from "../lib/http.server";
import { getProgress, passInitialDeck, requireLessonAccess, startFlashcards, startIntroduction } from "../lib/progress.server";
import type { Route } from "./+types/lesson";

export async function loader({ request, context, params }: Route.LoaderArgs) {
  const db = context.get(cloudflareContext).env.DB;
  const user = await requireUser(request, db);
  const lesson = await requireLessonAccess(db, user.id, params.lessonId);
  const progress = (await getProgress(db, user.id)).find((row) => row.lesson_id === lesson.id) ?? null;
  return { lesson, progress, userId: user.id };
}

export async function action({ request, context, params }: Route.ActionArgs) {
  requireSameOriginPost(request);
  const db = context.get(cloudflareContext).env.DB;
  const user = await requireUser(request, db);
  await requireLessonAccess(db, user.id, params.lessonId);
  const form = await readForm(request);
  const intent = form.get("intent");
  if (form.getAll("intent").length !== 1 || !["start", "start-flashcards", "deck-passed"].includes(intent ?? "")) {
    throw new Response("Unsupported lesson action. Lessons cannot be completed here.", { status: 400 });
  }
  // Browser-supplied user IDs, phase, or completion fields are never consumed.
  if (intent === "start") await startIntroduction(db, user.id, params.lessonId);
  else {
    if (form.getAll("attempt_id").length !== 1) throw new Response("An attempt ID is required", { status: 400 });
    try {
      if (intent === "start-flashcards") await startFlashcards(db, user.id, params.lessonId, form.get("attempt_id")!);
      else await passInitialDeck(db, user.id, params.lessonId, form.get("attempt_id")!);
    } catch (error) {
      if (error instanceof Response) return data({ error: await error.text() }, { status: error.status });
      console.error("Lesson phase save failed", error);
      return data({ error: "Could not save your lesson progress." }, { status: 500 });
    }
  }
  return redirect(`/lessons/${params.lessonId}`, { status: 303 });
}

export default function Lesson({ loaderData, actionData }: Route.ComponentProps) {
  const { lesson, progress, userId } = loaderData;
  const navigation = useNavigation();
  const phase = progress?.phase ?? "introduction";
  return (
    <section>
      <Link className="back-link" to="/lessons">← Back to lessons</Link>
      <p className="eyebrow">{lesson.kind === "learning" ? `Learning · ${phase === "introduction" ? "Character introduction" : phase === "flashcards" ? "Flashcards" : "Story"}` : "Revision"}</p>
      <h1>{lesson.title}</h1>
      {phase === "introduction" && lesson.kind === "learning" ? <>
        <p className="intro-copy">Meet your five new characters together. Each card shows all its authored Mandarin readings, not just one pronunciation.</p>
        <ul className="character-grid" aria-label="New characters">{lesson.newCharacters.map((character) => <li className="character-card" key={character.id}><span className="hanzi" lang="zh-Hans">{character.hanzi}</span><span className="sr-only">Pinyin:</span><ul className="readings" aria-label={`Readings for ${character.hanzi}`}>{character.pinyin.map((reading) => <li lang="zh-Latn-pinyin" key={reading}>{reading}</li>)}</ul></li>)}</ul>
        <Form method="post">
          <input type="hidden" name="intent" value="start-flashcards" />
          <input type="hidden" name="attempt_id" value={progress?.attempt_id ?? ""} />
          <button type="submit" disabled={navigation.state !== "idle"}>Start flashcards</button>
        </Form>
        {actionData?.error && <p role="alert" className="form-error">{actionData.error}</p>}
      </> : phase === "flashcards" && lesson.kind === "learning" && progress ?
        <Flashcards key={progress.attempt_id} cards={lesson.newCharacters} attemptId={progress.attempt_id} storageKey={`chinese-reading:flashcards:${userId}:${lesson.id}:${progress.attempt_id}:initial`} /> : <>
          <h2>Story phase</h2>
          <p>Your flashcard result is saved. The story reader is coming in the next update.</p>
          <aside className="notice">This lesson is not complete. Later lessons remain locked until reading and any revision flashcards are finished.</aside>
        </>}
      <Link className="button secondary" to="/lessons">Return to lesson list</Link>
    </section>
  );
}
