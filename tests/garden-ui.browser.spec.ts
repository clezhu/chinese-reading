import { test, expect, type Page, type TestInfo } from "@playwright/test";
import { account, firstLesson, register, startReader } from "./helpers";
import { firstRef } from "./content-helpers";

const noOverflow = async (page: Page) => expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
async function shot(page: Page, info: TestInfo, name: string) {
  await page.screenshot({ path: info.outputPath(`${name}.png`), fullPage: true });
}

test("layered home covers desktop/mobile, moves fog only and settles under reduced motion", async ({ page }, info) => {
  await page.setViewportSize({ width: 1440, height: 810 });
  await page.goto("/");
  await expect(page).toHaveTitle("Hanzi Garden");
  await expect(page.getByRole("heading", { name: "Learn to read Chinese for free!" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(810);
  const layers = page.locator(".scene-layer");
  await expect(layers).toHaveCount(5);
  const primary = page.getByRole("link", { name: "Get Started", exact: true });
  const colours = await primary.evaluate((el) => ({ foreground: getComputedStyle(el).color, background: getComputedStyle(el).backgroundColor }));
  expect(colours).toEqual({ foreground: "rgb(255, 255, 255)", background: "rgb(48, 52, 58)" });
  const motion = await page.locator(".scene-fog--back").evaluate((el) => {
    const animation = el.getAnimations()[0];
    animation.pause(); animation.currentTime = 0;
    const first = getComputedStyle(el).transform;
    animation.currentTime = 14000;
    const later = getComputedStyle(el).transform;
    return { first, later };
  });
  expect(motion.first).not.toBe(motion.later);
  await shot(page, info, "home-desktop");
  for (const viewport of [{ width: 390, height: 844 }, { width: 320, height: 568 }, { width: 780, height: 420 }]) {
    await page.setViewportSize(viewport);
    await noOverflow(page);
    const cta = page.getByRole("link", { name: "Get Started", exact: true });
    await cta.scrollIntoViewIfNeeded();
    await expect(cta).toBeInViewport();
    if (viewport.width <= 390) await expect(page.getByRole("link", { name: "Sign up", exact: true })).toBeHidden();
    if (viewport.width === 390) await shot(page, info, "home-mobile");
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(await page.locator(".scene-fog--front").evaluate((el) => el.getAnimations().length)).toBe(0);
  await page.getByRole("link", { name: "Get Started", exact: true }).click();
  await expect(page).toHaveURL(/\/register$/);
});

test("auth slots keep geometry across wrapped messages and forms scroll at short/zoom-sized viewports", async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/register");
  const username = page.getByLabel("Username", { exact: true });
  const password = page.getByLabel("Password", { exact: true });
  const submit = page.getByRole("button", { name: "Create account", exact: true });
  await expect(username).toBeEnabled();
  const positions = async () => page.locator("#username, #password, #confirmPassword, button[type=submit]").evaluateAll((els) => els.map((el) => ({ top: el.getBoundingClientRect().top, height: el.getBoundingClientRect().height })));
  const initial = await positions();
  await shot(page, info, "signup-mobile-empty");
  await username.fill("bad name"); await password.fill("a");
  expect(await positions()).toEqual(initial);
  await shot(page, info, "signup-mobile-invalid");
  await username.fill(account().username); await password.fill("Garden1!");
  await page.getByLabel("Confirm password", { exact: true }).fill("Garden1!");
  await expect(submit).toBeEnabled();
  expect(await positions()).toEqual(initial);
  await shot(page, info, "signup-mobile-valid");
  for (const viewport of [{ width: 320, height: 480 }, { width: 720, height: 405 }]) {
    await page.setViewportSize(viewport);
    await noOverflow(page);
    await submit.scrollIntoViewIfNeeded(); await expect(submit).toBeInViewport();
    await page.getByRole("link", { name: "Log in", exact: true }).scrollIntoViewIfNeeded();
    await expect(page.getByRole("link", { name: "Log in", exact: true })).toBeInViewport();
  }
  await page.setViewportSize({ width: 1440, height: 810 });
  await page.goto("/login");
  await shot(page, info, "login-desktop");
});

test("both auth forms keep compact, stable message spacing", async ({ page }) => {
  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const mode of ["login", "register"]) {
      await page.goto(`/${mode}`);
      const username = page.getByLabel("Username", { exact: true });
      await expect(username).toBeEnabled();
      const positions = () => page.locator(".auth-input, button[type=submit]").evaluateAll((els) => els.map((el) => el.getBoundingClientRect().top));
      const initial = await positions();
      const gaps = await page.locator(".auth-field").evaluateAll((fields) => fields.slice(0, -1).map((field, index) =>
        fields[index + 1].querySelector("label")!.getBoundingClientRect().top - field.querySelector("input")!.getBoundingClientRect().bottom));
      for (const gap of gaps) expect(gap).toBeLessThanOrEqual(48);
      await username.fill("bad name");
      await page.getByLabel("Password", { exact: true }).fill("a");
      if (mode === "register") {
        await page.getByLabel("Confirm password", { exact: true }).fill("b");
        await expect(page.locator("#confirmation-message")).toHaveText("Passwords do not match.");
      } else {
        await page.getByRole("button", { name: "Log in", exact: true }).click();
        await expect(page.getByRole("alert")).toHaveText("Incorrect username or password.");
      }
      expect(await positions()).toEqual(initial);
      await noOverflow(page);
    }
  }
});

test("fixed list scenery, live introduction and centered stable flashcards reflow without clipping", async ({ page }, info) => {
  await page.setViewportSize({ width: 1440, height: 810 });
  await register(page);
  await shot(page, info, "lessons-desktop");
  await page.setViewportSize({ width: 390, height: 844 });
  const scenery = async () => page.evaluate(() => {
    const s = getComputedStyle(document.body, "::before");
    return { position: s.position, top: s.top, background: s.backgroundPosition };
  });
  const initial = await scenery();
  expect(initial).toMatchObject({ position: "fixed", top: "76px" });
  expect(await page.locator(".site-header").evaluate((el) => getComputedStyle(el).backgroundColor)).toBe("rgb(255, 255, 255)");
  await shot(page, info, "lessons-mobile");
  await page.evaluate(() => window.scrollTo(0, 700));
  expect(await scenery()).toEqual(initial);
  await page.screenshot({ path: info.outputPath("lessons-mobile-scrolled.png") });
  await page.goto(firstLesson);
  await shot(page, info, "introduction-mobile");
  await page.setViewportSize({ width: 1440, height: 810 });
  await shot(page, info, "introduction-desktop");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByRole("button", { name: "Reveal", exact: true })).toBeVisible();
  const card = page.locator(".practice-card");
  const front = await card.boundingBox();
  const glyph = await page.locator(".practice-front-glyph").boundingBox();
  expect(Math.abs(glyph!.x + glyph!.width / 2 - front!.x - front!.width / 2)).toBeLessThan(1);
  expect(Math.abs(glyph!.y + glyph!.height / 2 - front!.y - front!.height / 2)).toBeLessThan(1);
  await shot(page, info, "flashcard-front-desktop");
  await page.getByRole("button", { name: "Reveal", exact: true }).click();
  expect(await card.boundingBox()).toEqual(front);
  await shot(page, info, "flashcard-revealed-desktop");
  await page.setViewportSize({ width: 320, height: 568 });
  await noOverflow(page);
  await expect(page.getByRole("button", { name: "Have not got it", exact: true })).toBeVisible();
});

test("real reader and contextual cards keep layouts stable, then save a clean completion", async ({ page }, info) => {
  await page.setViewportSize({ width: 1440, height: 810 });
  await register(page); await startReader(page);
  await shot(page, info, "reader-no-help-desktop");
  const occurrence = page.locator(`[data-occurrence="${firstRef}"]`);
  await occurrence.click();
  await expect(occurrence).toHaveAttribute("data-save-state", "saved");
  await expect(page.getByText("All reveals saved.", { exact: true })).toBeVisible();
  await shot(page, info, "reader-saved-desktop");
  await page.getByRole("button", { name: "Finish reading", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Collected revision", exact: true })).toBeVisible();
  await page.setViewportSize({ width: 320, height: 568 });
  const card = page.locator(".practice-card");
  const front = await card.boundingBox();
  await shot(page, info, "revision-front-mobile");
  await page.getByRole("button", { name: "Reveal", exact: true }).click();
  // Focus scrolling may change y; the rectangle's dimensions never change.
  const back = await card.boundingBox();
  expect(back!.height).toBe(front!.height); expect(back!.width).toBe(front!.width);
  await noOverflow(page);
  await shot(page, info, "revision-revealed-mobile");
  await page.getByRole("button", { name: "Got it", exact: true }).click();
  await page.getByRole("button", { name: "Reread story", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Read the story", exact: true })).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 810 });
  await page.getByRole("button", { name: "Finish reading", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Lesson complete", exact: true })).toBeVisible();
  await expect(page.locator(".confetti-particle")).toHaveCount(0);
  await shot(page, info, "completion-settled-desktop");
});
