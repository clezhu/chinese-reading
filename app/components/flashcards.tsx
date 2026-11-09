import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import type { Character } from "../content/curriculum";
import { answerCard, createDeckProgress, restoreDeckProgress, revealCard, type DeckProgress } from "../lib/flashcards";
import type { RevisionCard } from "../lib/story";

export function Flashcards({ cards, storageKey, attemptId, contextCards, contentRevision }: { cards: readonly Character[]; storageKey: string; attemptId: string; contextCards?: readonly RevisionCard[]; contentRevision?: number }) {
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
  const context = contextCards?.find((entry) => entry.character.id === card?.id);
  const continueLabel = contextCards ? "Reread story" : "Continue to story";
  return <section className="flashcard-panel panel" aria-label="Flashcard practice">
    {!storageAvailable && <p className="notice" role="status">Browser storage is unavailable. You can practise, but returning will restart this deck.</p>}
    <p className="input-hint">Practice progress is saved in this browser only. If it is cleared, this deck restarts; your lesson phase stays saved.</p>
    {progress.stage === "complete" ? <>
      <h2>Deck recognised</h2>
      <p>You recognised the entire deck in one clean round. Save this result to {contextCards ? "reread the story with taught pinyin hidden again" : "continue to the story"}.</p>
      <fetcher.Form method="post">
        <input type="hidden" name="intent" value={contextCards ? "revision-passed" : "deck-passed"} />
        <input type="hidden" name="attempt_id" value={attemptId} />
        {contextCards && <input type="hidden" name="content_revision" value={contentRevision} />}
        <button ref={continueButton} type="submit" disabled={fetcher.state !== "idle"}>{fetcher.state !== "idle" ? "Saving…" : continueLabel}</button>
      </fetcher.Form>
      {fetcher.data?.error && <p className="form-error" role="alert">{fetcher.data.error} Your result has not been saved. Retry, or reload if the attempt changed.</p>}
    </> : card && <>
      <div role="status" aria-live="polite" aria-atomic="true">
        <h2>{progress.stage === "confirmation" ? "Full-deck confirmation" : "Practice round"}</h2>
        <p>Card {progress.index + 1} of {progress.round.length} · {progress.missed.length} missed this round</p>
      </div>
      <p>{progress.stage === "confirmation" ? "Recognise every card in this pass. Any misses repeat before you try the full deck again." : progress.round.length === progress.deck.length ? "Reveal each card, then assess your recall. Recognise the whole deck in this round to move on; only missed cards repeat." : "Practise the missed cards. Once this smaller round is clear, try the full deck again."}</p>
      <div className="practice-card">
        <span className="hanzi" lang="zh-Hans">{card.hanzi}</span>
        {progress.revealed && <ul className="readings" aria-label={`Readings for ${card.hanzi}`}>{card.pinyin.map((reading) => <li key={reading} lang="zh-Latn-pinyin">{reading}</li>)}</ul>}
        {progress.revealed && context && <p lang="zh-Hans" className="revision-sentence" aria-label="Saved sentence context" data-revision-character={card.hanzi}>{context.sentence.map((token, index) => typeof token === "string" ? <span key={index}>{token}</span> : <span className="revision-token" key={index} data-context-occurrence={token.ref} data-show-pinyin={String(token.showPinyin)}><span className="reader-pinyin" style={{ visibility: token.showPinyin ? "visible" : "hidden" }} lang="zh-Latn-pinyin">{token.pinyin}</span><span>{token.hanzi}</span></span>)}</p>}
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
