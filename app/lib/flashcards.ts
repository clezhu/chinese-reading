/** Browser-owned self-assessment. No database, React, or fixed deck-size assumptions. */
export type DeckProgress = {
  deck: string[];
  stage: "practice" | "confirmation" | "complete";
  round: string[];
  index: number;
  missed: string[];
  revealed: boolean;
};

export function createDeckProgress(deck: readonly string[]): DeckProgress {
  if (new Set(deck).size !== deck.length || deck.some((id) => !id)) throw new Error("Deck must contain unique character IDs");
  return { deck: [...deck], stage: deck.length ? "practice" : "complete", round: [...deck], index: 0, missed: [], revealed: false };
}

export function revealCard(state: DeckProgress): DeckProgress {
  if (state.stage === "complete") throw new Error("Deck is complete");
  return { ...state, revealed: true };
}

export function answerCard(state: DeckProgress, got: boolean): DeckProgress {
  if (!state.revealed || state.stage === "complete") throw new Error("Reveal the card before answering");
  const missed = got ? [...state.missed] : [...state.missed, state.round[state.index]];
  const index = state.index + 1;
  if (index < state.round.length) return { ...state, index, missed, revealed: false };
  if (missed.length) return { ...state, stage: "practice", round: missed, index: 0, missed: [], revealed: false };
  if (state.stage === "confirmation") return { ...state, stage: "complete", index, missed: [], revealed: false };
  return { ...state, stage: "confirmation", round: [...state.deck], index: 0, missed: [], revealed: false };
}

/** Local storage is optional/untrusted; stale content or malformed state starts fresh. */
export function restoreDeckProgress(value: unknown, deck: readonly string[]): DeckProgress {
  const fresh = createDeckProgress(deck);
  if (!value || typeof value !== "object") return fresh;
  const s = value as Partial<DeckProgress>;
  const equal = (a: unknown, b: readonly string[]) => Array.isArray(a) && a.length === b.length && a.every((id, i) => id === b[i]);
  if (!equal(s.deck, deck) || !Array.isArray(s.round) || !Array.isArray(s.missed) ||
    !["practice", "confirmation", "complete"].includes(s.stage ?? "") ||
    typeof s.revealed !== "boolean" || !Number.isInteger(s.index)) return fresh;
  const round = s.round;
  const index = s.index!;
  if (new Set(round).size !== round.length || round.some((id) => !deck.includes(id)) ||
    new Set(s.missed).size !== s.missed.length ||
    !equal(s.missed, round.slice(0, index).filter((id) => s.missed!.includes(id)))) return fresh;
  if (s.stage === "complete") {
    if (deck.length === 0) return fresh;
    if (!equal(round, deck) || index !== round.length || s.missed.length || s.revealed) return fresh;
  } else if (!round.length || index < 0 || index >= round.length ||
    (s.stage === "confirmation" && !equal(round, deck))) return fresh;
  return { deck: [...deck], stage: s.stage as DeckProgress["stage"], round: [...round], index, missed: [...s.missed], revealed: s.revealed };
}
