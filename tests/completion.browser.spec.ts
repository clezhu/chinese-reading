import { expect, test, type Page } from "@playwright/test";
import { firstLesson, lessonCard, lockedLessons, login, origin, post, register, startReader } from "./helpers";
import type { StoryState } from "../app/lib/story";

async function state(page: Page, lesson = firstLesson): Promise<StoryState> {
  return (await (await page.request.get(`${lesson}/reader`)).json()).state;
}
async function answer(page: Page, got = true) {
  await page.getByRole("button", { name: "Reveal", exact: true }).click();
  await page.getByRole("button", { name: got ? "Got it" : "Didn't get it", exact: true }).click();
}
const milestones = (page: Page) => page.locator('[aria-label="Completion milestones"] time');

test("revision mastery gates completion, retries failed confirmations, and resumes frozen help", async ({ page, browser }) => {
  const credentials = await register(page);
  const attempt = await startReader(page);
  for (const ref of ["0:2:3", "0:2:4"]) {
    await page.locator(`[data-occurrence="${ref}"]`).click();
    await expect(page.locator(`[data-occurrence="${ref}"]`)).toHaveAttribute("data-save-state", "saved");
  }
  await page.getByRole("button", { name: "Finish reading", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Collected revision", exact: true })).toBeVisible();
  await expect(page.getByLabel("Saved sentence context")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Complete lesson", exact: true })).toHaveCount(0);
  await answer(page, false);
  await answer(page);
  await expect(page.getByText("Card 1 of 1 · 0 missed this round", { exact: true })).toBeVisible();
  await page.reload(); // Saved subset, not initial learning or story.
  await expect(page.getByText("Card 1 of 1 · 0 missed this round", { exact: true })).toBeVisible();
  await answer(page);
  await expect(page.getByRole("heading", { name: "Full-deck confirmation", exact: true })).toBeVisible();
  await answer(page);
  await answer(page, false);
  await answer(page);
  await expect(page.getByRole("heading", { name: "Full-deck confirmation", exact: true })).toBeVisible();
  const other = await browser.newContext({ baseURL: origin });
  try {
    const otherPage = await other.newPage();
    await login(otherPage, credentials);
    await otherPage.goto(firstLesson);
    await expect(otherPage.getByText("Card 1 of 2 · 0 missed this round", { exact: true })).toBeVisible();
    expect((await state(otherPage)).attemptId).toBe(attempt);
    await otherPage.getByRole("button", { name: "Reveal", exact: true }).click();
    await expect(otherPage.getByRole("list", { name: "Readings for 了", exact: true }).getByRole("listitem")).toHaveText(["le", "liǎo"]);
    await expect(otherPage.locator('[data-context-occurrence="0:2:4"] .reader-pinyin')).toBeVisible();
  } finally { await other.close(); }
  await answer(page);
  await answer(page);
  await expect(page.getByRole("button", { name: "Complete lesson", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Complete lesson", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Lesson complete", exact: true })).toBeVisible();
  const dates = await milestones(page).evaluateAll((nodes) => nodes.map((node) => node.getAttribute("datetime")));
  expect(dates[0]).toBe(dates[1]);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Lesson complete", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Next lesson", exact: true }).click();
  await expect(page).toHaveURL(lockedLessons[0]);
});

test("narrow revision cards wrap their context and retain an unsaved result for retry", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await register(page);
  await startReader(page);
  await page.locator('[data-occurrence="0:2:3"]').click();
  await expect(page.locator('[data-occurrence="0:2:3"]')).toHaveAttribute("data-save-state", "saved");
  await page.getByRole("button", { name: "Finish reading", exact: true }).click();
  await page.getByRole("button", { name: "Reveal", exact: true }).click();
  await expect(page.getByLabel("Saved sentence context")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("revision-mobile.png"), fullPage: true });
  await page.getByRole("button", { name: "Got it", exact: true }).click();
  // A real rejected save must not be presented as a durable success.
  await page.route("**/lessons/first-characters.data", async (route) => {
    if (route.request().method() === "POST") {
      const response = await route.fetch({ postData: new URLSearchParams({ intent: "revision-passed", attempt_id: "stale-attempt", content_revision: "2" }).toString() });
      await route.fulfill({ response });
    } else await route.continue();
  });
  await page.getByRole("button", { name: "Complete lesson", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Your result has not been saved");
  expect((await state(page)).phase).toBe("revision-flashcards");
  await page.unroute("**/lessons/first-characters.data");
  await page.getByRole("button", { name: "Complete lesson", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Lesson complete", exact: true })).toBeVisible();
});

test("revisits reset only the latest attempt, resume safely, and preserve first completion and later access", async ({ page }) => {
  await register(page);
  const original = await startReader(page);
  await page.getByRole("button", { name: "Finish reading", exact: true }).click();
  await expect(milestones(page)).toHaveCount(2);
  const first = await milestones(page).first().getAttribute("datetime");
  await page.goto("/lessons");
  await lessonCard(page, "First characters").getByRole("button", { name: /^Revisit lesson/ }).click();
  await expect(page.getByRole("button", { name: "Start flashcards", exact: true })).toBeVisible();
  const fresh = await state(page);
  expect(fresh.attemptId).not.toBe(original);
  expect(fresh.revealed).toEqual([]);
  expect((await post(page.request, firstLesson, { intent: "revisit", attempt_id: original })).status()).toBe(409);
  expect((await post(page.request, firstLesson, { intent: "revisit", attempt_id: fresh.attemptId })).status()).toBe(409);
  await page.goto("/lessons");
  const card = lessonCard(page, "First characters");
  await expect(card.getByText("Completed", { exact: true })).toBeVisible();
  await expect(card.getByRole("button", { name: /^Revisit lesson/ })).toHaveCount(0);
  await expect(lessonCard(page, "People and places").getByText("Available", { exact: true })).toBeVisible();
  await card.getByRole("link", { name: /^Resume revisit/ }).click();
  expect((await state(page)).attemptId).toBe(fresh.attemptId);
  await page.getByRole("button", { name: "Start flashcards", exact: true }).click();
  for (let i = 0; i < 5; i++) await answer(page);
  await page.getByRole("button", { name: "Continue to story", exact: true }).click();
  await page.locator('[data-occurrence="0:0:1"]').click();
  await expect(page.locator('[data-occurrence="0:0:1"]')).toHaveAttribute("data-save-state", "saved");
  await page.reload();
  expect((await state(page)).attemptId).toBe(fresh.attemptId);
  await page.getByRole("button", { name: "Finish reading", exact: true }).click();
  await answer(page);
  await page.getByRole("button", { name: "Complete lesson", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Lesson complete", exact: true })).toBeVisible();
  await expect(milestones(page).first()).toHaveAttribute("datetime", first!);
  expect(Date.parse((await milestones(page).last().getAttribute("datetime"))!)).toBeGreaterThan(Date.parse(first!));
  await page.goto("/lessons");
  await lessonCard(page, "First characters").getByRole("button", { name: /^Revisit lesson/ }).click();
  await expect(page.getByRole("button", { name: "Start flashcards", exact: true })).toBeVisible();
  expect((await state(page)).revealed).toEqual([]);
});

test("all three lessons complete in order with a clean end of curriculum", async ({ page }) => {
  await register(page);
  for (const lesson of [firstLesson, ...lockedLessons]) {
    await startReader(page, lesson);
    await page.getByRole("button", { name: "Finish reading", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Lesson complete", exact: true })).toBeVisible();
  }
  await expect(page.getByRole("link", { name: "Next lesson", exact: true })).toHaveCount(0);
  await expect(page.getByText("You reached the end of the current curriculum.", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Return to lesson list", exact: true }).click();
  await expect(page.getByText("Completed", { exact: true })).toHaveCount(3);
});

test("revision and revisit writes enforce phase, identity, locks and account isolation", async ({ page, browser }) => {
  await register(page);
  const attempt = await startReader(page);
  const current = await state(page);
  const passed = { intent: "revision-passed", attempt_id: attempt, content_revision: String(current.contentRevision) };
  expect((await post(page.request, firstLesson, passed)).status()).toBe(409);
  expect((await post(page.request, firstLesson, { intent: "revisit", attempt_id: attempt })).status()).toBe(409);
  for (const intent of ["revision-passed", "revisit"]) {
    expect((await post(page.request, lockedLessons[0], { ...passed, intent })).status()).toBe(403);
  }
  const other = await browser.newContext({ baseURL: origin });
  try {
    const otherPage = await other.newPage();
    await register(otherPage);
    for (const intent of ["revision-passed", "revisit"]) {
      expect((await post(otherPage.request, firstLesson, { ...passed, intent })).status()).toBe(409);
    }
  } finally { await other.close(); }
  expect((await state(page)).phase).toBe("story");
  expect((await state(page)).attemptId).toBe(attempt);
});
