import { expect, test } from "@playwright/test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createMemoryRouter, RouterProvider } from "react-router";
import { StoryReader } from "../app/components/story-reader";
import { curriculum, type Curriculum, type Lesson } from "../app/content/curriculum";
import { enumerateStory, revisionCards, type StoryState } from "../app/lib/story";
import { candidates, first, firstRef } from "./content-helpers";

// Small token/ordering fixtures, not proposed curriculum or language approval.
const lesson: Lesson = {
  id: "target", title: "Target", description: "", kind: "learning", contentRevision: 2,
  newCharacters: [
    { id: "了", hanzi: "了", pinyin: ["le", "liǎo"] },
    { id: "是", hanzi: "是", pinyin: ["shì"] },
  ],
  story: { paragraphs: [
    [
      [{ hanzi: "了", pinyin: "le" }, "，", { hanzi: "是", pinyin: "shì" }, { hanzi: "了", pinyin: "liǎo" }, { hanzi: "小", pinyin: "xiǎo" }, "。"],
      [{ hanzi: "了", pinyin: "liǎo" }, { hanzi: "是", pinyin: "shì" }, "。"],
    ],
    [[{ hanzi: "的", pinyin: "de" }, { hanzi: "了", pinyin: "le" }, "。"]],
  ] },
};
const content: Curriculum = { modules: [{ id: "module", title: "Module", lessons: [
  { id: "prior", title: "Prior", description: "", kind: "learning", contentRevision: 1, newCharacters: [{ id: "的", hanzi: "的", pinyin: ["de"] }] },
  lesson,
  { id: "later", title: "Later", description: "", kind: "learning", contentRevision: 1, newCharacters: [{ id: "小", hanzi: "小", pinyin: ["xiǎo"] }] },
] }] };

test("enumeration preserves punctuation indexes and story order with derived permanent help", () => {
  const entries = enumerateStory(lesson, content);
  expect(entries.map((entry) => entry.ref)).toEqual(["0:0:0", "0:0:2", "0:0:3", "0:0:4", "0:1:0", "0:1:1", "1:0:0", "1:0:1"]);
  expect(entries[2]).toEqual({ ref: "0:0:3", paragraphIndex: 0, sentenceIndex: 0, tokenIndex: 3, hanzi: "了", pinyin: "liǎo", permanent: false });
  expect(entries.filter((entry) => entry.permanent).map((entry) => entry.hanzi)).toEqual(["小"]);
  expect(entries.find((entry) => entry.hanzi === "的")?.permanent).toBe(false);
});

test("revision deduplicates and selects the earliest revealed occurrence, regardless of interaction order", () => {
  const reveals = ["0:1:0", "0:0:3", "0:0:3", "0:0:2"];
  const cards = revisionCards(lesson, reveals, content);
  expect(cards.map((card) => card.character.hanzi)).toEqual(["是", "了"]);
  expect(cards.map((card) => card.occurrence.ref)).toEqual(["0:0:2", "0:0:3"]);
  expect(cards[1].character.pinyin).toEqual(["le", "liǎo"]);
  expect(cards[1].occurrence.pinyin).toBe("liǎo");
  expect(reveals).toEqual(["0:1:0", "0:0:3", "0:0:3", "0:0:2"]);
  expect(revisionCards(lesson, [...reveals].reverse(), content)).toEqual(cards);
});

test("revision context is one sentence with final occurrence-specific and permanent visibility", () => {
  const cards = revisionCards(lesson, ["0:1:0", "0:0:3", "0:0:2"], content);
  expect(cards[1].sentence).toHaveLength(6); // Not the other sentence in this paragraph.
  expect(cards[1].sentence[1]).toBe("，");
  expect(cards[1].sentence[5]).toBe("。");
  const tokens = cards[1].sentence.filter((token) => typeof token !== "string");
  expect(tokens.map(({ pinyin, revealed, showPinyin, permanent }) => ({ pinyin, revealed, showPinyin, permanent }))).toEqual([
    { pinyin: "le", revealed: false, showPinyin: false, permanent: false },
    { pinyin: "shì", revealed: true, showPinyin: true, permanent: false },
    { pinyin: "liǎo", revealed: true, showPinyin: true, permanent: false },
    { pinyin: "xiǎo", revealed: false, showPinyin: true, permanent: true },
  ]);
  expect(revisionCards(lesson, ["0:0:3"], content)[0].sentence[2]).toMatchObject({ showPinyin: false });
});

test("empty, invalid, punctuation and permanent-help references never add revision cards", () => {
  expect(revisionCards(lesson, [], content)).toEqual([]);
  expect(revisionCards(lesson, ["0:0:1", "0:0:4", "00:0:3", "0:0:-1", "1:9:1", "bogus"], content)).toEqual([]);
  expect(revisionCards(lesson, ["0:0:4", "0:0:3"], content).map((card) => card.character.hanzi)).toEqual(["了"]);
});

test("revision-kind stories use prior introductions without introducing new characters", () => {
  const revision: Lesson = { ...lesson, id: "revision", kind: "revision", newCharacters: [] };
  const revised: Curriculum = { modules: [{ ...content.modules[0], lessons: [lesson, revision] }] };
  expect(enumerateStory(revision, revised).find((entry) => entry.hanzi === "了")?.permanent).toBe(false);
  expect(revisionCards(revision, ["0:0:3"], revised)[0].character.pinyin).toEqual(["le", "liǎo"]);
  const absent: Lesson = { ...revision, story: undefined };
  expect(enumerateStory(absent, revised)).toEqual([]);
  expect(revisionCards(absent, ["0:0:3"], revised)).toEqual([]);
  expect(() => enumerateStory({ ...lesson, id: "unknown" }, content)).toThrow("Unknown lesson");
});

test("wire round-tripping durable reveals reconstructs identical contextual cards", () => {
  const state: StoryState = { attemptId: "attempt", contentRevision: 2, phase: "revision-flashcards", revealed: ["0:0:3", "0:1:0", "0:0:2"], updatedAt: 100, version: 4 };
  const restored: StoryState = JSON.parse(JSON.stringify(state));
  expect(revisionCards(lesson, restored.revealed, content)).toEqual(revisionCards(lesson, state.revealed, content));
});

test("fresh reread SSR hides every taught occurrence while permanent help remains visible", () => {
  const state: StoryState = { attemptId: "fresh-pass", contentRevision: first.contentRevision, phase: "story", revealed: [], updatedAt: 2, version: 0 };
  const router = createMemoryRouter([{
    path: "/lessons/:id", element: createElement(StoryReader, { lesson: first, state }),
  }], { initialEntries: [`/lessons/${first.id}`] });
  try {
    const html = renderToStaticMarkup(createElement(RouterProvider, { router }));
    for (const entry of candidates.taught) expect(html).toContain(`data-occurrence="${entry.ref}" data-revealed="false" data-permanent="false" data-save-state="hidden"`);
    for (const entry of candidates.permanent) expect(html).toContain(`data-occurrence="${entry.ref}" data-revealed="true" data-permanent="true" data-save-state="permanent"`);
    expect(html).not.toContain("No reveals yet.");
    expect(html).not.toContain("All reveals saved.");
    expect(html).toContain(">Finish reading</button>");
  } finally { router.dispose(); }
});

test("reader SSR exposes independent controls, permanent non-controls and both reserved lanes", () => {
  const published = first;
  const state: StoryState = { attemptId: "ssr", contentRevision: published.contentRevision, phase: "story", revealed: [firstRef], updatedAt: 1, version: 1 };
  const router = createMemoryRouter([{
    path: "/lessons/:id",
    element: createElement(StoryReader, { lesson: published, state }),
  }], { initialEntries: [`/lessons/${published.id}`] });
  try {
    const html = renderToStaticMarkup(createElement(RouterProvider, { router }));
    expect(html).toContain(`data-occurrence="${firstRef}" data-revealed="true" data-permanent="false" data-save-state="saved"`);
    const hidden = candidates.taught[1];
    expect(html).toContain(`data-occurrence="${hidden.ref}" data-revealed="false"`);
    for (const entry of candidates.permanent) expect(html).toContain(`data-occurrence="${entry.ref}" data-revealed="true" data-permanent="true" data-save-state="permanent"`);
    expect(html).toContain(`aria-label="Reveal pinyin for ${hidden.hanzi}, paragraph ${hidden.paragraphIndex + 1}, sentence ${hidden.sentenceIndex + 1}, token ${hidden.tokenIndex + 1}"`);
    expect(html).toContain('class="reader-pinyin" lang="zh-Latn-pinyin" style="visibility:hidden"');
    expect(html.match(/class="reader-paragraph"/g)).toHaveLength(published.story!.paragraphs.length);
    expect(html).toContain("All reveals saved.");
    expect(html).toContain(">Finish reading</button>");
  } finally { router.dispose(); }
});
