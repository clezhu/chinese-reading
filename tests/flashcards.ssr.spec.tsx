import { expect, test } from "@playwright/test";
import {
  answerCard,
  createDeckProgress,
  restoreDeckProgress,
  revealCard,
} from "../app/lib/flashcards";

type Progress = ReturnType<typeof createDeckProgress>;

function answer(state: Progress, got: boolean): Progress {
  return answerCard(revealCard(state), got);
}

function answerRound(state: Progress, answers: readonly boolean[]): Progress {
  expect(state.index).toBe(0);
  expect(state.round).toHaveLength(answers.length);
  return answers.reduce((next, got) => answer(next, got), state);
}

test("a clean initial full-deck round completes without a redundant confirmation", () => {
  const deck = ["我", "你", "他"];
  const fresh = createDeckProgress(deck);
  expect(fresh).toEqual({
    deck, stage: "practice", round: deck, index: 0, missed: [], revealed: false,
  });

  const complete = answerRound(fresh, [true, true, true]);
  expect(complete).toEqual({ deck, stage: "complete", round: deck, index: 3, missed: [], revealed: false });
  expect(restoreDeckProgress(JSON.parse(JSON.stringify(complete)), deck)).toEqual(complete);
});

test("a full-deck retry after missing every card also completes with one clean pass", () => {
  const deck = ["一", "二", "三"];
  const retry = answerRound(createDeckProgress(deck), [false, false, false]);
  expect(retry.stage).toBe("practice");
  expect(retry.round).toEqual(deck);
  expect(answerRound(retry, [true, true, true]).stage).toBe("complete");
});

test("a one-card deck completes on its first successful round, including after misses", () => {
  const fresh = createDeckProgress(["一"]);
  expect(answer(fresh, true).stage).toBe("complete");
  const retry = answer(answer(fresh, false), false);
  expect(answer(retry, true).stage).toBe("complete");
  expect(createDeckProgress([]).stage).toBe("complete");
});

test("repeated practice misses retry only the missed subset and retain the original non-five-card deck", () => {
  const deck = ["一", "二", "三", "四", "五", "六", "七"];
  let state = answerRound(createDeckProgress(deck), [true, false, true, false, true, false, true]);
  expect(state).toEqual({
    deck, stage: "practice", round: ["二", "四", "六"], index: 0, missed: [], revealed: false,
  });
  state = answerRound(state, [false, true, false]);
  expect(state).toEqual({
    deck, stage: "practice", round: ["二", "六"], index: 0, missed: [], revealed: false,
  });
  state = answerRound(state, [false, true]);
  expect(state.round).toEqual(["二"]);
  expect(state.deck).toEqual(deck);
  state = answerRound(state, [true]);
  expect(state).toEqual({
    deck, stage: "confirmation", round: deck, index: 0, missed: [], revealed: false,
  });
  expect(answerRound(state, deck.map(() => true)).stage).toBe("complete");
  expect(deck).toEqual(["一", "二", "三", "四", "五", "六", "七"]);
});

test("failed confirmation finishes the entire round, practises misses, then confirms the full deck", () => {
  const deck = ["日", "月", "水", "火"];
  let state = answerRound(createDeckProgress(deck), [false, true, true, true]);
  state = answerRound(state, [true]);
  state = answer(state, false);
  expect(state).toEqual({
    deck, stage: "confirmation", round: deck, index: 1, missed: ["日"], revealed: false,
  });
  state = answer(state, true);
  state = answer(state, false);
  expect(state.stage).toBe("confirmation");
  expect(state.index).toBe(3);
  expect(state.missed).toEqual(["日", "水"]);
  state = answer(state, true);
  expect(state).toEqual({
    deck, stage: "practice", round: ["日", "水"], index: 0, missed: [], revealed: false,
  });
  state = answerRound(state, [true, true]);
  expect(state).toEqual({
    deck, stage: "confirmation", round: deck, index: 0, missed: [], revealed: false,
  });
  expect(answerRound(state, [true, true, true, true]).stage).toBe("complete");
});

test("answers require reveal on every card and cannot be submitted after completion", () => {
  let state = createDeckProgress(["人", "口"]);
  expect(() => answerCard(state, true)).toThrow();
  expect(() => answerCard(state, false)).toThrow();
  const revealed = revealCard(state);
  expect(revealed).toEqual({ ...state, revealed: true });
  expect(revealCard(revealed)).toEqual(revealed);
  state = answerCard(revealed, true);
  expect(state.index).toBe(1);
  expect(state.revealed).toBe(false);
  expect(() => answerCard(state, true)).toThrow();
  state = answer(state, true);
  expect(state.stage).toBe("complete");
  expect(() => answerCard(state, true)).toThrow();
  expect(() => answerCard(state, false)).toThrow();
});

test("valid serialized progress restores a revealed card and its accumulated misses", () => {
  const deck = ["天", "地", "人"];
  const state = revealCard(answer(createDeckProgress(deck), false));
  const restored = restoreDeckProgress(JSON.parse(JSON.stringify(state)), deck);
  expect(restored).toEqual(state);
  expect(answerCard(restored, true)).toEqual(answerCard(state, true));
});

test("invalid local progress falls back to a fresh current deck", () => {
  const deck = ["天", "地", "人"];
  const fresh = createDeckProgress(deck);
  const invalid: unknown[] = [
    undefined, null, false, 42, "not-json", [], {},
    { ...fresh, deck: ["旧"] },
    { ...fresh, deck: [...deck].reverse() },
    { ...fresh, stage: "unknown" },
    { ...fresh, index: -1 },
    { ...fresh, index: deck.length },
    { ...fresh, index: 0.5 },
    { ...fresh, index: "0" },
    { ...fresh, round: [] },
    { ...fresh, round: ["外"] },
    { ...fresh, round: "天" },
    { ...fresh, missed: ["外"] },
    { ...fresh, missed: "天" },
    { ...fresh, revealed: "false" },
  ];
  for (const value of invalid) {
    expect(restoreDeckProgress(value, deck), JSON.stringify(value)).toEqual(fresh);
  }
});
