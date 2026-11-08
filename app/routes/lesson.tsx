import { data, Form, Link, redirect, useNavigation } from "react-router";
import { Flashcards } from "../components/flashcards";
import { StoryReader } from "../components/story-reader";
import { orderedLessons } from "../content/curriculum";
import { cloudflareContext } from "../context";
import { requireUser } from "../lib/auth.server";
import { readForm, requireSameOriginPost } from "../lib/http.server";
import { getProgress, passInitialDeck, requireLessonAccess, startFlashcards, startIntroduction, storyState } from "../lib/progress.server";
import { revisionCards } from "../lib/story";
import type { Route } from "./+types/lesson";

export async function loader({ request, context, params }: Route.LoaderArgs) {
  const db = context.get(cloudflareContext).env.DB;
  const user = await requireUser(request, db);
  const lesson = await requireLessonAccess(db, user.id, params.lessonId);
  const progress = (await getProgress(db, user.id)).find((row) => row.lesson_id === lesson.id) ?? null;
  const lessons = orderedLessons();
  const nextLesson = lessons[lessons.findIndex((entry) => entry.id === lesson.id) + 1];
  return { lesson, progress, userId: user.id, state: progress ? storyState(progress) : null,
    cards: progress?.phase === "revision-flashcards" ? revisionCards(lesson, storyState(progress).revealed) : [],
    nextLessonId: nextLesson?.id ?? null };
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
  const { lesson, progress, userId, state, cards, nextLessonId } = loaderData;
  const navigation = useNavigation();
  const phase = progress?.phase ?? "introduction";
  return (
    <section>
      <Link className="back-link" to="/lessons">← Back to lessons</Link>
      <p className="eyebrow">{lesson.kind === "learning" ? `Learning · ${phase === "introduction" ? "Character introduction" : phase === "flashcards" ? "Flashcards" : "Story"}` : "Revision"}</p>
      <h1>{lesson.title}</h1>
      {progress?.first_completed_at != null && <dl aria-label="Completion milestones" className="input-hint">
        <dt>First completed</dt><dd><time dateTime={new Date(progress.first_completed_at).toISOString()}>{new Date(progress.first_completed_at).toISOString()}</time> · content revision {progress.first_completed_content_revision}</dd>
        <dt>Last completed</dt><dd><time dateTime={new Date(progress.last_completed_at!).toISOString()}>{new Date(progress.last_completed_at!).toISOString()}</time> · content revision {progress.last_completed_content_revision}</dd>
      </dl>}
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
        <Flashcards key={progress.attempt_id} cards={lesson.newCharacters} attemptId={progress.attempt_id} storageKey={`chinese-reading:flashcards:${userId}:${lesson.id}:${progress.attempt_id}:initial`} /> : phase === "story" && state && lesson.story ? <>
          <h2>Story phase</h2>
          <aside className="notice">Illustrative reader fixture, not final language-approved curriculum. First story drafts are awaiting review.</aside>
          <StoryReader lesson={lesson} state={state} />
        </> : phase === "revision-flashcards" ? <>
          <h2>Collected revision</h2>
          <p>Reading is saved. Your {cards.length} collected character{cards.length === 1 ? "" : "s"} and sentence help are frozen for this attempt. Revision practice is supplied by #6; this lesson is not complete yet.</p>
          <ul className="revision-preview" aria-label="Collected revision cards">{cards.map((card) => <li className="panel" key={card.character.hanzi} data-revision-character={card.character.hanzi}>
            <h3 lang="zh-Hans">{card.character.hanzi}</h3>
            <ul className="readings" aria-label={`All readings for ${card.character.hanzi}`}>{card.character.pinyin.map((reading) => <li key={reading} lang="zh-Latn-pinyin">{reading}</li>)}</ul>
            <p lang="zh-Hans" className="revision-sentence">{card.sentence.map((token, index) => typeof token === "string" ? <span key={index}>{token}</span> : <span className="revision-token" key={index} data-context-occurrence={token.ref} data-show-pinyin={String(token.showPinyin)}><span className="reader-pinyin" style={{ visibility: token.showPinyin ? "visible" : "hidden" }} lang="zh-Latn-pinyin">{token.pinyin}</span><span>{token.hanzi}</span></span>)}</p>
          </li>)}</ul>
        </> : phase === "complete" ? <>
          <h2>Lesson complete</h2>
          <p>Your completion is saved.</p>
          {nextLessonId ? <Link className="button" to={`/lessons/${nextLessonId}`}>Next lesson</Link> : <p>You reached the end of the current curriculum.</p>}
        </> : <>
          <h2>Story unavailable</h2><p>This lesson does not have a reader fixture yet.</p>
        </>}
      <Link className="button secondary" to="/lessons">Return to lesson list</Link>
    </section>
  );
}
