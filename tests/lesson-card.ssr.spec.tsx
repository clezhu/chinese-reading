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
      lesson: curriculum.modules[0].lessons[0], status: "completed", number: 1, ...props,
    })),
  }]);
  try {
    return renderToStaticMarkup(createElement(RouterProvider, { router }));
  } finally {
    router.dispose();
  }
}

for (const phase of ["introduction", "flashcards", "story", "revision-flashcards"] as const) {
  test(`a completed lesson in ${phase} resumes its revisit without a reset action`, () => {
    const html = renderCard({ phase, attemptId: "active-attempt" });
    expect(html).toContain('class="lesson-card completed"');
    expect(html).toContain(">Completed</span>");
    expect(html).toContain(`href="/lessons/${first.id}"`);
    expect(html).toContain(">Resume revisit<span");
    expect(html).not.toContain("View lesson");
    expect(html).not.toContain("<form");
    expect(html).not.toContain("Revisit lesson");
  });
}

for (const lesson of [curriculum.modules[0].lessons[0], revisionLessonFixture]) {
  test(`a finished ${lesson.kind} lesson offers an explicit attempt-scoped POST revisit`, () => {
    const html = renderCard({ lesson, phase: "complete", attemptId: "finished-attempt" });
    expect(html).toContain(">Completed</span>");
    expect(html).toContain(">View lesson<span");
    expect(html).toContain('method="post"');
    expect(html).toContain(`action="/lessons/${lesson.id}"`);
    expect(html).toContain('name="intent" value="revisit"');
    expect(html).toContain('name="attempt_id" value="finished-attempt"');
    expect(html).toContain(">Revisit lesson<span");
    expect(html).not.toContain("Resume revisit");
  });
}

test("optional progress props retain safe SSR defaults without offering an unscoped reset", () => {
  for (const props of [{}, { phase: "complete" as const }, { attemptId: "unknown-phase" }]) {
    const html = renderCard(props);
    expect(html).toContain(">Completed</span>");
    expect(html).toContain(">View lesson<span");
    expect(html).not.toContain("<form");
  }
  const unfinished = renderCard({ status: "in-progress", phase: "story", attemptId: "first-attempt" });
  expect(unfinished).toContain(">In progress</span>");
  expect(unfinished).toContain(">Resume lesson<span");
  expect(unfinished).not.toContain("revisit");
});

test("an available revision fixture starts through the ordinary start POST", () => {
  const html = renderCard({ lesson: revisionLessonFixture, status: "available" });
  expect(html).toContain(">Revision</span>");
  expect(html).toContain("No new characters");
  expect(html).toContain('method="post"');
  expect(html).toContain(`action="/lessons/${revisionLessonFixture.id}"`);
  expect(html).toContain('name="intent" value="start"');
  expect(html).toContain(">Start lesson<span");
});

test("the real list renderer distinguishes a revision fixture without publishing it", () => {
  const router = createMemoryRouter([{
    path: "/",
    element: createElement("ol", null,
      createElement(LessonCard, { lesson: curriculum.modules[0].lessons[0], status: "available", number: 1 }),
      createElement(LessonCard, { lesson: revisionLessonFixture, status: "locked", number: 2 }),
    ),
  }]);
  try {
    const html = renderToStaticMarkup(createElement(RouterProvider, { router }));
    expect(html).toContain(">Learning</span>");
    expect(html).toContain(`${first.newCharacters.length} new characters`);
    expect(html).toContain(">Revision</span>");
    expect(html).toContain("Foundations revision</h3>");
    expect(html).toContain("No new characters");
    expect(html).toContain(">Locked</span>");
    expect(html).toContain("Complete the previous lesson to unlock.");
    expect(html).not.toContain(`/lessons/${revisionLessonFixture.id}`);
    expect(curriculum.modules.flatMap((module) => module.lessons.map((lesson) => lesson.id)))
      .toEqual(lessons.map((lesson) => lesson.id));
  } finally {
    router.dispose();
  }
});
