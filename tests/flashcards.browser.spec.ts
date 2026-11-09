import { expect, test, type Page } from "@playwright/test";
import { firstLesson, lessonCard, lockedLessons, login, logout, post, register } from "./helpers";
import { first } from "./content-helpers";
const firstCharacter = first.newCharacters[0];

async function start(page: Page) {
  await page.getByRole("button", { name: /^Start lesson\s*:\s*First characters$/ }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Practice round", exact: true })).toBeVisible();
}

async function answer(page: Page, got = true) {
  await page.getByRole("button", { name: "Reveal", exact: true }).click();
  await page.getByRole("button", { name: got ? "Got it" : "Have not got it", exact: true }).click();
}

async function round(page: Page, size = first.newCharacters.length) {
  for (let i = 0; i < size; i++) await answer(page);
}

async function attemptId(page: Page) {
  return page.evaluate(() => {
    const key = Object.keys(localStorage).find((key) => key.startsWith("chinese-reading:flashcards:"));
    if (!key) throw new Error("No saved flashcard attempt");
    return key.split(":").at(-2)!;
  });
}

test("real introduction → practice/retries → full confirmation → persisted story, with local resume", async ({ page }) => {
  const credentials = await register(page);
  await start(page);
  await expect(page.getByRole("button", { name: "Got it", exact: true })).toHaveCount(0);
  await expect(page.getByRole("list", { name: `Readings for ${firstCharacter.hanzi}`, exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Reveal", exact: true }).click();
  await expect(page.getByRole("list", { name: `Readings for ${firstCharacter.hanzi}`, exact: true }).getByRole("listitem")).toHaveText([...firstCharacter.pinyin]);
  await page.getByRole("button", { name: "Have not got it", exact: true }).click();
  await round(page, 4);
  await expect(page.getByText("Card 1 of 1 · 0 missed this round", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText("Card 1 of 1 · 0 missed this round", { exact: true })).toBeVisible();
  await answer(page, false);
  await expect(page.getByRole("heading", { name: "Practice round", exact: true })).toBeVisible();
  await expect(page.getByText("Card 1 of 1 · 0 missed this round", { exact: true })).toBeVisible();
  await answer(page);
  await expect(page.getByRole("heading", { name: "Full-deck confirmation", exact: true })).toBeVisible();
  await answer(page, false);
  await page.getByRole("link", { name: "Back to lessons", exact: true }).click();
  await logout(page);
  await login(page, credentials);
  await page.getByRole("link", { name: /^Resume lesson\s*:\s*First characters$/ }).click();
  await expect(page.getByText("Card 2 of 5 · 1 missed this round", { exact: true })).toBeVisible();
  await round(page, 4);
  await expect(page.getByRole("heading", { name: "Practice round", exact: true })).toBeVisible();
  await answer(page);
  await expect(page.getByRole("heading", { name: "Full-deck confirmation", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue to story", exact: true })).toHaveCount(0);
  await round(page);
  await expect(page.getByRole("heading", { name: "Deck recognised", exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Continue to story", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Read the story", exact: true })).toBeVisible();
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.getByRole("heading", { name: "Read the story", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Back to lessons", exact: true }).click();
  await expect(lessonCard(page, "First characters").getByText("In progress", { exact: true })).toBeVisible();
  await expect(lessonCard(page, "People and places").getByText("Locked", { exact: true })).toBeVisible();
});

test("a clean initial full-deck round completes without confirmation", async ({ page }) => {
  await register(page);
  await start(page);
  await round(page, 4);
  await expect(page.getByRole("heading", { name: "Practice round", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue to story", exact: true })).toHaveCount(0);
  await answer(page);
  await expect(page.getByRole("heading", { name: "Deck recognised", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Continue to story", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Read the story", exact: true })).toBeVisible();
});

test("a clean full-deck practice round completes after every card was missed", async ({ page }) => {
  await register(page);
  await start(page);
  for (let i = 0; i < 5; i++) await answer(page, false);
  await expect(page.getByRole("heading", { name: "Practice round", exact: true })).toBeVisible();
  await expect(page.getByText("Card 1 of 5 · 0 missed this round", { exact: true })).toBeVisible();
  await round(page);
  await expect(page.getByRole("heading", { name: "Deck recognised", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Continue to story", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Read the story", exact: true })).toBeVisible();
});

test("lost or malformed local state restarts the current deck; another device keeps the D1 phase", async ({ page, browser }) => {
  const credentials = await register(page);
  await start(page);
  await answer(page, false);
  await round(page, 4);
  await answer(page);
  await expect(page.getByRole("heading", { name: "Full-deck confirmation", exact: true })).toBeVisible();
  const other = await browser.newContext();
  try {
    const otherPage = await other.newPage();
    await login(otherPage, credentials);
    await otherPage.goto(firstLesson);
    await expect(otherPage.getByRole("heading", { name: "Practice round", exact: true })).toBeVisible();
    await expect(otherPage.getByRole("button", { name: "Continue", exact: true })).toHaveCount(0);
  } finally { await other.close(); }
  for (const value of ["{broken json", JSON.stringify({ stage: "complete" }), null]) {
    await page.evaluate((saved) => {
      const key = Object.keys(localStorage).find((key) => key.startsWith("chinese-reading:flashcards:"))!;
      if (saved === null) localStorage.removeItem(key);
      else localStorage.setItem(key, saved);
    }, value);
    await page.reload();
    await expect(page.getByRole("heading", { name: "Practice round", exact: true })).toBeVisible();
    await expect(page.getByText("Card 1 of 5 · 0 missed this round", { exact: true })).toBeVisible();
    await answer(page);
  }
});

test("unavailable localStorage does not block practice or phase saving", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error("storage blocked"); };
    Storage.prototype.setItem = () => { throw new Error("storage blocked"); };
  });
  await register(page);
  // Direct URL introductions have no progress row until Continue.
  await page.goto(firstLesson);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByText(/Browser storage is unavailable/)).toHaveCount(0);
  await round(page, 4);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Practice round", exact: true })).toBeVisible();
  await expect(page.getByText("Card 1 of 5 · 0 missed this round", { exact: true })).toBeVisible();
  await round(page);
  await expect(page.getByRole("heading", { name: "Deck recognised", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Continue to story", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Read the story", exact: true })).toBeVisible();
});

test("phase writes reject wrong attempts, wrong phases, another owner and locked lessons", async ({ page, browser }) => {
  await register(page);
  expect((await post(page.request, firstLesson, { intent: "deck-passed", attempt_id: "invented" })).status()).toBe(409);
  await start(page);
  const id = await attemptId(page);
  expect((await post(page.request, firstLesson, { intent: "deck-passed", attempt_id: "stale" })).status()).toBe(409);
  expect((await post(page.request, firstLesson, "intent=deck-passed&attempt_id=a&attempt_id=b")).status()).toBe(400);
  const bob = await browser.newContext();
  try {
    const bobPage = await bob.newPage();
    await register(bobPage);
    expect((await post(bobPage.request, firstLesson, { intent: "deck-passed", attempt_id: id })).status()).toBe(409);
    await bobPage.reload();
    await expect(lessonCard(bobPage, "First characters").getByText("Available", { exact: true })).toBeVisible();
  } finally { await bob.close(); }
  for (const path of lockedLessons) {
    expect((await post(page.request, path, { intent: "deck-passed", attempt_id: id })).status()).toBe(403);
  }
  // Deliberately trusted browser claim, but only flashcards → story is allowed.
  expect((await post(page.request, firstLesson, { intent: "deck-passed", attempt_id: id, phase: "complete", user_id: "other" })).status()).toBe(303);
  expect((await post(page.request, firstLesson, { intent: "deck-passed", attempt_id: id })).status()).toBe(409);
  expect((await post(page.request, firstLesson, { intent: "start-flashcards", attempt_id: id })).status()).toBe(409);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Read the story", exact: true })).toBeVisible();
});

test("a failed phase save is visible and can be retried without repeating the deck", async ({ page }) => {
  await register(page);
  await start(page);
  await round(page);
  await expect(page.getByRole("heading", { name: "Deck recognised", exact: true })).toBeVisible();
  await page.route("**/lessons/first-characters*", async (route) => {
    if (route.request().method() === "POST") {
      // Exercise the real action's conflict response, rather than manufacturing UI data.
      const form = new URLSearchParams(route.request().postData()!);
      form.set("attempt_id", "stale");
      await route.continue({ postData: form.toString() });
    } else await route.continue();
  });
  await page.getByRole("button", { name: "Continue to story", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Your result has not been saved");
  await expect(page.getByRole("heading", { name: "Deck recognised", exact: true })).toBeVisible();
  await page.unroute("**/lessons/first-characters*");
  await page.getByRole("button", { name: "Continue to story", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Read the story", exact: true })).toBeVisible();
});
