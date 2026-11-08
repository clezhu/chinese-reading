import { test, expect } from "@playwright/test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LessonCard } from "../app/components/lesson-card";
import { curriculum } from "../app/content/curriculum";
import { revisionLessonFixture } from "../app/content/fixtures/revision";

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
    expect(html).toContain("5 new characters");
    expect(html).toContain(">Revision</span>");
    expect(html).toContain("Foundations revision</h3>");
    expect(html).toContain("No new characters");
    expect(html).toContain(">Locked</span>");
    expect(html).toContain("Complete the previous lesson to unlock.");
    expect(html).not.toContain(`/lessons/${revisionLessonFixture.id}`);
    expect(curriculum.modules.flatMap((module) => module.lessons.map((lesson) => lesson.id)))
      .toEqual(["first-characters", "people-and-places", "everyday-connections"]);
  } finally {
    router.dispose();
  }
});
