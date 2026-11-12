import { expect, test, type Page } from "@playwright/test";
import { firstLesson, lessonCard, laterLessons, login, origin, post, register, startReader } from "./helpers";
import { candidates, first, firstRef, firstTitle, lessonPath, lessons, nextTitle } from "./content-helpers";
import { revisionCards, type StoryState } from "../app/lib/story";

async function state(page: Page, lesson = firstLesson): Promise<StoryState> {
  return (await (await page.request.get(`${lesson}/reader`)).json()).state;
}
async function answer(page: Page, got = true) {
  await page.getByRole("button", { name: "Reveal", exact: true }).click();
  await page.getByRole("button", { name: got ? "Got it" : "Have not got it", exact: true }).click();
}
const milestones = (page: Page) => page.locator('[aria-label="Completion milestones"] time');
const dates = (page: Page) => milestones(page).evaluateAll((nodes) => nodes.map((node) => node.getAttribute("datetime")));
const cell = (page: Page, ref: string) => page.locator(`[data-occurrence="${ref}"]`);
const finish = (page: Page) => page.getByRole("button", { name: "Finish reading", exact: true });
const reread = (page: Page) => page.getByRole("button", { name: "Reread story", exact: true });
const passed = (saved: StoryState) => ({ intent: "revision-passed", attempt_id: saved.attemptId, content_revision: String(saved.contentRevision) });

async function collect(page: Page, refs: string[]) {
  for (const ref of refs) {
    await cell(page, ref).click();
    await expect(cell(page, ref)).toHaveAttribute("data-save-state", "saved");
  }
  await finish(page).click();
  await expect(page.getByRole("heading", { name: "Collected revision", exact: true })).toBeVisible();
  const frozen = await state(page);
  expect(frozen.phase).toBe("revision-flashcards");
  expect(new Set(frozen.revealed)).toEqual(new Set(refs));
  return frozen;
}

async function freshStory(page: Page, previous: StoryState) {
  await expect(page.getByRole("region", { name: "Story reader", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue", exact: true })).toHaveCount(0);
  const fresh = await state(page);
  expect(fresh).toMatchObject({ phase: "story", contentRevision: previous.contentRevision, revealed: [], version: 0 });
  expect(fresh.attemptId).not.toBe(previous.attemptId);
  expect((await (await page.request.get(`${firstLesson}/reader`)).json()).cards).toEqual([]);
  for (const entry of candidates.occurrences) {
    await expect(cell(page, entry.ref)).toHaveAttribute("data-revealed", String(entry.permanent));
    if (entry.permanent) await expect(cell(page, entry.ref).locator(".reader-pinyin")).toBeVisible();
    else await expect(cell(page, entry.ref).locator(".reader-pinyin")).toBeHidden();
  }
  return fresh;
}

test("current-pass revision retries confirmations and reloads, but only a zero-reveal reread earns completion", async ({ page, browser }) => {
  const credentials = await register(page);
  await startReader(page);
  const refs = candidates.distinct.slice(0, 2).map((entry) => entry.ref);
  const frozen = await collect(page, refs);
  await expect(milestones(page)).toHaveCount(0);
  await expect(page.getByLabel("Saved sentence context")).toHaveCount(0);
  await expect(reread(page)).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Complete lesson", exact: true })).toHaveCount(0);
  await answer(page, false);
  await answer(page);
  await page.reload();
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
    expect(await state(otherPage)).toEqual(frozen);
    await otherPage.getByRole("button", { name: "Reveal", exact: true }).click();
    const card = revisionCards(first, refs)[0];
    await expect(otherPage.getByRole("list", { name: `Readings for ${card.character.hanzi}`, exact: true }).getByRole("listitem")).toHaveText([...card.character.pinyin]);
    for (const token of card.sentence) if (typeof token !== "string") {
      const pinyin = otherPage.locator(`[data-context-occurrence="${token.ref}"] .reader-pinyin`);
      if (token.showPinyin) await expect(pinyin).toBeVisible();
      else await expect(pinyin).toBeHidden();
    }
  } finally { await other.close(); }
  await answer(page);
  await answer(page);
  await expect(reread(page)).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue to story", exact: true })).toHaveCount(0);
  await reread(page).click();
  const fresh = await freshStory(page, frozen);
  await expect(milestones(page)).toHaveCount(0);
  await page.reload();
  expect(await state(page)).toEqual(fresh);
  await page.goto("/lessons");
  await expect(lessonCard(page, firstTitle).getByText("In progress", { exact: true })).toBeVisible();
  await expect(lessonCard(page, nextTitle).getByRole("button", { name: /^Start lesson\s*:/ })).toBeVisible();
  await page.goto(firstLesson);
  await finish(page).click();
  await expect(page.getByRole("heading", { name: "Lesson complete", exact: true })).toBeVisible();
  const earned = await dates(page);
  expect(earned).toHaveLength(2);
  expect(earned[0]).toBe(earned[1]);
  await page.reload();
  expect(await dates(page)).toEqual(earned);
  await page.getByRole("link", { name: "Next lesson", exact: true }).click();
  await expect(page).toHaveURL(laterLessons[0]);
});

test("repeated passes use only current help, ignore old local decks, and atomically reject stale/concurrent writes", async ({ page, context }) => {
  await register(page);
  await startReader(page);
  const staleTab = await context.newPage();
  await staleTab.goto(firstLesson);
  const identities = new Set<string>();
  try {
    for (let pass = 0; pass < 3; pass++) {
      const current = await state(page);
      identities.add(current.attemptId);
      // First two passes use different characters; the third deliberately reuses
      // the second deck's IDs, so an old recognised local deck must not auto-pass.
      const ref = candidates.distinct[pass === 0 ? 0 : 1].ref;
      const frozen = await collect(page, [ref]);
      const resource = await (await page.request.get(`${firstLesson}/reader`)).json();
      expect(resource.cards).toEqual(revisionCards(first, [ref]));
      await expect(page.getByRole("heading", { name: "Collected revision", exact: true })).toBeVisible();
      await expect(reread(page)).toHaveCount(0);
      await answer(page);
      await page.reload();
      await expect(reread(page)).toBeVisible(); // Current local deck survives reload.
      // Preserve previous local decks intentionally: fresh identity, not clearing
      // the entire browser, must protect the next pass even with identical IDs.
      const oldStorage = await page.evaluate(() => Object.entries(localStorage));
      expect(oldStorage.length).toBeGreaterThan(0);
      const responses = await Promise.all(Array.from({ length: 3 }, () => post(page.request, firstLesson, passed(frozen))));
      expect(responses.filter((response) => response.status() === 303)).toHaveLength(1);
      expect(responses.filter((response) => response.status() === 409)).toHaveLength(2);
      await page.reload();
      const fresh = await freshStory(page, frozen);
      expect(identities.has(fresh.attemptId)).toBe(false);
      for (const intent of ["reveal", "finish-reading"]) {
        expect((await post(page.request, `${firstLesson}/reader`, { ...passed(frozen), intent, occurrence: ref })).status()).toBe(409);
      }
      expect((await post(page.request, firstLesson, passed(frozen))).status()).toBe(409);
      expect((await post(page.request, firstLesson, { intent: "deck-passed", attempt_id: frozen.attemptId })).status()).toBe(409);
      expect(await state(page)).toEqual(fresh);
      await expect(milestones(page)).toHaveCount(0);
    }
    expect(identities.size).toBe(3);
    // A genuinely stale story tab may not reveal into the newest pass.
    const response = staleTab.waitForResponse((response) => response.url().endsWith(`${firstLesson}/reader`) && response.request().method() === "POST");
    await cell(staleTab, firstRef).evaluate((element) => (element as HTMLButtonElement).click());
    expect((await response).status()).toBe(409);
    await expect(staleTab.getByRole("button", { name: "Reload lesson", exact: true })).toBeVisible();
    await staleTab.getByRole("button", { name: "Reload lesson", exact: true }).click();
    expect(await state(staleTab)).toEqual(await state(page));
    await expect(cell(staleTab, firstRef).locator(".reader-pinyin")).toBeHidden();
    await finish(page).click();
    await expect(page.getByRole("heading", { name: "Lesson complete", exact: true })).toBeVisible();
  } finally { await staleTab.close(); }
});

test("a delayed old-pass snapshot cannot restore help or a frozen deck after identity rotates", async ({ page }) => {
  await register(page);
  await startReader(page);
  const frozen = await collect(page, [firstRef]);
  const oldSnapshot = await (await page.request.get(`${firstLesson}/reader`)).json();
  await answer(page);
  await reread(page).click();
  const fresh = await freshStory(page, frozen);
  let sentOld = false;
  await page.route(`**${firstLesson}/reader?reader-state=1`, async (route) => {
    if (sentOld) return route.continue();
    sentOld = true;
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(oldSnapshot) });
  });
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(page.getByRole("alert")).toContainText("attempt or story content changed");
  await expect(cell(page, firstRef).locator(".reader-pinyin")).toBeHidden();
  await expect(page.getByRole("heading", { name: "Collected revision", exact: true })).toHaveCount(0);
  await expect(finish(page)).toBeDisabled();
  expect(await state(page)).toEqual(fresh);
  await page.unroute(`**${firstLesson}/reader?reader-state=1`);
  await page.getByRole("button", { name: "Reload lesson", exact: true }).click();
  await freshStory(page, frozen);
  await expect(finish(page)).toBeEnabled();
});

test("narrow revision wraps context and retains an unsaved result for retry", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await register(page);
  await startReader(page);
  const frozen = await collect(page, [firstRef]);
  await page.getByRole("button", { name: "Reveal", exact: true }).click();
  await expect(page.getByLabel("Saved sentence context")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("revision-mobile.png"), fullPage: true });
  await page.getByRole("button", { name: "Got it", exact: true }).click();
  const action = `**${firstLesson}.data`;
  await page.route(action, async (route) => {
    if (route.request().method() === "POST") {
      const response = await route.fetch({ postData: new URLSearchParams({ ...passed(frozen), attempt_id: "stale-attempt" }).toString() });
      await route.fulfill({ response });
    } else await route.continue();
  });
  await reread(page).click();
  await expect(page.getByRole("alert")).toContainText("Your result has not been saved");
  expect(await state(page)).toEqual(frozen);
  await page.unroute(action);
  await reread(page).click();
  await freshStory(page, frozen);
  await expect(milestones(page)).toHaveCount(0);
});

test("completing a later lesson removes start guidance even with the first lesson untouched", async ({ page }) => {
  await register(page);
  await startReader(page, lessonPath(lessons[1]!));
  await finish(page).click();
  await expect(page.getByRole("heading", { name: "Lesson complete", exact: true })).toBeVisible();
  await page.goto("/lessons");
  await page.reload();
  await expect(lessonCard(page, firstTitle).getByRole("button", { name: /^Start lesson/ })).toBeVisible();
  await expect(lessonCard(page, nextTitle).getByText("Completed", { exact: true })).toBeVisible();
  await expect(page.getByText("Start here", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Continue here", { exact: true })).toHaveCount(0);
});

test("explicit learning revisit starts introduction, rereads skip it, and only a clean Finish updates latest milestone", async ({ page }) => {
  await register(page);
  const original = await startReader(page);
  await finish(page).click();
  await expect(milestones(page)).toHaveCount(2);
  const earned = await dates(page);
  await page.goto("/lessons");
  const completedCard = lessonCard(page, firstTitle);
  await expect(completedCard.getByText("Completed", { exact: true })).toBeAttached();
  await expect(completedCard.getByRole("link")).toHaveCount(0);
  await expect(completedCard.getByRole("button")).toHaveCount(1);
  await expect(page.getByText("Continue here", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Start here", { exact: true })).toHaveCount(0);
  await completedCard.getByRole("button", { name: /^Revisit lesson/ }).click();
  await expect(page.getByRole("button", { name: "Continue", exact: true })).toBeVisible();
  const revisit = await state(page);
  expect(revisit).toMatchObject({ phase: "introduction", revealed: [], version: 0 });
  expect(revisit.attemptId).not.toBe(original);
  for (const attempt_id of [original, revisit.attemptId]) expect((await post(page.request, firstLesson, { intent: "revisit", attempt_id })).status()).toBe(409);
  await page.goto("/lessons");
  const card = lessonCard(page, firstTitle);
  await expect(card.getByText("Completed", { exact: true })).toBeAttached();
  await expect(card.getByText("Completed", { exact: true })).toBeVisible();
  await expect(card.locator(".completion-badge")).toHaveText("✓");
  await expect(page.getByText("Continue here", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Start here", { exact: true })).toHaveCount(0);
  await expect(card.getByRole("button")).toHaveCount(0);
  await expect(card.getByRole("link")).toHaveCount(1);
  await expect(lessonCard(page, nextTitle).getByRole("button", { name: /^Start lesson\s*:/ })).toBeAttached();
  await expect(lessonCard(page, nextTitle).getByText("Continue here", { exact: true })).toHaveCount(0);
  await card.getByRole("link", { name: /^Resume revisit/ }).click();
  expect((await state(page)).attemptId).toBe(revisit.attemptId);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  for (let i = 0; i < first.newCharacters.length; i++) await answer(page);
  await page.getByRole("button", { name: "Continue to story", exact: true }).click();
  const frozen = await collect(page, [firstRef]);
  expect(await dates(page)).toEqual(earned);
  await answer(page);
  await reread(page).click();
  await freshStory(page, frozen);
  expect(await dates(page)).toEqual(earned); // Practice is not a new completion.
  await page.reload();
  expect(await dates(page)).toEqual(earned);
  await finish(page).click();
  await expect(page.getByRole("heading", { name: "Lesson complete", exact: true })).toBeVisible();
  const latest = await dates(page);
  expect(latest[0]).toBe(earned[0]);
  expect(Date.parse(latest[1]!)).toBeGreaterThan(Date.parse(earned[1]!));
});

test("all 110 published stories complete through the UI, with 100 learning lessons and ten direct-story latest-50 revisions", async ({ page }, testInfo) => {
  test.setTimeout(600_000);
  expect(lessons).toHaveLength(110);
  expect(lessons.filter((lesson) => lesson.kind === "learning")).toHaveLength(100);
  expect(lessons.filter((lesson) => lesson.kind === "revision")).toHaveLength(10);
  const introductions = lessons.flatMap((lesson) => lesson.newCharacters);
  expect(introductions).toHaveLength(500);
  expect(new Set(introductions.map((character) => character.hanzi)).size).toBe(500);
  expect(lessons.map((lesson) => lesson.kind)).toEqual(Array.from({ length: 10 }, () => [...Array(10).fill("learning"), "revision"]).flat());
  await register(page);
  for (const [index, lesson] of lessons.entries()) {
    await expect(page.getByText("Completed", { exact: true })).toHaveCount(index);
    await expect(page.getByRole("button", { name: /^Start lesson\s*:/ })).toHaveCount(lessons.length - index);
    const card = lessonCard(page, lesson.title);
    await expect(card.getByRole("button", { name: /^Start lesson\s*:/ })).toBeVisible();
    if (lesson.kind === "revision") {
      await expect(card.getByText("Revision", { exact: true })).toBeVisible();
      await expect(card.getByText("No new characters", { exact: true }).and(page.locator(":not(.sr-only)"))).toHaveCount(0);
    }
    await card.getByRole("button", { name: /^Start lesson/ }).click();
    await expect(page).toHaveURL(lessonPath(lesson));
    await expect(page.locator(".lesson-title")).toHaveText(`Lesson ${index + 1} · ${lesson.kind === "learning" ? lesson.newCharacters.map((character) => character.hanzi).join(" ") : "Revision"}`);
    if (lesson.kind === "learning") {
      await expect(page.getByRole("list", { name: "New characters", exact: true }).locator(":scope > li")).toHaveCount(5);
      await expect(page.getByRole("heading", { name: "Meet your new characters", exact: true })).toBeVisible();
      await page.getByRole("button", { name: "Continue", exact: true }).click();
      for (const _ of lesson.newCharacters) await answer(page);
      await expect(page.getByRole("heading", { name: "Deck recognised", exact: true })).toBeVisible();
      await page.getByRole("button", { name: "Continue to story", exact: true }).click();
    } else {
      await expect(page.getByRole("list", { name: "New characters", exact: true })).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Continue", exact: true })).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Continue to story", exact: true })).toHaveCount(0);
      const saved = await state(page, lessonPath(lesson));
      expect(saved).toMatchObject({ phase: "story", contentRevision: lesson.contentRevision, revealed: [], version: 0 });
      expect(saved.attemptId).not.toBe("");
      const introduced = lessons.slice(0, index + 1).flatMap((entry) => entry.newCharacters.map((character) => character.hanzi));
      expect(introduced).toHaveLength((Math.floor(index / 11) + 1) * 50);
      const taught = new Set(introduced);
      const occurrences = lesson.story!.paragraphs.flat(2).filter((token) => typeof token !== "string");
      const taughtOccurrences = occurrences.filter((token) => taught.has(token.hanzi));
      const permanentOccurrences = occurrences.filter((token) => !taught.has(token.hanzi));
      const assertRevisionStory = async () => {
        // Match actual story occurrences (including repeats/older characters),
        // not every character ever taught or an exclusive latest-50 bank.
        await expect(page.locator('[data-occurrence] .reader-hanzi')).toHaveText(occurrences.map((token) => token.hanzi));
        const taughtCells = page.locator('[data-occurrence][data-permanent="false"]');
        await expect(taughtCells.locator('.reader-hanzi')).toHaveText(taughtOccurrences.map((token) => token.hanzi));
        const observed = new Set(await taughtCells.locator('.reader-hanzi').allTextContents());
        for (const hanzi of introduced.slice(-50)) expect(observed.has(hanzi), `${lesson.id} must cover latest-50 ${hanzi}`).toBe(true);
        await expect(taughtCells.locator('.reader-pinyin')).toHaveCount(taughtOccurrences.length);
        await expect(taughtCells.locator('.reader-pinyin:visible')).toHaveCount(0);
        await expect(page.locator('[data-occurrence][data-permanent="false"][data-revealed="true"]')).toHaveCount(0);
        const permanentCells = page.locator('[data-occurrence][data-permanent="true"]');
        await expect(permanentCells.locator('.reader-hanzi')).toHaveText(permanentOccurrences.map((token) => token.hanzi));
        await expect(permanentCells.locator('.reader-pinyin:visible')).toHaveCount(permanentOccurrences.length);
      };
      await assertRevisionStory();
      await page.reload();
      expect(await state(page, lessonPath(lesson))).toEqual(saved);
      await assertRevisionStory();
    }
    await expect(page.getByRole("region", { name: "Story reader", exact: true })).toBeVisible();
    await expect(milestones(page)).toHaveCount(0);
    await finish(page).click();
    await expect(page.getByRole("heading", { name: "Lesson complete", exact: true })).toBeVisible();
    expect(await state(page, lessonPath(lesson))).toMatchObject({ phase: "complete", revealed: [] });
    await expect(milestones(page)).toHaveCount(2);
    if (index < lessons.length - 1) {
      await expect(page.getByRole("link", { name: "Next lesson", exact: true })).toHaveAttribute("href", lessonPath(lessons[index + 1]));
      await page.locator('.completion-actions').getByRole("link", { name: "Back to lessons", exact: true }).click();
    }
  }
  await expect(page.getByRole("link", { name: "Next lesson", exact: true })).toHaveCount(0);
  await expect(page.getByText("You reached the end of the available lessons.", { exact: true })).toBeVisible();
  await expect(page.locator(".confetti-particle")).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath("completion-final-desktop.png"), fullPage: true });
  const completedRevision = await state(page, lessonPath(lessons.at(-1)!));
  const earned = await dates(page);
  await page.reload();
  expect(await state(page, lessonPath(lessons.at(-1)!))).toEqual(completedRevision);
  expect(await dates(page)).toEqual(earned);
  await page.locator('.completion-actions').getByRole("link", { name: "Back to lessons", exact: true }).click();
  await expect(page.getByText("Completed", { exact: true })).toHaveCount(110);
  await expect(page.getByText("Locked", { exact: true })).toHaveCount(0);
});

test("revision/revisit writes enforce phase, identity, cross-lesson attempts and account isolation across fresh passes", async ({ page, browser }) => {
  await register(page);
  await startReader(page);
  const current = await state(page);
  expect((await post(page.request, firstLesson, passed(current))).status()).toBe(409);
  expect((await post(page.request, firstLesson, { intent: "revisit", attempt_id: current.attemptId })).status()).toBe(409);
  const frozen = await collect(page, [firstRef]);
  for (const intent of ["revision-passed", "revisit"]) expect((await post(page.request, laterLessons[0], { ...passed(frozen), intent })).status()).toBe(409);
  const other = await browser.newContext({ baseURL: origin });
  try {
    const bob = await other.newPage();
    await register(bob);
    await startReader(bob);
    const bobInitial = await state(bob);
    for (const intent of ["revision-passed", "revisit"]) expect((await post(bob.request, firstLesson, { ...passed(frozen), intent })).status()).toBe(409);
    expect((await post(page.request, firstLesson, { ...passed(frozen), user_id: "other", phase: "complete", first_completed_at: "1" })).status()).toBe(303);
    const fresh = await state(page);
    expect(fresh).toMatchObject({ phase: "story", revealed: [], version: 0 });
    expect(fresh.attemptId).not.toBe(frozen.attemptId);
    expect((await post(bob.request, `${firstLesson}/reader`, { ...passed(fresh), intent: "finish-reading" })).status()).toBe(409);
    expect(await state(bob)).toEqual(bobInitial);
    await page.reload();
    await expect(milestones(page)).toHaveCount(0);
    await page.goto("/lessons");
    await expect(lessonCard(page, nextTitle).getByRole("button", { name: /^Start lesson\s*:/ })).toBeVisible();
  } finally { await other.close(); }
});
