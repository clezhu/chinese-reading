import { expect, test, type Page } from "@playwright/test";
import { curriculum, revisionLessonFixture, orderedLessons } from "./revision-curriculum";
import { revisionCards, type RevisionCard, type StoryState } from "../app/lib/story";
import { lessonCard, login, register } from "./helpers";
import { lessonPath, storyCandidates } from "./content-helpers";

const lessons = orderedLessons();
const first = lessons[0];
const revision = lessonPath(revisionLessonFixture);
const next = lessonPath(lessons[2]);
const title = revisionLessonFixture.title;
const candidates = storyCandidates(revisionLessonFixture, curriculum);
const ref = candidates.taught[0].ref;
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
async function unlockRevision(page: Page, existing?: Awaited<ReturnType<typeof register>>) {
  const credentials = existing ?? await register(page);
  await lessonCard(page, first.title).getByRole("button", { name: /^Start lesson/ }).click();
  await page.getByRole("button", { name: "Start flashcards", exact: true }).click();
  for (let i = 0; i < first.newCharacters.length; i++) {
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
  await lessonCard(page, title).getByRole("button", { name: /^Start lesson/ }).click();
  await expect(page).toHaveURL(revision);
  await expect(reader(page)).toBeVisible();
  await noIntroduction(page);
  const saved = await snapshot(page);
  expect(saved.state).toMatchObject({ phase: "story", contentRevision: revisionLessonFixture.contentRevision, revealed: [] });
  expect(saved.state.attemptId).not.toBe("");
  expect(saved.cards).toEqual([]);
  return saved.state;
}
const milestones = (page: Page) => page.locator('[aria-label="Completion milestones"] dd').allTextContents();

test("fixture list distinguishes revision; start/resume skips initial learning and derives inherited help", async ({ page }) => {
  const credentials = await register(page);
  await expect(page.getByRole("main").locator("h2, h3")).toHaveText(curriculum.modules.flatMap((module) => [module.title, ...module.lessons.map((lesson) => lesson.title)]));
  const card = lessonCard(page, title);
  await expect(card.getByText("Revision", { exact: true })).toBeVisible();
  await expect(card.getByText("No new characters", { exact: true })).toBeVisible();
  await expect(card.getByText("Locked", { exact: true })).toBeVisible();
  expect((await page.request.get(revision)).status()).toBe(403);
  await unlockRevision(page, credentials);
  const initial = await startRevision(page);
  for (const entry of candidates.occurrences) {
    await expect(occurrence(page, entry.ref)).toHaveAttribute("data-permanent", String(entry.permanent));
    if (entry.permanent) await expect(occurrence(page, entry.ref).locator(".reader-pinyin")).toBeVisible();
    else await expect(occurrence(page, entry.ref).locator(".reader-pinyin")).toBeHidden();
  }
  await page.reload();
  await noIntroduction(page);
  expect((await snapshot(page)).state).toEqual(initial);
  await page.goto("/lessons");
  await expect(card.getByText("In progress", { exact: true })).toBeVisible();
  await card.getByRole("link", { name: /^Resume lesson/ }).click();
  expect((await snapshot(page)).state).toEqual(initial);
  expect((await page.request.get(next)).status()).toBe(403);
});

test("no-reveal revision completes across devices; explicit revision revisit starts a fresh story", async ({ page, browser }) => {
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
  const other = await browser.newContext({ baseURL: new URL(page.url()).origin });
  try {
    const otherPage = await other.newPage();
    await login(otherPage, credentials);
    await expect(lessonCard(otherPage, lessons[2].title).getByText("Available", { exact: true })).toBeVisible();
    await lessonCard(otherPage, title).getByRole("link", { name: /^View lesson/ }).click();
    expect(await snapshot(otherPage)).toEqual(complete);
    await otherPage.goto("/lessons");
    await lessonCard(otherPage, title).getByRole("button", { name: /^Revisit lesson/ }).click();
    await expect(reader(otherPage)).toBeVisible();
    await noIntroduction(otherPage);
    const revisit = await snapshot(otherPage);
    expect(revisit.state).toMatchObject({ phase: "story", revealed: [], version: 0 });
    expect(revisit.state.attemptId).not.toBe(initial.attemptId);
    expect(await milestones(otherPage)).toEqual(dates);
    await otherPage.goto("/lessons");
    await lessonCard(otherPage, title).getByRole("link", { name: /^Resume revisit/ }).click();
    expect(await snapshot(otherPage)).toEqual(revisit);
    await finish(otherPage).click();
    await expect(otherPage.getByRole("heading", { name: "Lesson complete", exact: true })).toBeVisible();
    const latest = await milestones(otherPage);
    expect(latest[0]).toBe(dates[0]);
    expect(latest[1]).not.toBe(dates[1]);
  } finally { await other.close(); }
});

test("revision-kind current-pass practice requires a fresh reread and never earns milestones by itself", async ({ page }) => {
  await unlockRevision(page);
  await startRevision(page);
  const identities = new Set<string>();
  for (let pass = 0; pass < 2; pass++) {
    await occurrence(page, ref).click();
    await expect(occurrence(page, ref)).toHaveAttribute("data-save-state", "saved");
    await finish(page).click();
    await expect(page.getByRole("heading", { name: "Collected revision", exact: true })).toBeVisible();
    const frozen = await snapshot(page);
    identities.add(frozen.state.attemptId);
    expect(frozen.state).toMatchObject({ phase: "revision-flashcards", revealed: [ref] });
    expect(frozen.cards).toEqual(revisionCards(revisionLessonFixture, [ref], curriculum));
    await noIntroduction(page);
    await page.reload();
    expect(await snapshot(page)).toEqual(frozen);
    await page.goto("/lessons");
    await expect(lessonCard(page, title).getByText("In progress", { exact: true })).toBeVisible();
    await expect(lessonCard(page, lessons[2].title).getByText("Locked", { exact: true })).toBeVisible();
    await lessonCard(page, title).getByRole("link", { name: /^Resume lesson/ }).click();
    await expect(page.getByRole("heading", { name: "Practice round", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Reveal", exact: true }).click();
    await page.getByRole("button", { name: "Got it", exact: true }).click();
    await expect(page.getByRole("button", { name: "Continue to story", exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "Reread story", exact: true }).click();
    await expect(reader(page)).toBeVisible();
    await noIntroduction(page);
    const fresh = await snapshot(page);
    expect(fresh.state).toMatchObject({ phase: "story", revealed: [], version: 0 });
    expect(fresh.state.attemptId).not.toBe(frozen.state.attemptId);
    expect(fresh.cards).toEqual([]);
    expect(await milestones(page)).toEqual([]);
    for (const entry of candidates.taught) await expect(occurrence(page, entry.ref).locator(".reader-pinyin")).toBeHidden();
    await page.reload();
    expect(await snapshot(page)).toEqual(fresh);
  }
  expect(identities.size).toBe(2);
  await finish(page).click();
  await expect(page.getByRole("heading", { name: "Lesson complete", exact: true })).toBeVisible();
  expect(await milestones(page)).toHaveLength(2);
  await page.goto("/lessons");
  await expect(lessonCard(page, lessons[2].title).getByText("Available", { exact: true })).toBeVisible();
});
