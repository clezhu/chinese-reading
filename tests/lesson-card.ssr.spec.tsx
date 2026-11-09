import { test, expect } from "@playwright/test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LessonCard } from "../app/components/lesson-card";
import { curriculum } from "../app/content/curriculum";
import { revisionLessonFixture } from "./revision-curriculum";
import { first, lessons } from "./content-helpers";
import type { ComponentProps } from "react";

function renderCard(props: Partial<ComponentProps<typeof LessonCard>> = {}) {
  const router = createMemoryRouter([{
    path: "/",
    element: createElement("ol", null, createElement(LessonCard, {
      lesson: first, status: "completed", number: 1, ...props,
    })),
  }]);
  try {
    return renderToStaticMarkup(createElement(RouterProvider, { router }));
  } finally {
    router.dispose();
  }
}

const actionCount = (html: string) => (html.match(/<(?:a|button)\b/g) ?? []).length;

for (const phase of ["introduction", "flashcards", "story", "revision-flashcards"] as const) {
  test(`a completed lesson in ${phase} resumes its revisit without a reset action`, () => {
    const html = renderCard({ phase, attemptId: "active-attempt" });
    expect(html).toContain("Completed");
    expect(html).toContain(`href="/lessons/${first.id}"`);
    expect(html).toContain("Resume revisit");
    expect(actionCount(html)).toBe(1);
    expect(html).not.toContain("View lesson");
    expect(html).not.toContain("<form");
    expect(html).not.toContain("Revisit lesson");
  });
}

for (const lesson of [first, revisionLessonFixture]) {
  test(`a finished ${lesson.kind} lesson has only an attempt-scoped POST revisit`, () => {
    const html = renderCard({ lesson, phase: "complete", attemptId: "finished-attempt" });
    expect(html).toContain("Completed");
    expect(html).toContain('method="post"');
    expect(html).toContain(`action="/lessons/${lesson.id}"`);
    expect(html).toContain('name="intent" value="revisit"');
    expect(html).toContain('name="attempt_id" value="finished-attempt"');
    expect(html).toContain("Revisit lesson");
    expect(actionCount(html)).toBe(1);
    expect(html).not.toContain("<a ");
    expect(html).not.toContain("View lesson");
    expect(html).not.toContain("Resume revisit");
  });
}

test("optional progress props retain safe SSR defaults without offering an unscoped reset", () => {
  for (const props of [{}, { phase: "complete" as const }, { attemptId: "unknown-phase" }]) {
    const html = renderCard(props);
    expect(html).toContain("Completed");
    expect(html).not.toContain("<form");
    expect(actionCount(html)).toBeLessThanOrEqual(1);
  }
  const unfinished = renderCard({ status: "in-progress", phase: "story", attemptId: "first-attempt" });
  expect(unfinished).toContain("In progress");
  expect(unfinished).toContain("Resume lesson");
  expect(unfinished).toContain(`href="/lessons/${first.id}"`);
  expect(actionCount(unfinished)).toBe(1);
  expect(unfinished).not.toContain("<form");
  expect(unfinished).not.toContain("revisit");
});

test("an available revision fixture starts through the ordinary start POST", () => {
  const html = renderCard({ lesson: revisionLessonFixture, status: "available" });
  expect(html).toContain("Revision");
  expect(html).toContain('method="post"');
  expect(html).toContain(`action="/lessons/${revisionLessonFixture.id}"`);
  expect(html).toContain('name="intent" value="start"');
  expect(html).toContain("Start lesson");
  expect(actionCount(html)).toBe(1);
  expect(html).not.toContain("<a ");
});

test("the real list renderer uses authored characters and distinguishes a locked revision without publishing it", () => {
  const router = createMemoryRouter([{
    path: "/",
    element: createElement("ol", null,
      createElement(LessonCard, { lesson: first, status: "available", number: 1 }),
      createElement(LessonCard, { lesson: revisionLessonFixture, status: "locked", number: 2 }),
    ),
  }]);
  try {
    const html = renderToStaticMarkup(createElement(RouterProvider, { router }));
    for (const character of first.newCharacters) expect(html).toContain(character.hanzi);
    expect(html).toContain("Revision");
    expect(html).toContain("Foundations revision</h3>");
    expect(html).toContain("Locked");
    // Only the learning lesson is actionable. No URL, form or reset for a lock.
    expect(actionCount(html)).toBe(1);
    expect(html).not.toContain(`/lessons/${revisionLessonFixture.id}`);
    expect(curriculum.modules.flatMap((module) => module.lessons.map((lesson) => lesson.id)))
      .toEqual(lessons.map((lesson) => lesson.id));
  } finally {
    router.dispose();
  }
});
