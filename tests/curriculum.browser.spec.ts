import { test, expect } from "@playwright/test";
import { curriculum } from "../app/content/curriculum";
import { account, firstLesson, lessonCard, laterLessons, login, logout, post, register } from "./helpers";
import { first, firstTitle, lessons, nextTitle } from "./content-helpers";

test("modules/lessons render in authored order with every lesson available", async ({ page }) => {
  await register(page);
  await expect(page.getByRole("heading", { name: "Lessons", exact: true })).toBeVisible();
  await expect(page.getByRole("main").getByRole("heading", { level: 2 })).toHaveText(curriculum.modules.map((module, index) => `Module ${index + 1}: ${module.title}`));
  await expect(page.getByRole("main").locator("h2, h3")).toHaveText(curriculum.modules.flatMap((module, index) => [`Module ${index + 1}: ${module.title}`, ...module.lessons.map((lesson) => lesson.title)]));
  await expect(page.getByText("Available", { exact: true })).toHaveCount(0);
  await expect(page.getByText("More lessons coming soon", { exact: true })).toBeVisible();
  const firstCard = lessonCard(page, firstTitle);
  await expect(firstCard.getByRole("button", { name: /^Start lesson\s*:/ })).toBeAttached();
  await expect(firstCard.getByText("Start here", { exact: true })).toBeVisible();
  await expect(page.getByText("Start here", { exact: true })).toHaveCount(1);
  await expect(page.getByText("Continue here", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^Start lesson\s*:/ })).toHaveCount(lessons.length);
  await expect(firstCard.getByRole("link")).toHaveCount(0);
  for (const character of first.newCharacters) await expect(firstCard.getByText(character.hanzi, { exact: true })).toBeVisible();
  for (const lesson of lessons.slice(1)) {
    const card = lessonCard(page, lesson.title);
    await expect(card.getByRole("button", { name: /^Start lesson\s*:/ })).toBeVisible();
    await expect(card.getByRole("link")).toHaveCount(0);
    await expect(card.getByRole("button", { name: /^Start lesson/ })).toBeVisible();
  }
  await expect(page.getByRole("heading", { level: 3 })).toHaveCount(lessons.length);
  await expect(page.getByText("Revision", { exact: true })).toHaveCount(lessons.filter((lesson) => lesson.kind === "revision").length);
});

test("starting first learning lesson groups every authored character/reading without completing it", async ({ page }) => {
  await register(page);
  await lessonCard(page, firstTitle).getByRole("button", { name: /^Start lesson/ }).click();
  await expect(page).toHaveURL(firstLesson);
  await expect(page.getByRole("heading", { name: "Meet your new characters", exact: true })).toBeVisible();
  const characters = page.getByRole("list", { name: "New characters", exact: true });
  await expect(characters.locator(":scope > li")).toHaveCount(first.newCharacters.length);
  for (const character of first.newCharacters) {
    await expect(characters.getByText(character.hanzi, { exact: true })).toBeVisible();
    await expect(characters.getByRole("list", { name: `Readings for ${character.hanzi}`, exact: true }).getByRole("listitem")).toHaveText([...character.pinyin]);
  }
  await expect(page.getByRole("button", { name: "Continue", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /complete|finish/i })).toHaveCount(0);
  await page.goto("/lessons");
  await page.reload();
  const activeCard = lessonCard(page, firstTitle);
  await expect(activeCard.getByText("In progress", { exact: true })).toBeAttached();
  await expect(activeCard.getByText("Start here", { exact: true })).toBeVisible();
  await expect(page.getByText("Continue here", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Start here", { exact: true })).toHaveCount(1);
  await expect(activeCard.getByRole("link", { name: /^Resume lesson/ })).toBeVisible();
  await expect(activeCard.getByRole("button")).toHaveCount(0);
  await expect(lessonCard(page, nextTitle).getByRole("button", { name: /^Start lesson\s*:/ })).toBeVisible();
});

test("later lessons accept direct access and starts but reject forged completion claims", async ({ page }) => {
  await register(page);
  for (const path of [...laterLessons].reverse()) {
    expect((await page.goto(path))?.status()).toBe(200);
    expect((await post(page.request, path, { intent: "complete", phase: "completed", first_completed_at: "1", last_completed_at: "1" })).status()).toBe(400);
    expect((await post(page.request, path, { intent: "start", completed: "true", user_id: "somebody-else" })).status()).toBe(303);
  }
  await page.goto("/lessons");
  await expect(lessonCard(page, firstTitle).getByText("Start here", { exact: true })).toBeVisible();
  await expect(page.getByText("Start here", { exact: true })).toHaveCount(1);
  await expect(page.getByText("Continue here", { exact: true })).toHaveCount(0);
  const unsupported: (Record<string, string> | string)[] = [{ intent: "complete" }, { intent: "finish" }, { phase: "completed" }, "intent=start&intent=complete", "intent=start&intent=start"];
  for (const form of unsupported) expect((await post(page.request, firstLesson, form)).status()).toBe(400);
  expect((await post(page.request, firstLesson, { intent: "start", phase: "completed", completed: "true", first_completed_at: "1", last_completed_at: "1" })).status()).toBe(303);
  await page.reload();
  await expect(lessonCard(page, firstTitle).getByText("In progress", { exact: true })).toBeVisible();
  for (const lesson of lessons.slice(1)) await expect(lessonCard(page, lesson.title).getByText("In progress", { exact: true })).toBeVisible();
  expect((await page.request.get("/lessons/does-not-exist")).status()).toBe(404);
});

test("saved introductions survive return and stay isolated between two accounts", async ({ page, browser }) => {
  const alice = await register(page);
  const bobContext = await browser.newContext();
  const bobPage = await bobContext.newPage();
  const bob = account();
  try {
    await register(bobPage, bob);
    expect((await post(page.request, firstLesson, { intent: "start", username: bob.username, userId: bob.username, user_id: bob.username })).status()).toBe(303);
    await page.reload();
    await expect(lessonCard(page, firstTitle).getByText("In progress", { exact: true })).toBeVisible();
    await bobPage.reload();
    await expect(lessonCard(bobPage, firstTitle).getByRole("button", { name: /^Start lesson\s*:/ })).toBeVisible();
    await expect(bobPage.getByRole("link", { name: /^Resume lesson/ })).toHaveCount(0);
    await logout(page);
    await login(page, bob);
    await expect(lessonCard(page, firstTitle).getByRole("button", { name: /^Start lesson\s*:/ })).toBeVisible();
    await logout(page);
    await login(page, alice);
    await lessonCard(page, firstTitle).getByRole("link", { name: /^Resume lesson/ }).click();
    await expect(page).toHaveURL(firstLesson);
    await page.reload();
    await expect(page.getByRole("list", { name: "New characters", exact: true })).toBeVisible();
  } finally { await bobContext.close(); }
});
