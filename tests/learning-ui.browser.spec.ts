import { expect, test, type Page } from "@playwright/test";
import { account, post } from "./helpers";
import { first, firstRef, lessonPath, lessons } from "./content-helpers";
import { revisionCards, type StoryState } from "../app/lib/story";

const path = lessonPath(first);
const resource = `${path}/reader`;
const sound = (page: Page) => page.getByRole("button", { name: "Sound", exact: true });
const finish = (page: Page) => page.getByRole("button", { name: "Finish reading", exact: true });
const flashcardCopy = "Look at the character, think in your head what you think it is. Then click reveal. Click 'Got it' if you got it right!";

// Use the public account/start actions: this suite owns learning UI, not the
// changing signup/list presentation. No D1 seeds or invented curriculum.
async function setup(page: Page) {
  const credentials = { ...account(), password: "Garden1!" };
  expect((await post(page.request, "/register", { ...credentials, confirmPassword: credentials.password })).status()).toBe(303);
  expect((await post(page.request, path, { intent: "start" })).status()).toBe(303);
  await page.goto(path);
  return credentials;
}
async function saved(page: Page, lesson = path): Promise<StoryState> {
  return (await (await page.request.get(`${lesson}/reader`)).json()).state;
}
async function answer(page: Page, got = true) {
  await page.getByRole("button", { name: "Reveal", exact: true }).click();
  await page.getByRole("button", { name: got ? "Got it" : "Have not got it", exact: true }).click();
}
async function startStory(page: Page) {
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  for (const _ of first.newCharacters) await answer(page);
  await page.getByRole("button", { name: "Continue to story", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Read the story", exact: true })).toBeVisible();
}

// Deterministic audio scheduling evidence, not a claim about speaker quality.
// Records actual oscillator scheduling while never making test-runner sounds.
async function instrument(page: Page, audio: "normal" | "missing" | "blocked" = "normal") {
  await page.addInitScript((mode) => {
    const evidence = { contexts: 0, resumes: 0, frequencies: [] as number[], particles: 0 };
    Object.assign(window, { learningEffects: evidence });
    if (mode === "missing") {
      Object.defineProperty(window, "AudioContext", { value: undefined });
      Object.defineProperty(window, "webkitAudioContext", { value: undefined });
    } else {
      class QuietAudio {
        state = "suspended";
        currentTime = 0;
        destination = {};
        constructor() { evidence.contexts++; }
        resume() {
          evidence.resumes++;
          if (mode === "blocked") return Promise.reject(new Error("Gesture blocked"));
          this.state = "running";
          return Promise.resolve();
        }
        close() { this.state = "closed"; return Promise.resolve(); }
        createOscillator() {
          let frequency = 0;
          return { type: "sine", frequency: { setValueAtTime(value: number) { frequency = value; } },
            connect() {}, disconnect() {}, start() { evidence.frequencies.push(frequency); }, stop() {}, onended: null };
        }
        createGain() {
          return { gain: { setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {}, disconnect() {} };
        }
      }
      Object.defineProperty(window, "AudioContext", { value: QuietAudio });
    }
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (...args) {
      if (this.classList.contains("confetti-particle")) evidence.particles++;
      return animate.apply(this, args);
    };
  }, audio);
}
const evidence = (page: Page) => page.evaluate(() => (window as unknown as { learningEffects: { contexts: number; resumes: number; frequencies: number[]; particles: number } }).learningEffects);
async function completeChimes(page: Page) { return (await evidence(page)).frequencies.filter((value) => value === 523.25).length; }

// Capture particles even if short-lived, so retries/revalidation cannot hide a replay.
test("exact intro/shell copy, stable Sound semantics and remembered mute without autoplay", async ({ page }) => {
  await instrument(page);
  await setup(page);
  await expect(page.getByRole("heading", { name: "Meet your new characters", exact: true })).toBeVisible();
  await expect(page.locator(".intro-copy")).toHaveText("Look at these characters and their pinyin. Some characters have more than one pronunciation. Try to remember them—but it is OK if you cannot yet.");
  await expect(page.locator(".lesson-title")).toHaveText(`Lesson 1 · ${first.newCharacters.map((c) => c.hanzi).join(" ")}`);
  for (const card of first.newCharacters) await expect(page.getByRole("list", { name: `Readings for ${card.hanzi}`, exact: true }).getByRole("listitem")).toHaveText([...card.pinyin]);
  await expect(sound(page)).toHaveAttribute("aria-pressed", "true");
  await expect(sound(page)).toHaveAttribute("title", "Mute sound");
  const box = await sound(page).boundingBox();
  expect(box?.width).toBe(44);
  expect(box?.height).toBe(44);
  expect((await evidence(page)).contexts).toBe(0);
  await sound(page).click();
  await expect(sound(page)).toHaveAttribute("aria-pressed", "false");
  await expect(sound(page)).toHaveAttribute("title", "Unmute sound");
  await page.reload();
  await expect(sound(page)).toHaveAttribute("aria-pressed", "false");
  expect((await evidence(page)).contexts).toBe(0);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.locator(".flashcard-instructions")).toHaveText(flashcardCopy);
  await expect(page.locator(".practice-card")).toHaveClass(/is-front/);
  await answer(page, false);
  expect((await evidence(page)).frequencies).toEqual([]);
  await expect(page.getByText(/browser only|Browser storage is unavailable|only missed cards repeat/)).toHaveCount(0);
  await sound(page).click();
  await answer(page);
  await expect.poll(async () => (await evidence(page)).frequencies.length).toBe(3); // reveal + two warm Got it notes
});

test("all effects are gentle gesture-triggered events; successful Finish celebrates once, including revisit", async ({ page }, testInfo) => {
  await instrument(page);
  await setup(page);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await answer(page, false);
  expect((await evidence(page)).frequencies).toEqual([660, 440]);
  for (let i = 1; i < first.newCharacters.length; i++) await answer(page);
  await answer(page); // only the missed card
  await expect(page.getByRole("heading", { name: "Full-deck confirmation", exact: true })).toBeVisible();
  await expect(page.locator(".flashcard-instructions")).toHaveText(flashcardCopy);
  for (const _ of first.newCharacters) await answer(page);
  await expect(page.getByText("Ready for the story.", { exact: true })).toBeVisible();
  expect(await completeChimes(page)).toBe(0); // Deck recognition is not completion.
  await page.getByRole("button", { name: "Continue to story", exact: true }).click();
  await expect(page.locator(".reader-instructions")).toHaveText("Try reading your new characters inside this passage without help. If you need help, click on a character to show its pinyin. Double underlined characters are unseen characters and have pinyin on by default - you do not need to know them yet.");
  await expect(page.locator(".reader-save-status")).toBeEmpty();
  const before = await saved(page);
  await finish(page).click();
  await expect(page.getByRole("heading", { name: "Lesson complete", exact: true })).toBeFocused();
  await expect.poll(() => completeChimes(page)).toBe(1);
  await expect.poll(async () => (await evidence(page)).particles).toBe(16);
  await expect(page.getByRole("link", { name: "Next lesson", exact: true })).toBeEnabled();
  await expect(page.locator(".completion-actions").getByRole("link", { name: "Back to lessons", exact: true })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("completion.png"), fullPage: true });
  await expect(page.locator(".confetti-particle")).toHaveCount(0);
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  expect(await completeChimes(page)).toBe(1);
  expect((await evidence(page)).particles).toBe(16);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Lesson complete", exact: true })).toBeVisible();
  expect(await completeChimes(page)).toBe(0);
  expect((await evidence(page)).particles).toBe(0);
  expect((await evidence(page)).contexts).toBe(0);
  expect((await post(page.request, path, { intent: "revisit", attempt_id: before.attemptId })).status()).toBe(303);
  await page.goto(path);
  await startStory(page);
  await finish(page).click();
  await expect(page.getByRole("heading", { name: "Lesson complete", exact: true })).toBeVisible();
  await expect.poll(() => completeChimes(page)).toBe(1);
  await expect.poll(async () => (await evidence(page)).particles).toBe(16);
  // Preference survives moving to another lesson, not just reloads.
  await sound(page).click();
  await page.getByRole("link", { name: "Next lesson", exact: true }).click();
  await expect(sound(page)).toHaveAttribute("aria-pressed", "false");
});

test("no completion effect before an authoritative Finish retry succeeds", async ({ page }) => {
  await instrument(page);
  await setup(page);
  await startStory(page);
  let attempts = 0;
  let release!: () => void;
  const held = new Promise<void>((resolve) => { release = resolve; });
  await page.route(`**${resource}`, async (route) => {
    if (new URLSearchParams(route.request().postData() ?? "").get("intent") !== "finish-reading") return route.continue();
    attempts++;
    if (attempts === 1) return route.fulfill({ status: 503, json: { error: "Temporarily unavailable" } });
    await held;
    await route.continue();
  });
  try {
    await finish(page).click();
    await expect.poll(() => attempts).toBe(2);
    await expect(finish(page)).toBeDisabled();
    await expect(page.getByRole("heading", { name: "Lesson complete", exact: true })).toHaveCount(0);
    expect(await completeChimes(page)).toBe(0);
    expect((await evidence(page)).particles).toBe(0);
  } finally { release(); }
  await expect(page.getByRole("heading", { name: "Lesson complete", exact: true })).toBeVisible();
  await expect.poll(() => completeChimes(page)).toBe(1);
  await expect.poll(async () => (await evidence(page)).particles).toBe(16);
});

test("remote completion observed by focus refresh is settled and silent", async ({ page }) => {
  await instrument(page);
  await setup(page);
  await startStory(page);
  const current = await saved(page);
  expect((await post(page.request, resource, { intent: "finish-reading", attempt_id: current.attemptId, content_revision: String(current.contentRevision) })).status()).toBe(200);
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(page.getByRole("heading", { name: "Lesson complete", exact: true })).toBeVisible();
  expect(await completeChimes(page)).toBe(0);
  expect((await evidence(page)).particles).toBe(0);
});

test("saved taught help goes to frozen revision, never celebration; reread rotates identity", async ({ page }) => {
  await instrument(page);
  await setup(page);
  await startStory(page);
  const original = await saved(page);
  const target = page.locator(`[data-occurrence="${firstRef}"]`);
  await target.click();
  await expect(target).toHaveAttribute("data-save-state", "saved");
  await expect(page.getByText("All reveals saved.", { exact: true })).toBeVisible();
  await finish(page).click();
  await expect(page.getByRole("heading", { name: "Collected revision", exact: true })).toBeVisible();
  expect(await completeChimes(page)).toBe(0);
  expect((await evidence(page)).particles).toBe(0);
  await expect(page.locator(".practice-card")).toHaveClass(/practice-card--context/);
  await expect(page.getByLabel("Saved sentence context")).toHaveCount(0);
  const frozen = await saved(page);
  const card = revisionCards(first, frozen.revealed)[0];
  await page.getByRole("button", { name: "Reveal", exact: true }).click();
  await expect(page.getByRole("list", { name: `Readings for ${card.character.hanzi}`, exact: true }).getByRole("listitem")).toHaveText([...card.character.pinyin]);
  await expect(page.getByLabel("Saved sentence context")).toBeVisible();
  for (const token of card.sentence) if (typeof token !== "string") {
    const pinyin = page.locator(`[data-context-occurrence="${token.ref}"] .reader-pinyin`);
    if (token.showPinyin) await expect(pinyin).toBeVisible(); else await expect(pinyin).toBeHidden();
  }
  await page.getByRole("button", { name: "Got it", exact: true }).click();
  await page.getByRole("button", { name: "Reread story", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Read the story", exact: true })).toBeVisible();
  const fresh = await saved(page);
  expect(fresh.attemptId).not.toBe(original.attemptId);
  expect(fresh).toMatchObject({ phase: "story", revealed: [], version: 0 });
  expect(await completeChimes(page)).toBe(0);
});

test("reduced motion skips particles but does not independently mute completion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await instrument(page);
  await setup(page);
  await startStory(page);
  await finish(page).click();
  await expect(page.getByRole("heading", { name: "Lesson complete", exact: true })).toBeVisible();
  await expect.poll(() => completeChimes(page)).toBe(1);
  expect((await evidence(page)).particles).toBe(0);
  await expect(page.locator(".confetti-particle")).toHaveCount(0);
});

for (const mode of ["missing", "blocked"] as const) test(`optional storage and ${mode} audio never block learning or Finish`, async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await instrument(page, mode);
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", { get() { throw new Error("Storage unavailable"); } });
  });
  await setup(page);
  await sound(page).click();
  await sound(page).click();
  await startStory(page);
  await finish(page).click();
  await expect(page.getByRole("heading", { name: "Lesson complete", exact: true })).toBeVisible();
  expect(await completeChimes(page)).toBe(0);
  expect(errors).toEqual([]);
});

test("muting keeps every effect silent, including completion, without muting its visual feedback", async ({ page }) => {
  await instrument(page);
  await setup(page);
  await sound(page).click();
  await startStory(page);
  await finish(page).click();
  await expect(page.getByRole("heading", { name: "Lesson complete", exact: true })).toBeVisible();
  await expect.poll(async () => (await evidence(page)).particles).toBe(16);
  expect((await evidence(page)).frequencies).toEqual([]);
  expect((await evidence(page)).contexts).toBe(0);
});

test("focus completion wins over a delayed own Finish response without replaying effects", async ({ page }) => {
  await instrument(page);
  await setup(page);
  await startStory(page);
  let release!: () => void;
  let acknowledged = false;
  const held = new Promise<void>((resolve) => { release = resolve; });
  await page.route(`**${resource}`, async (route) => {
    if (new URLSearchParams(route.request().postData() ?? "").get("intent") !== "finish-reading") return route.continue();
    const response = await route.fetch();
    acknowledged = true;
    await held;
    await route.fulfill({ response });
  });
  try {
    await finish(page).click();
    await expect.poll(() => acknowledged).toBe(true);
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await expect(page.getByRole("heading", { name: "Lesson complete", exact: true })).toBeVisible();
  } finally { release(); }
  expect(await completeChimes(page)).toBe(0);
  expect((await evidence(page)).particles).toBe(0);
});

test("a terminal failed Finish retains reload guidance and never celebrates", async ({ page }) => {
  await instrument(page);
  await setup(page);
  await startStory(page);
  await page.route(`**${resource}`, async (route) => {
    if (new URLSearchParams(route.request().postData() ?? "").get("intent") !== "finish-reading") return route.continue();
    await route.fulfill({ status: 409, json: { error: "This attempt changed." } });
  });
  await finish(page).click();
  await expect(page.getByRole("alert")).toContainText("This attempt changed.");
  await expect(page.getByRole("button", { name: "Reload lesson", exact: true })).toBeVisible();
  await expect(finish(page)).toBeDisabled();
  expect((await saved(page)).phase).toBe("story");
  expect(await completeChimes(page)).toBe(0);
  expect((await evidence(page)).particles).toBe(0);
});

test("final available lesson has only Back to lessons, with the revision header", async ({ page }) => {
  test.setTimeout(60_000);
  await instrument(page);
  await setup(page);
  for (const lesson of lessons.slice(0, -1)) {
    const location = lessonPath(lesson);
    expect((await post(page.request, location, { intent: "start" })).status()).toBe(303);
    let current = await saved(page, location);
    if (lesson.kind === "learning") {
      expect((await post(page.request, location, { intent: "start-flashcards", attempt_id: current.attemptId })).status()).toBe(303);
      expect((await post(page.request, location, { intent: "deck-passed", attempt_id: current.attemptId })).status()).toBe(303);
      current = await saved(page, location);
    }
    expect((await post(page.request, `${location}/reader`, { intent: "finish-reading", attempt_id: current.attemptId, content_revision: String(current.contentRevision) })).status()).toBe(200);
  }
  const final = lessonPath(lessons.at(-1)!);
  expect((await post(page.request, final, { intent: "start" })).status()).toBe(303);
  await page.goto(final);
  await expect(page.locator(".lesson-title")).toHaveText(`Lesson ${lessons.length} · Revision`);
  await expect(page.getByRole("heading", { name: "Read the story", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue", exact: true })).toHaveCount(0);
  await finish(page).click();
  await expect(page.getByRole("heading", { name: "Lesson complete", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Next lesson", exact: true })).toHaveCount(0);
  await expect(page.locator(".completion-actions .button")).toHaveCount(1);
  await expect(page.locator(".completion-actions .button")).not.toHaveClass(/secondary/);
  await expect(page.getByText("You reached the end of the available lessons.", { exact: true })).toBeVisible();
  expect((await evidence(page)).contexts).toBe(1); // Finish itself unlocks audio, even without flashcards.
});
