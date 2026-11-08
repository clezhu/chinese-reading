import { useEffect, useRef, useState } from "react";
import { useRevalidator } from "react-router";
import type { Lesson } from "../content/curriculum";
import { enumerateStory, type StoryOccurrence, type StoryState } from "../lib/story";

export type StoryReaderProps = { lesson: Lesson; state: StoryState; onPhaseChange?: () => void };

type View = {
  saved: StoryState;
  pending: string[];
  refreshing: boolean;
  finishing: boolean;
  retrying: boolean;
  terminal: string | null;
};
type Actions = { reveal: (ref: string) => void; finish: () => void; accept: (state: StoryState) => void };

/** An attempt-scoped reader. Pending reveals are memory-only. The server owns
 * phase transitions and a monotonic version; timestamps never order responses.
 */
export function StoryReader(props: StoryReaderProps) {
  return <ReaderAttempt key={`${props.lesson.id}:${props.state.attemptId}:${props.state.contentRevision}`} {...props} />;
}

function ReaderAttempt({ lesson, state, onPhaseChange }: StoryReaderProps) {
  const endpoint = `/lessons/${encodeURIComponent(lesson.id)}/reader`;
  const revalidator = useRevalidator();
  const notify = useRef(() => {});
  notify.current = () => { void revalidator.revalidate(); onPhaseChange?.(); };
  const initial = useRef(state);
  const actions = useRef<Actions | null>(null);
  const [view, setView] = useState<View>({ saved: state, pending: [], refreshing: false, finishing: false, retrying: false, terminal: null });

  useEffect(() => {
    const lifetime = new AbortController();
    let disposed = false;
    let saved = initial.current;
    const pending = new Set<string>();
    const retrying = new Set<string>();
    let refreshing = false;
    let refreshAgain = false;
    let finishing = false;
    let terminal: string | null = null;
    let phaseChanged = false;
    const live = () => !disposed && !lifetime.signal.aborted;
    const publish = () => {
      if (!disposed) setView({ saved, pending: [...pending], refreshing, finishing, retrying: retrying.size > 0, terminal });
    };
    const freeze = (message: string) => {
      if (!live()) return;
      terminal = message;
      refreshing = false;
      finishing = false;
      retrying.clear();
      lifetime.abort(); // Late successes/errors can no longer modify this session.
      publish();
    };
    const accept = (next: StoryState) => {
      if (!live()) return;
      if (next.attemptId !== saved.attemptId || next.contentRevision !== saved.contentRevision) {
        freeze("This attempt or story content changed. Reload the lesson to continue. Unsaved reveals will not carry over.");
        return;
      }
      if (next.version <= saved.version) return;
      const previousPhase = saved.phase;
      saved = next;
      for (const ref of next.revealed) pending.delete(ref);
      if (next.phase !== previousPhase && !phaseChanged) {
        phaseChanged = true;
        if (pending.size) terminal = "Reading ended in another tab before all this tab’s reveals were saved. Reload to see the frozen result.";
        refreshing = false;
        finishing = false;
        retrying.clear();
        lifetime.abort();
        publish();
        notify.current();
        return;
      }
      publish();
    };
    const wait = (ms: number) => new Promise<void>((resolve) => {
      const done = () => { clearTimeout(timer); lifetime.signal.removeEventListener("abort", done); resolve(); };
      const timer = setTimeout(done, ms);
      lifetime.signal.addEventListener("abort", done, { once: true });
      if (!live()) done();
    });
    // Retrying individual atomic mutations is safe: reveal and Finish are
    // idempotent. No whole browser reveal set is ever sent to the server.
    const request = async (key: string, form?: URLSearchParams, needed = () => true): Promise<StoryState | null> => {
      let failures = 0;
      while (live() && needed()) {
        const controller = new AbortController();
        const abort = () => controller.abort();
        lifetime.signal.addEventListener("abort", abort, { once: true });
        const timeout = setTimeout(abort, 15_000);
        let response: Response | undefined;
        try {
          response = await fetch(form ? endpoint : `${endpoint}?reader-state=1`, {
            method: form ? "POST" : "GET", body: form,
            credentials: "same-origin", cache: "no-store", redirect: "manual", headers: { Accept: "application/json" },
            signal: controller.signal,
          });
          if (!live() || !needed()) return null;
          // Manual redirects also catch cross-origin login redirects without a
          // misleading CORS/network retry loop. Keep the followed-response check
          // for fetch adapters that expose an already-followed response.
          if (response.type === "opaqueredirect" || response.redirected || (response.status >= 300 && response.status < 400) || response.status === 401) {
            freeze("Your session may have expired. Reload the lesson and sign in again before continuing. Unsaved reveals are not saved.");
            return null;
          }
          if (response.status < 500) {
            let body: unknown;
            try { body = await response.json(); } catch { /* handled below */ }
            if (!live() || !needed()) return null;
            if (!response.ok) {
              const error = body && typeof body === "object" && "error" in body && typeof body.error === "string" ? body.error : "The reader could not save or refresh this attempt.";
              freeze(`${error} Reload the lesson to continue; unsaved reveals may be lost.`);
              return null;
            }
            const next = body && typeof body === "object" && "state" in body ? body.state : null;
            if (!isStoryState(next)) {
              freeze("The server returned an unexpected response. Reload the lesson to check your saved progress.");
              return null;
            }
            retrying.delete(key);
            return next;
          }
        } catch {
          // Network failures, timeouts and 5xx retain optimistic help and retry.
        } finally {
          clearTimeout(timeout);
          lifetime.signal.removeEventListener("abort", abort);
        }
        if (!live() || !needed()) return null;
        retrying.add(key);
        publish();
        await wait(Math.min(500 * 2 ** Math.min(failures++, 4), 8000));
      }
      return null;
    };
    const refresh = async () => {
      if (!live()) return;
      if (refreshing) { refreshAgain = true; return; }
      refreshing = true;
      publish();
      do {
        refreshAgain = false;
        const next = await request("refresh");
        if (next) accept(next);
      } while (live() && refreshAgain);
      refreshing = false;
      retrying.delete("refresh");
      publish();
    };
    const formFor = (intent: string) => new URLSearchParams({
      intent, attempt_id: saved.attemptId, content_revision: String(saved.contentRevision),
    });
    const reveal = (ref: string) => {
      if (!live() || saved.phase !== "story" || finishing || saved.revealed.includes(ref) || pending.has(ref)) return;
      pending.add(ref);
      publish();
      const form = formFor("reveal");
      form.set("occurrence", ref);
      void (async () => {
        const next = await request(`reveal:${ref}`, form, () => pending.has(ref));
        if (next && live()) {
          accept(next);
          // Even if a newer response arrived first, an acknowledged reveal is
          // durable. A versioned snapshot/refresh will reconcile other tabs.
          if (live() && next.revealed.includes(ref)) pending.delete(ref);
          if (live()) void refresh();
        }
        retrying.delete(`reveal:${ref}`);
        publish();
      })();
    };
    const finish = () => {
      if (!live() || saved.phase !== "story" || pending.size || refreshing || finishing) return;
      finishing = true;
      publish();
      void (async () => {
        const next = await request("finish", formFor("finish-reading"));
        if (next && live()) {
          accept(next);
          if (live()) {
            finishing = false;
            void refresh();
          }
        }
        retrying.delete("finish");
        publish();
      })();
    };
    actions.current = { reveal, finish, accept };
    const onFocus = () => { if (document.visibilityState === "visible") void refresh(); };
    document.addEventListener("visibilitychange", onFocus);
    window.addEventListener("focus", onFocus);
    return () => {
      disposed = true;
      lifetime.abort();
      actions.current = null;
      document.removeEventListener("visibilitychange", onFocus);
      window.removeEventListener("focus", onFocus);
    };
  }, [endpoint]);

  // Loader revalidation is another asynchronous response, so it uses the same
  // version gate as fetch responses instead of replacing local pending state.
  useEffect(() => { actions.current?.accept(state); }, [state]);

  const pending = new Set(view.pending);
  const revealed = new Set([...view.saved.revealed, ...view.pending]);
  const active = !view.terminal && view.saved.phase === "story" && !view.finishing;
  const occurrences = new Map(enumerateStory(lesson).map((occurrence) => [occurrence.ref, occurrence]));

  return <section className="story-reader" aria-label="Story reader">
    <p className="reader-instructions">Try reading without help. Select a character to keep its pinyin visible. Double-underlined characters have permanent help and do not enter revision.</p>
    <div className="reader-passage" lang="zh-Hans">
      {lesson.story?.paragraphs.map((paragraph, paragraphIndex) => {
        // One wrapping unit per occurrence, with following punctuation attached.
        // Sentence boundaries introduce neither a forced break nor extra space.
        const units: { occurrence?: StoryOccurrence; punctuation: string }[] = [];
        paragraph.forEach((sentence, sentenceIndex) => sentence.forEach((token, tokenIndex) => {
          if (typeof token === "string") {
            const previous = units[units.length - 1];
            if (previous) previous.punctuation += token;
            else units.push({ punctuation: token });
          } else units.push({ occurrence: occurrences.get(`${paragraphIndex}:${sentenceIndex}:${tokenIndex}`), punctuation: "" });
        }));
        return <p className="reader-paragraph" key={paragraphIndex}>{units.map(({ occurrence, punctuation }, index) => {
          if (!occurrence) return <span className="reader-punctuation" key={`punctuation:${index}`}>{punctuation}</span>;
          const visible = occurrence.permanent || revealed.has(occurrence.ref);
          const saving = pending.has(occurrence.ref);
          const position = `paragraph ${paragraphIndex + 1}, sentence ${occurrence.sentenceIndex + 1}, token ${occurrence.tokenIndex + 1}`;
          const lanes = <><span className="reader-pinyin" lang="zh-Latn-pinyin" style={{ visibility: visible ? "visible" : "hidden" }}>{occurrence.pinyin}</span><span className="reader-hanzi">{occurrence.hanzi}</span></>;
          const attributes = {
            "data-occurrence": occurrence.ref,
            "data-revealed": visible ? "true" : "false",
            "data-permanent": occurrence.permanent ? "true" : "false",
            "data-save-state": occurrence.permanent ? "permanent" : saving ? "pending" : visible ? "saved" : "hidden",
          };
          return <span className="reader-unit" key={occurrence.ref}>
            {occurrence.permanent ? <span className="reader-cell reader-permanent" {...attributes}>
              <span className="reader-lanes" aria-hidden="true">{lanes}</span>
              <span className="sr-only">{occurrence.hanzi}, {occurrence.pinyin}, permanent help, {position}.</span>
            </span> : <button type="button" className="reader-cell reader-reveal" {...attributes}
              aria-label={visible ? `${occurrence.hanzi}, ${occurrence.pinyin}, ${position}${saving ? ", not yet saved" : ", saved"}` : `Reveal pinyin for ${occurrence.hanzi}, ${position}`}
              aria-disabled={!active || visible}
              onClick={() => { if (active && !visible) actions.current?.reveal(occurrence.ref); }}>
              <span className="reader-lanes" aria-hidden="true">{lanes}</span>
            </button>}
            {punctuation && <span className="reader-punctuation">{punctuation}</span>}
          </span>;
        })}</p>;
      })}
    </div>
    <div className="reader-save-status" role="status" aria-live="polite" aria-atomic="true">
      {view.terminal ? null : view.pending.length ? <p>{view.pending.length} reveal{view.pending.length === 1 ? "" : "s"} not yet saved.{view.retrying ? " Connection interrupted; retrying automatically." : " Saving…"} Keep this page open; leaving or reloading can lose unsaved reveals.</p>
        : view.retrying ? <p>Connection interrupted; retrying automatically. Finish is unavailable until progress is confirmed.</p>
        : view.finishing ? <p>Saving the end of your reading…</p>
        : view.refreshing ? <p>Checking saved progress…</p>
        : <p>{view.saved.revealed.length ? "All reveals saved." : "No reveals yet."}</p>}
    </div>
    {view.terminal && <div className="form-error" role="alert"><p>{view.terminal}</p><button type="button" className="secondary" onClick={() => window.location.reload()}>Reload lesson</button></div>}
    <button className="reader-finish" type="button" disabled={!active || view.pending.length > 0 || view.refreshing} onClick={() => actions.current?.finish()}>Finish reading</button>
  </section>;
}

function isStoryState(value: unknown): value is StoryState {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<StoryState>;
  return typeof state.attemptId === "string" && Number.isInteger(state.contentRevision) &&
    Number.isInteger(state.version) && state.version! >= 0 && typeof state.updatedAt === "number" &&
    ["introduction", "flashcards", "story", "revision-flashcards", "complete"].includes(state.phase ?? "") &&
    Array.isArray(state.revealed) && state.revealed.every((ref) => typeof ref === "string");
}
