import { expect, test, type Page } from "@playwright/test";
import { revisionLessonFixture } from "../app/content/fixtures/revision";
import type { RevisionCard, StoryState } from "../app/lib/story";
import { lessonCard, login, register } from "./helpers";

const first = "/lessons/first-characters";
const revision = `/lessons/${revisionLessonFixture.id}`;
const next = "/lessons/people-and-places";
const title = revisionLessonFixture.title;
const reader = (page: Page) => page.getByRole("region", { name: "Story reader", exact: true });
const finish = (page: Page) => page.getByRole("button", { name: "Finish reading", exact: true });
const occurrence = (page: Page, ref: string) => page.locator(`[data-occurrence="${ref}"]`);

async function snapshot(page: Page): Promise<{ state: StoryState; cards: RevisionCard[] }> {
  const response = await page.request.get(`${revision}/reader`);
  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toBe("no-store");
  return response.json();
}

async function noIntroduction(page: Page) {
  await expect(page.getByRole("list", { name: "New characters", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Start flashcards", exact: true })).toHaveCount(0);
}

// Follow the preceding LEARNING lesson through public UI and the real D1
// milestone. Never seed a fixture account/phase or mock a Worker response.
async function unlockRevision(page: Page, existing?: Awaited<ReturnType<typeof register>>) {
  const credentials = existing ?? await register(page);
  await page.getByRole("button", { name: /^Start lesson\s*:\s*First characters$/ }).click();
  await expect(page).toHaveURL(first);
  await page.getByRole("button", { name: "Start flashcards", exact: true }).click();
  for (let i = 0; i < 5; i++) {
    await page.getByRole("button", { name: "Reveal", exact: true }).click();
    await page.getByRole("button", { name: "Got it", exact: true }).click();
  }
  await page.getByRole("button", { name: "Continue to story", exact: true }).click();
  await expect(reader(page)).toBeVisible();
  await finish(page).click();
  await expect(page.getByRole("heading", { name: "Lesson complete", exact: true })).toBeVisible();
  await page.goto("/lessons");
  await expect(lessonCard(page, title).getByText("Available", { exact: true })).toBeVisible();
  return credentials;
}

async function startRevision(page: Page) {
  await page.getByRole("button", { name: new RegExp(`^Start lesson\\s*:\\s*${title}$`) }).click();
  await expect(page).toHaveURL(revision);
  await expect(reader(page)).toBeVisible();
  await noIntroduction(page);
  const saved = await snapshot(page);
  expect(saved.state).toMatchObject({ phase: "story", contentRevision: revisionLessonFixture.contentRevision, revealed: [] });
  expect(saved.state.attemptId).not.toBe("");
  expect(saved.cards).toEqual([]);
  return saved.state;
}

async function milestones(page: Page) {
  return page.getByRole("definition").allTextContents();
}

test("fixture list distinguishes Revision with no new characters; start skips the initial deck and inherits only prior introductions", async ({ page }) => {
  const credentials = await register(page);
  await expect(page.getByRole("main").locator("h2, h3")).toHaveText([
    "Foundations", "First characters", title, "People and places", "Building connections", "Everyday connections",
  ]);
  const card = lessonCard(page, title);
  await expect(card.getByText("Revision", { exact: true })).toBeVisible();
  await expect(card.getByText("No new characters", { exact: true })).toBeVisible();
  await expect(card.getByText("Locked", { exact: true })).toBeVisible();
  await expect(card.getByText(/\d+ new characters/)).toHaveCount(0);
  expect((await page.request.get(revision)).status()).toBe(403);

  await unlockRevision(page, credentials);
  const initial = await startRevision(page);
  await expect(occurrence(page, "0:0:1")).toHaveAttribute("data-permanent", "false"); // 是: learned earlier.
  await expect(occurrence(page, "0:0:1").locator(".reader-pinyin")).toBeHidden();
  await expect(occurrence(page, "0:0:0")).toHaveAttribute("data-permanent", "true"); // 这: introduced later.
  await expect(occurrence(page, "0:0:0").locator(".reader-pinyin")).toBeVisible();
  await page.reload();
  await noIntroduction(page);
  expect((await snapshot(page)).state).toEqual(initial);
  await page.getByRole("link", { name: "Return to lesson list", exact: true }).click();
  await expect(card.getByText("In progress", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: new RegExp(`^Resume lesson\\s*:\\s*${title}$`) }).click();
  await expect(reader(page)).toBeVisible();
  expect((await snapshot(page)).state).toEqual(initial);
  expect((await page.request.get(next)).status()).toBe(403);
});

test("no-reveal revision completes without optional practice, persists across devices, and revisits directly into a fresh story", async ({ page, browser }) => {
  const credentials = await unlockRevision(page);
  const initial = await startRevision(page);
  await finish(page).click();
  await expect(page.getByRole("heading", { name: "Lesson complete", exact: true })).toBeVisible();
  await noIntroduction(page);
  const complete = await snapshot(page);
  expect(complete.state).toMatchObject({ attemptId: initial.attemptId, phase: "complete", revealed: [] });
  expect(complete.cards).toEqual([]);
  const dates = await milestones(page);
  expect(dates).toHaveLength(2);
  await page.reload();
  expect(await snapshot(page)).toEqual(complete);
  expect(await milestones(page)).toEqual(dates);
  await page.getByRole("link", { name: "Next lesson", exact: true }).click();
  await expect(page).toHaveURL(next);
  await expect(page.getByRole("list", { name: "New characters", exact: true })).toBeVisible();

  const other = await browser.newContext({ baseURL: new URL(page.url()).origin });
  try {
    const otherPage = await other.newPage();
    await login(otherPage, credentials);
    await expect(lessonCard(otherPage, title).getByText("Completed", { exact: true })).toBeVisible();
    await expect(lessonCard(otherPage, "People and places").getByText("Available", { exact: true })).toBeVisible();
    await otherPage.getByRole("link", { name: new RegExp(`^View lesson\\s*:\\s*${title}$`) }).click();
    await expect(otherPage.getByRole("heading", { name: "Lesson complete", exact: true })).toBeVisible();
    expect(await snapshot(otherPage)).toEqual(complete); // Viewing is not a new attempt.
    await otherPage.goto("/lessons");
    await otherPage.getByRole("button", { name: new RegExp(`^Revisit lesson\\s*:\\s*${title}$`) }).click();
    await expect(otherPage).toHaveURL(revision);
    await expect(reader(otherPage)).toBeVisible();
    await noIntroduction(otherPage);
    const revisit = await snapshot(otherPage);
    expect(revisit.state).toMatchObject({ phase: "story", revealed: [] });
    expect(revisit.state.attemptId).not.toBe(initial.attemptId);
    expect(await milestones(otherPage)).toEqual(dates);
    await otherPage.goto("/lessons");
    await expect(lessonCard(otherPage, title).getByText("Completed", { exact: true })).toBeVisible();
    await expect(lessonCard(otherPage, "People and places").getByText("Available", { exact: true })).toBeVisible();
    await otherPage.getByRole("link", { name: new RegExp(`^Resume revisit\\s*:\\s*${title}$`) }).click();
    expect(await snapshot(otherPage)).toEqual(revisit);
    await finish(otherPage).click();
    await expect(otherPage.getByRole("heading", { name: "Lesson complete", exact: true })).toBeVisible();
    expect((await snapshot(otherPage)).state).toMatchObject({ attemptId: revisit.state.attemptId, phase: "complete", revealed: [] });
    const latest = await milestones(otherPage);
    expect(latest[0]).toBe(dates[0]);
    expect(latest[1]).not.toBe(dates[1]);
  } finally { await other.close(); }
});

test("revision-kind story help produces optional collected practice, not an introduction; practice completion and revisit retain D1 milestones", async ({ page }) => {
  await unlockRevision(page);
  await startRevision(page);
  await occurrence(page, "0:2:3").click(); // 了: all readings inherited from the learning lesson.
  await expect(occurrence(page, "0:2:3")).toHaveAttribute("data-save-state", "saved");
  await finish(page).click();
  const frozen = await snapshot(page);
  expect(frozen.state).toMatchObject({ phase: "revision-flashcards", revealed: ["0:2:3"] });
  expect(frozen.cards.map((card) => card.character.hanzi)).toEqual(["了"]);
  expect(frozen.cards[0].character.pinyin).toEqual(["le", "liǎo"]);
  expect(frozen.cards[0].occurrence.ref).toBe("0:2:3");
  await noIntroduction(page);
  await page.reload();
  expect(await snapshot(page)).toEqual(frozen);
  await page.goto("/lessons");
  await expect(lessonCard(page, title).getByText("In progress", { exact: true })).toBeVisible();
  await expect(lessonCard(page, "People and places").getByText("Locked", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: new RegExp(`^Resume lesson\\s*:\\s*${title}$`) }).click();
  await expect(page.getByRole("button", { name: "Reveal", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Reveal", exact: true }).click();
  await page.getByRole("button", { name: "Got it", exact: true }).click();
  // Save through the actual completion form, not a synthetic revision-passed
  // claim. The server still controls the attempt/phase and completion milestone.
  await page.getByRole("button", { name: "Complete lesson", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Lesson complete", exact: true })).toBeVisible();
  const complete = await snapshot(page);
  expect(complete.state).toMatchObject({ attemptId: frozen.state.attemptId, phase: "complete", revealed: frozen.state.revealed });
  const dates = await milestones(page);
  expect(dates).toHaveLength(2);
  await page.goto("/lessons");
  await expect(lessonCard(page, title).getByText("Completed", { exact: true })).toBeVisible();
  await expect(lessonCard(page, "People and places").getByText("Available", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: new RegExp(`^Revisit lesson\\s*:\\s*${title}$`) }).click();
  await expect(reader(page)).toBeVisible();
  await noIntroduction(page);
  const revisit = await snapshot(page);
  expect(revisit.state).toMatchObject({ phase: "story", revealed: [] });
  expect(revisit.state.attemptId).not.toBe(complete.state.attemptId);
  expect(revisit.cards).toEqual([]);
  expect(await milestones(page)).toEqual(dates);
});
