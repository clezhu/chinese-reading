import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import type { Character } from "../content/curriculum";
import { answerCard, createDeckProgress, restoreDeckProgress, revealCard, type DeckProgress } from "../lib/flashcards";
import type { RevisionCard } from "../lib/story";
import { useLessonSound } from "./lesson-sound";

export function Flashcards({ cards, storageKey, attemptId, contextCards, contentRevision }: { cards: readonly Character[]; storageKey: string; attemptId: string; contextCards?: readonly RevisionCard[]; contentRevision?: number }) {
  const [progress, setProgress] = useState<DeckProgress | null>(null);
  const sound = useLessonSound();
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
      setProgress(createDeckProgress(deck));
    }
  }, [cards, storageKey]);

  useEffect(() => {
    if (!progress) return;
    try { localStorage.setItem(storageKey, JSON.stringify(progress)); }
    catch { /* Browser storage is optional; keep the usable in-memory deck. */ }
    if (progress.stage === "complete") continueButton.current?.focus();
    else if (progress.revealed) gotButton.current?.focus();
    else revealButton.current?.focus();
  }, [progress, storageKey]);

  if (!progress) return <p role="status">Loading flashcards…</p>;
  const card = cards.find((entry) => entry.id === progress.round[progress.index]);
  const context = contextCards?.find((entry) => entry.character.id === card?.id);
  const continueLabel = contextCards ? "Reread story" : "Continue to story";
  return <section className={`flashcard-panel${progress.stage === "complete" ? " deck-recognised" : ""}`} aria-label="Flashcard practice">
    {progress.stage === "complete" ? <>
      <h1>Deck recognised</h1>
      <p>{contextCards ? "Ready to reread." : "Ready for the story."}</p>
      <fetcher.Form method="post">
        <input type="hidden" name="intent" value={contextCards ? "revision-passed" : "deck-passed"} />
        <input type="hidden" name="attempt_id" value={attemptId} />
        {contextCards && <input type="hidden" name="content_revision" value={contentRevision} />}
        <button ref={continueButton} type="submit" disabled={fetcher.state !== "idle"}>{fetcher.state !== "idle" ? "Saving…" : continueLabel}</button>
      </fetcher.Form>
      {fetcher.data?.error && <p className="form-error" role="alert">{fetcher.data.error} Your result has not been saved. Retry, or reload if the attempt changed.</p>}
    </> : card && <>
      <div className="flashcard-status" role="status" aria-live="polite" aria-atomic="true">
        <h1>{progress.stage === "confirmation" ? "Full-deck confirmation" : contextCards ? "Collected revision" : "Practice round"}</h1>
        <p>Card {progress.index + 1} of {progress.round.length} · {progress.missed.length} missed this round</p>
      </div>
      <p className="flashcard-instructions">Look at the character, think in your head what you think it is. Then click reveal. Click 'Got it' if you got it right!</p>
      <div className={`practice-card ${progress.revealed ? "is-revealed" : "is-front"}${contextCards ? " practice-card--context" : ""}`} data-revealed={String(progress.revealed)}>
        {!progress.revealed && <span className="hanzi practice-front-glyph" lang="zh-Hans">{card.hanzi}</span>}
        <div className="practice-card-content" aria-hidden={!progress.revealed || undefined} style={!progress.revealed ? { opacity: 0, pointerEvents: "none" } : undefined}>
          <span className="hanzi" lang="zh-Hans">{card.hanzi}</span>
        <ul className="readings" aria-label={`Readings for ${card.hanzi}`}>{card.pinyin.map((reading) => <li key={reading} lang="zh-Latn-pinyin">{reading}</li>)}</ul>
        {context && <p lang="zh-Hans" className="revision-sentence" aria-label={progress.revealed ? "Saved sentence context" : undefined} data-revision-character={card.hanzi}>{context.sentence.map((token, index) => typeof token === "string" ? <span key={index}>{token}</span> : <span className="revision-token" key={index} data-context-occurrence={token.ref} data-show-pinyin={String(token.showPinyin)}><span className="reader-pinyin" style={{ visibility: token.showPinyin ? "visible" : "hidden" }} lang="zh-Latn-pinyin">{token.pinyin}</span><span>{token.hanzi}</span></span>)}</p>}
        </div>
      </div>
      <div className="flashcard-actions">
        {!progress.revealed ? <button ref={revealButton} type="button" onClick={() => { sound.prime(); sound.play("reveal"); setProgress(revealCard(progress)); }}>Reveal</button> : <>
          <button ref={gotButton} type="button" onClick={() => { sound.prime(); sound.play("got-it"); setProgress(answerCard(progress, true)); }}>Got it</button>
          <button className="secondary" type="button" onClick={() => { sound.prime(); sound.play("not-yet"); setProgress(answerCard(progress, false)); }}>Have not got it</button>
        </>}
      </div>
    </>}
  </section>;
}
