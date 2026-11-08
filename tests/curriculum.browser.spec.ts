import { test, expect } from "@playwright/test";
import { account, firstLesson, lessonCard, lockedLessons, login, logout, post, register } from "./helpers";

test("modules and lessons render in authored order, with only the first lesson available", async ({ page }) => {
  await register(page);
  await expect(page.getByRole("main").getByRole("heading", { level: 2 })).toHaveText(["Foundations", "Building connections"]);
  await expect(page.getByRole("main").locator("h2, h3")).toHaveText([
    "Foundations", "First characters", "People and places", "Building connections", "Everyday connections",
  ]);
  await expect(lessonCard(page, "First characters").getByText("Available", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /^Start lesson\s*:/ })).toHaveCount(1);
  for (const title of ["People and places", "Everyday connections"]) {
    const card = lessonCard(page, title);
    await expect(card.getByText("Locked", { exact: true })).toBeVisible();
    await expect(card.getByText("Complete the previous lesson to unlock.", { exact: true })).toBeVisible();
    await expect(card.getByRole("link")).toHaveCount(0);
    await expect(card.getByRole("button")).toHaveCount(0);
  }
  // The revision fixture must not become an extra published lesson.
  await expect(page.getByRole("heading", { level: 3 })).toHaveCount(3);
  await expect(page.getByText("Revision", { exact: true })).toHaveCount(0);
});

test("starting the first lesson groups all five characters and every authored reading, without completing it", async ({ page }) => {
  await register(page);
  await page.getByRole("button", { name: /^Start lesson\s*:\s*First characters$/ }).click();
  await expect(page).toHaveURL(firstLesson);
  await expect(page.getByRole("heading", { name: "First characters", exact: true })).toBeVisible();
  const characters = page.getByRole("list", { name: "New characters", exact: true });
  await expect(characters.locator(":scope > li")).toHaveCount(5);
  for (const [hanzi, readings] of [
    ["的", ["de", "dī", "dí", "dì"]], ["一", ["yī"]], ["是", ["shì"]],
    ["不", ["bù"]], ["了", ["le", "liǎo"]],
  ] as const) {
    await expect(characters.getByText(hanzi, { exact: true })).toBeVisible();
    await expect(characters.getByRole("list", { name: `Readings for ${hanzi}`, exact: true }).getByRole("listitem")).toHaveText([...readings]);
  }
  await expect(page.getByRole("button", { name: "Start flashcards", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /complete|finish/i })).toHaveCount(0);
  await page.getByRole("link", { name: "Return to lesson list", exact: true }).click();
  await expect(page).toHaveURL(/\/lessons$/);
  await page.reload();
  await expect(lessonCard(page, "First characters").getByText("In progress", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /^Resume lesson\s*:\s*First characters$/ })).toBeVisible();
  await expect(lessonCard(page, "People and places").getByText("Locked", { exact: true })).toBeVisible();
});

test("locked GETs and POSTs are rejected server-side, including forged completion claims", async ({ page }) => {
  await register(page);
  const lockedForms: Record<string, string>[] = [
    { intent: "start" },
    { intent: "complete", phase: "completed", first_completed_at: "1", last_completed_at: "1" },
    { intent: "start", completed: "true", phase: "completed", user_id: "somebody-else" },
  ];
  for (const path of lockedLessons) {
    await test.step(path, async () => {
      const navigation = await page.goto(path);
      expect(navigation?.status()).toBe(403);
      await expect(page.getByRole("list", { name: "New characters", exact: true })).toHaveCount(0);
      for (const form of lockedForms) {
        expect((await post(page.request, path, form)).status()).toBe(403);
      }
    });
  }
  await page.goto("/lessons");
  await expect(lessonCard(page, "First characters").getByText("Available", { exact: true })).toBeVisible();
  const completionClaims: (Record<string, string> | string)[] = [
    { intent: "complete" }, { intent: "finish" }, { phase: "completed" },
    "intent=start&intent=complete", "intent=start&intent=start",
  ];
  for (const form of completionClaims) {
    expect((await post(page.request, firstLesson, form)).status()).toBe(400);
  }
  // Even a supported start action cannot smuggle completion state into D1.
  const forged = await post(page.request, firstLesson, {
    intent: "start", phase: "completed", completed: "true", first_completed_at: "1", last_completed_at: "1",
  });
  expect(forged.status()).toBe(303);
  await page.reload();
  await expect(lessonCard(page, "First characters").getByText("In progress", { exact: true })).toBeVisible();
  for (const title of ["People and places", "Everyday connections"]) {
    await expect(lessonCard(page, title).getByText("Locked", { exact: true })).toBeVisible();
  }
  for (const path of lockedLessons) {
    expect((await page.request.get(path)).status()).toBe(403);
  }
  expect((await page.request.get("/lessons/does-not-exist")).status()).toBe(404);
});

test("saved introductions survive return and remain isolated between two accounts", async ({ page, browser }) => {
  const alice = await register(page);
  const bobContext = await browser.newContext();
  const bobPage = await bobContext.newPage();
  const bob = account();
  try {
    await register(bobPage, bob);
    // Try to redirect Alice's write to Bob using client-supplied identity.
    expect((await post(page.request, firstLesson, {
      intent: "start", username: bob.username, userId: bob.username, user_id: bob.username,
    })).status()).toBe(303);
    await page.reload();
    await expect(lessonCard(page, "First characters").getByText("In progress", { exact: true })).toBeVisible();
    await bobPage.reload();
    await expect(bobPage.getByText(bob.username, { exact: true })).toBeVisible();
    await expect(lessonCard(bobPage, "First characters").getByText("Available", { exact: true })).toBeVisible();
    await expect(bobPage.getByRole("link", { name: /^Resume lesson\s*:/ })).toHaveCount(0);

    await logout(page);
    await login(page, bob);
    await expect(lessonCard(page, "First characters").getByText("Available", { exact: true })).toBeVisible();
    await logout(page);
    await login(page, alice);
    await expect(lessonCard(page, "First characters").getByText("In progress", { exact: true })).toBeVisible();
    await page.getByRole("link", { name: /^Resume lesson\s*:\s*First characters$/ }).click();
    await expect(page).toHaveURL(firstLesson);
    await page.reload();
    await expect(page.getByRole("list", { name: "New characters", exact: true })).toBeVisible();
    await page.getByRole("link", { name: "Return to lesson list", exact: true }).click();
    await expect(lessonCard(page, "People and places").getByText("Locked", { exact: true })).toBeVisible();
  } finally {
    await bobContext.close();
  }
});
