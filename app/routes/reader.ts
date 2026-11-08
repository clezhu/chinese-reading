import { cloudflareContext } from "../context";
import { requireUser } from "../lib/auth.server";
import { readForm, requireSameOriginPost } from "../lib/http.server";
import { finishReading, getProgress, requireLessonAccess, revealOccurrence, storyState } from "../lib/progress.server";
import { revisionCards } from "../lib/story";
import type { Route } from "./+types/reader";

const json = (value: unknown, status = 200) => Response.json(value, { status, headers: { "Cache-Control": "no-store" } });

async function failure(error: unknown) {
  if (error instanceof Response) {
    // Session redirects are exposed as actionable authentication failures to fetch.
    if (error.status >= 300 && error.status < 400) return json({ error: "Sign in again to continue." }, 401);
    return json({ error: await error.text() }, error.status);
  }
  console.error(JSON.stringify({ event: "reader_persistence_failed" }));
  return json({ error: "Could not save or load reading progress. Retrying is safe." }, 503);
}

export async function loader({ request, context, params }: Route.LoaderArgs) {
  try {
    const db = context.get(cloudflareContext).env.DB;
    const user = await requireUser(request, db);
    const lesson = await requireLessonAccess(db, user.id, params.lessonId);
    const row = (await getProgress(db, user.id)).find((entry) => entry.lesson_id === lesson.id);
    if (!row || !lesson.story) throw new Response("No reading attempt. Reload the lesson.", { status: 409 });
    const state = storyState(row);
    return json({ state, cards: state.phase === "revision-flashcards" ? revisionCards(lesson, state.revealed) : [] });
  } catch (error) { return failure(error); }
}

export async function action({ request, context, params }: Route.ActionArgs) {
  try {
    requireSameOriginPost(request);
    const db = context.get(cloudflareContext).env.DB;
    const user = await requireUser(request, db);
    await requireLessonAccess(db, user.id, params.lessonId);
    const form = await readForm(request);
    const one = (name: string) => {
      if (form.getAll(name).length !== 1) throw new Response(`One ${name} is required`, { status: 400 });
      return form.get(name)!;
    };
    const intent = one("intent");
    if (intent !== "reveal" && intent !== "finish-reading") throw new Response("Unsupported reader action", { status: 400 });
    const attempt = one("attempt_id");
    const revisionText = one("content_revision");
    const revision = Number(revisionText);
    if (!/^[1-9]\d*$/.test(revisionText) || !Number.isSafeInteger(revision)) throw new Response("Invalid content revision", { status: 400 });
    const state = intent === "reveal"
      ? await revealOccurrence(db, user.id, params.lessonId, attempt, revision, one("occurrence"))
      : await finishReading(db, user.id, params.lessonId, attempt, revision);
    return json({ state });
  } catch (error) { return failure(error); }
}
