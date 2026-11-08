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
  await page.keyboard.press("Tab");
  const create = page.getByRole("button", { name: "Create account", exact: true });
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
  const back = page.getByRole("link", { name: "Return to lesson list", exact: true });
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
  const start = page.getByRole("button", { name: "Start flashcards", exact: true });
  await start.focus();
  await page.keyboard.press("Enter");
  const reveal = page.getByRole("button", { name: "Reveal", exact: true });
  const got = page.getByRole("button", { name: "Got it", exact: true });
  for (let i = 0; i < 10; i++) {
    await expect(reveal).toBeFocused();
    expect((await reveal.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await page.keyboard.press("Enter");
    await expect(got).toBeFocused();
    await expectNoHorizontalOverflow(page);
    await page.keyboard.press("Enter");
  }
  const next = page.getByRole("button", { name: "Continue to story", exact: true });
  await expect(next).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Story phase", exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
