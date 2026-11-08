import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import type { Character } from "../content/curriculum";
import { answerCard, createDeckProgress, restoreDeckProgress, revealCard, type DeckProgress } from "../lib/flashcards";

export function Flashcards({ cards, storageKey, attemptId }: { cards: readonly Character[]; storageKey: string; attemptId: string }) {
  const [progress, setProgress] = useState<DeckProgress | null>(null);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const revealButton = useRef<HTMLButtonElement>(null);
  const gotButton = useRef<HTMLButtonElement>(null);
  const continueButton = useRef<HTMLButtonElement>(null);
  const fetcher = useFetcher<{ error: string }>();

  useEffect(() => {
    const deck = cards.map((card) => card.id);
    try {
      const raw = localStorage.getItem(storageKey);
      let saved: unknown;
      try { saved = raw ? JSON.parse(raw) : null; } catch { saved = null; }
      setProgress(restoreDeckProgress(saved, deck));
    } catch {
      setStorageAvailable(false);
      setProgress(createDeckProgress(deck));
    }
  }, [cards, storageKey]);

  useEffect(() => {
    if (!progress) return;
    try { localStorage.setItem(storageKey, JSON.stringify(progress)); }
    catch { setStorageAvailable(false); }
    if (progress.stage === "complete") continueButton.current?.focus();
    else if (progress.revealed) gotButton.current?.focus();
    else revealButton.current?.focus();
  }, [progress, storageKey]);

  if (!progress) return <p role="status">Loading flashcards…</p>;
  const card = cards.find((entry) => entry.id === progress.round[progress.index]);
  return <section className="flashcard-panel panel" aria-label="Flashcard practice">
    {!storageAvailable && <p className="notice" role="status">Browser storage is unavailable. You can practise, but returning will restart this deck.</p>}
    <p className="input-hint">Practice progress is saved in this browser only. If it is cleared, this deck restarts; your lesson phase stays saved.</p>
    {progress.stage === "complete" ? <>
      <h2>Deck recognised</h2>
      <p>You recognised the entire deck in one confirmation pass. Save this result to continue to the story.</p>
      <fetcher.Form method="post">
        <input type="hidden" name="intent" value="deck-passed" />
        <input type="hidden" name="attempt_id" value={attemptId} />
        <button ref={continueButton} type="submit" disabled={fetcher.state !== "idle"}>{fetcher.state !== "idle" ? "Saving…" : "Continue to story"}</button>
      </fetcher.Form>
      {fetcher.data?.error && <p className="form-error" role="alert">{fetcher.data.error} Your result has not been saved. Retry, or reload if the attempt changed.</p>}
    </> : card && <>
      <div role="status" aria-live="polite" aria-atomic="true">
        <h2>{progress.stage === "confirmation" ? "Full-deck confirmation" : "Practice round"}</h2>
        <p>Card {progress.index + 1} of {progress.round.length} · {progress.missed.length} missed this round</p>
      </div>
      <p>{progress.stage === "confirmation" ? "Recognise every card in this pass. Any misses need practice, then another full-deck confirmation." : "Reveal each card, then assess your recall. Missed cards repeat before full-deck confirmation."}</p>
      <div className="practice-card">
        <span className="hanzi" lang="zh-Hans">{card.hanzi}</span>
        {progress.revealed && <ul className="readings" aria-label={`Readings for ${card.hanzi}`}>{card.pinyin.map((reading) => <li key={reading} lang="zh-Latn-pinyin">{reading}</li>)}</ul>}
      </div>
      <div className="flashcard-actions">
        {!progress.revealed ? <button ref={revealButton} type="button" onClick={() => setProgress(revealCard(progress))}>Reveal</button> : <>
          <button ref={gotButton} type="button" onClick={() => setProgress(answerCard(progress, true))}>Got it</button>
          <button className="secondary" type="button" onClick={() => setProgress(answerCard(progress, false))}>Didn't get it</button>
        </>}
      </div>
    </>}
  </section>;
}
