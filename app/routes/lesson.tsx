import { data, Form, Link, redirect, useNavigation } from "react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Flashcards } from "../components/flashcards";
import { StoryReader } from "../components/story-reader";
import { CompletionConfetti, LessonSoundProvider, SoundToggle, useLessonSound } from "../components/lesson-sound";
import { orderedLessons } from "../content/curriculum";
import { cloudflareContext } from "../context";
import { requireUser } from "../lib/auth.server";
import { readForm, requireSameOriginPost } from "../lib/http.server";
import { completeRevisionDeck, getProgress, passInitialDeck, requireLessonAccess, startFlashcards, startIntroduction, startRevisit, storyState } from "../lib/progress.server";
import { revisionCards, type StoryState } from "../lib/story";
import type { Route } from "./+types/lesson";

export async function loader({ request, context, params }: Route.LoaderArgs) {
  const db = context.get(cloudflareContext).env.DB;
  const user = await requireUser(request, db);
  const lesson = await requireLessonAccess(db, user.id, params.lessonId);
  const progress = (await getProgress(db, user.id)).find((row) => row.lesson_id === lesson.id) ?? null;
  const lessons = orderedLessons();
  const lessonIndex = lessons.findIndex((entry) => entry.id === lesson.id);
  const nextLesson = lessons[lessonIndex + 1];
  return { lesson, lessonNumber: lessonIndex + 1, progress, userId: user.id, state: progress ? storyState(progress) : null,
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
  if (form.getAll("intent").length !== 1 || !["start", "start-flashcards", "deck-passed", "revision-passed", "revisit"].includes(intent ?? "")) {
    throw new Response("Unsupported lesson action.", { status: 400 });
  }
  // Browser-supplied user IDs, phase, or completion fields are never consumed.
  if (intent === "start") await startIntroduction(db, user.id, params.lessonId);
  else {
    if (form.getAll("attempt_id").length !== 1) throw new Response("An attempt ID is required", { status: 400 });
    try {
      if (intent === "start-flashcards") await startFlashcards(db, user.id, params.lessonId, form.get("attempt_id")!);
      else if (intent === "revisit") await startRevisit(db, user.id, params.lessonId, form.get("attempt_id")!);
      else if (intent === "revision-passed") {
        if (form.getAll("content_revision").length !== 1 || !/^\d+$/.test(form.get("content_revision") ?? "")) throw new Response("A content revision is required", { status: 400 });
        await completeRevisionDeck(db, user.id, params.lessonId, form.get("attempt_id")!, Number(form.get("content_revision")));
      } else await passInitialDeck(db, user.id, params.lessonId, form.get("attempt_id")!);
    } catch (error) {
      if (error instanceof Response) return data({ error: await error.text() }, { status: error.status });
      console.error("Lesson phase save failed", error);
      return data({ error: "Could not save your lesson progress." }, { status: 500 });
    }
  }
  return redirect(`/lessons/${params.lessonId}`, { status: 303 });
}

export default function Lesson({ loaderData, actionData }: Route.ComponentProps) {
  return <LessonSoundProvider><LessonScreen key={loaderData.lesson.id} loaderData={loaderData} actionData={actionData} /></LessonSoundProvider>;
}

function LessonScreen({ loaderData, actionData }: Pick<Route.ComponentProps, "loaderData" | "actionData">) {
  const { lesson, lessonNumber, progress, userId, state, cards, nextLessonId } = loaderData;
  const revisionCharacters = useMemo(() => cards.map((card) => card.character), [cards]);
  const navigation = useNavigation();
  const phase = progress?.phase ?? (lesson.kind === "learning" ? "introduction" : "not-started");
  const sound = useLessonSound();
  const [completion, setCompletion] = useState<StoryState | null>(null);
  const celebrated = useRef(new Set<string>());
  const completionHeading = useRef<HTMLHeadingElement>(null);
  const ownCompletion = completion !== null && completion.attemptId === progress?.attempt_id && completion.contentRevision === progress?.content_revision;
  const onComplete = (saved: StoryState) => {
    const key = `${saved.attemptId}:${saved.contentRevision}`;
    if (celebrated.current.has(key)) return;
    celebrated.current.add(key);
    setCompletion(saved);
    sound.play("complete");
  };
  useEffect(() => {
    if (phase === "complete" && ownCompletion) completionHeading.current?.focus();
  }, [phase, ownCompletion]);
  return (
    <section className="lesson-shell" data-phase={phase}>
      <header className="lesson-topbar">
        <Link className="lesson-back" to="/lessons" aria-label="Back to lessons"><span aria-hidden="true">‹</span> Lessons</Link>
        <p className="lesson-title">Lesson {lessonNumber} · {lesson.kind === "learning" ? <span lang="zh-Hans">{lesson.newCharacters.map((character) => character.hanzi).join(" ")}</span> : "Revision"}</p>
        <SoundToggle />
      </header>
      <div className="lesson-content">
      {progress?.first_completed_at != null && <dl aria-label="Completion milestones" className="sr-only">
        <dt>First completed</dt><dd><time dateTime={new Date(progress.first_completed_at).toISOString()}>{new Date(progress.first_completed_at).toISOString()}</time> · content revision {progress.first_completed_content_revision}</dd>
        <dt>Last completed</dt><dd><time dateTime={new Date(progress.last_completed_at!).toISOString()}>{new Date(progress.last_completed_at!).toISOString()}</time> · content revision {progress.last_completed_content_revision}</dd>
      </dl>}
      {actionData?.error && <p role="alert" className="form-error">{actionData.error}</p>}
      {phase === "introduction" && lesson.kind === "learning" ? <section className="lesson-introduction">
        <h1>Meet your new characters</h1>
        <p className="intro-copy">Look at these characters and their pinyin. Some characters have more than one pronunciation. Try to remember them—but it is OK if you cannot yet.</p>
        <ul className="character-grid" aria-label="New characters">{lesson.newCharacters.map((character) => <li className="character-card" key={character.id}><span className="hanzi" lang="zh-Hans">{character.hanzi}</span><span className="sr-only">Pinyin:</span><ul className="readings" aria-label={`Readings for ${character.hanzi}`}>{character.pinyin.map((reading) => <li lang="zh-Latn-pinyin" key={reading}>{reading}</li>)}</ul></li>)}</ul>
        <Form method="post" className="lesson-intro-actions">
          <input type="hidden" name="intent" value="start-flashcards" />
          <input type="hidden" name="attempt_id" value={progress?.attempt_id ?? ""} />
          <button type="submit" disabled={navigation.state !== "idle"}>Continue</button>
        </Form>
      </section> : phase === "flashcards" && lesson.kind === "learning" && progress ?
        <Flashcards key={progress.attempt_id} cards={lesson.newCharacters} attemptId={progress.attempt_id} storageKey={`chinese-reading:flashcards:${userId}:${lesson.id}:${progress.attempt_id}:initial`} /> : phase === "story" && state && lesson.story ? <>
          <h1>Read the story</h1>
          <StoryReader lesson={lesson} state={state} onComplete={onComplete} />
        </> : phase === "revision-flashcards" ? <>
          {progress && <Flashcards key={`${progress.attempt_id}:revision`} cards={revisionCharacters} contextCards={cards} contentRevision={progress.content_revision} attemptId={progress.attempt_id} storageKey={`chinese-reading:flashcards:${userId}:${lesson.id}:${progress.attempt_id}:revision`} />}
        </> : phase === "complete" ? <section className="lesson-completion" aria-labelledby="completion-heading">
          {ownCompletion && completion && <CompletionConfetti key={`${completion.attemptId}:${completion.contentRevision}`} />}
          <span className="completion-check" aria-hidden="true">✓</span>
          <h1 id="completion-heading" ref={completionHeading} tabIndex={-1}>Lesson complete</h1>
          <p>Your completion is saved.</p>
          {!nextLessonId && <p>You reached the end of the available lessons.</p>}
          <div className="completion-actions">
            {nextLessonId && <Link className="button" to={`/lessons/${nextLessonId}`}>Next lesson</Link>}
            <Link className={`button${nextLessonId ? " secondary" : ""}`} to="/lessons">Back to lessons</Link>
          </div>
        </section> : phase === "not-started" ? <>
          <p>No new characters. Begin with the story.</p>
          <Form method="post"><input type="hidden" name="intent" value="start" /><button type="submit" disabled={navigation.state !== "idle"}>Start reading</button></Form>
        </> : <>
          <h2>Story unavailable</h2><p>This lesson does not have a reader fixture yet.</p>
        </>}
      </div>
    </section>
  );
}
