import { test, expect, type Page } from "@playwright/test";
import { account, firstLesson } from "./helpers";

async function expectNoHorizontalOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}

test("mobile form, lesson controls and introduction remain usable with keyboard navigation", async ({ page }) => {
  const credentials = account();
  await page.goto("/register");
  await expectNoHorizontalOverflow(page);
  const username = page.getByLabel("Username", { exact: true });
  const password = page.getByLabel("Password", { exact: true });
  await username.focus();
  await expect(username).toBeFocused();
  await page.keyboard.type(credentials.username);
  await page.keyboard.press("Tab");
  await expect(password).toBeFocused();
  await page.keyboard.type(credentials.password);
  const create = page.getByRole("button", { name: "Create account", exact: true });
  // Availability is debounced: wait for the current username before tabbing
  // to a submit button which is intentionally disabled while checking.
  await expect(create).toBeEnabled();
  await page.keyboard.press("Tab");
  await expect(create).toBeFocused();
  expect((await create.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/lessons$/);
  await expectNoHorizontalOverflow(page);

  const logout = page.getByRole("button", { name: "Log out", exact: true });
  await logout.focus();
  await page.keyboard.press("Tab");
  const start = page.getByRole("button", { name: /^Start lesson\s*:\s*First characters$/ });
  await expect(start).toBeFocused();
  expect((await start.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  // A visible focus indicator, not merely programmatic focus.
  expect(await start.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe("none");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(firstLesson);
  await expectNoHorizontalOverflow(page);
  const characters = page.getByRole("list", { name: "New characters", exact: true });
  await expect(characters.locator(":scope > li")).toHaveCount(5);
  for (const readings of await characters.getByRole("list").all()) {
    await readings.scrollIntoViewIfNeeded();
    await expect(readings).toBeInViewport();
    const box = (await readings.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  }
  const back = page.getByRole("link", { name: "Back to lessons", exact: true });
  await back.focus();
  await expect(back).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/lessons$/);
  await logout.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/login$/);
  await expectNoHorizontalOverflow(page);
});

test("flashcards work with keyboard controls and fit the mobile viewport", async ({ page }) => {
  const credentials = account();
  await page.goto("/register");
  await page.getByLabel("Username", { exact: true }).fill(credentials.username);
  await page.getByLabel("Password", { exact: true }).fill(credentials.password);
  await page.getByRole("button", { name: "Create account", exact: true }).click();
  await expect(page).toHaveURL(/\/lessons$/);
  await page.goto(firstLesson);
  const start = page.getByRole("button", { name: "Continue", exact: true });
  await start.focus();
  await page.keyboard.press("Enter");
  const reveal = page.getByRole("button", { name: "Reveal", exact: true });
  const got = page.getByRole("button", { name: "Got it", exact: true });
  const missed = page.getByRole("button", { name: "Have not got it", exact: true });
  // Miss one card, clear its retry, then complete a clean full-deck confirmation.
  for (let i = 0; i < 11; i++) {
    if (i === 5) {
      await expect(page.getByRole("heading", { name: "Practice round", exact: true })).toBeVisible();
      await expect(page.getByText("Card 1 of 1 · 0 missed this round", { exact: true })).toBeVisible();
    }
    if (i === 6) {
      await expect(page.getByRole("heading", { name: "Full-deck confirmation", exact: true })).toBeVisible();
      await expect(page.getByText("Card 1 of 5 · 0 missed this round", { exact: true })).toBeVisible();
    }
    await expect(reveal).toBeFocused();
    expect((await reveal.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await page.keyboard.press("Enter");
    await expect(got).toBeFocused();
    await expectNoHorizontalOverflow(page);
    if (i === 0) {
      await page.keyboard.press("Tab");
      await expect(missed).toBeFocused();
      expect((await missed.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
    await page.keyboard.press("Enter");
  }
  await expect(page.getByRole("heading", { name: "Deck recognised", exact: true })).toBeVisible();
  const next = page.getByRole("button", { name: "Continue to story", exact: true });
  await expect(next).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Read the story", exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
