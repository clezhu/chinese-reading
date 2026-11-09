import { expect, test, type Page } from "@playwright/test";
import { curriculum } from "../app/content/curriculum";
import { revisionCards, type RevisionCard, type StoryState } from "../app/lib/story";
import { firstLesson, lessonCard, laterLessons, login, origin, post, register, startReader } from "./helpers";
import { candidates, first, firstRef, firstTitle, lastRef, lessons, nextTitle, punctuationRef, secondRef } from "./content-helpers";

const endpoint = `${firstLesson}/reader`;
const resourcePattern = `**${endpoint}*`;
const cell = (page: Page, ref: string) => page.locator(`[data-occurrence="${ref}"]`);
const finishButton = (page: Page) => page.getByRole("button", { name: "Finish reading", exact: true });
type Snapshot = { state: StoryState; cards: RevisionCard[] };

async function snapshot(page: Page): Promise<Snapshot> {
  const response = await page.request.get(endpoint);
  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toBe("no-store");
  return response.json();
}
function form(state: StoryState, intent = "reveal", occurrence = firstRef) {
  return { intent, attempt_id: state.attemptId, content_revision: String(state.contentRevision), ...(intent === "reveal" ? { occurrence } : {}) };
}
async function reveal(page: Page, ref: string, keyboard?: "Enter" | "Space") {
  const target = cell(page, ref);
  if (keyboard) { await target.focus(); await target.press(keyboard); }
  else await target.click();
  await expect(target).toHaveAttribute("data-save-state", "saved");
}
function barrier() {
  let release!: () => void;
  const promise = new Promise<void>((resolve) => { release = resolve; });
  return { promise, release };
}
async function focusRefresh(page: Page) {
  await page.bringToFront();
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
}

test("independent occurrences persist and freeze earliest story-order sentence help, not click-order context", async ({ page, browser }) => {
  const credentials = await register(page);
  const attemptId = await startReader(page);
  const initial = await snapshot(page);
  expect(initial.state).toMatchObject({ attemptId, phase: "story", revealed: [] });
  expect(initial.cards).toEqual([]);
  for (const entry of candidates.occurrences) {
    await expect(cell(page, entry.ref)).toHaveAttribute("data-permanent", String(entry.permanent));
    if (entry.permanent) {
      await expect(cell(page, entry.ref)).not.toHaveRole("button");
      await expect(cell(page, entry.ref).locator(".reader-pinyin")).toBeVisible();
    } else await expect(cell(page, entry.ref).locator(".reader-pinyin")).toBeHidden();
  }
  for (const ref of candidates.punctuation) await expect(cell(page, ref)).toHaveCount(0);
  const repeated = candidates.taught.filter((entry) => candidates.taught.some((other) => other.ref !== entry.ref && other.hanzi === entry.hanzi));
  expect(repeated.length, "published story should exercise repeated occurrences").toBeGreaterThan(1);
  const earlier = repeated[0];
  const later = repeated.filter((entry) => entry.hanzi === earlier.hanzi).at(-1)!;
  await reveal(page, later.ref);
  await expect(cell(page, later.ref).locator(".reader-pinyin")).toHaveText(later.pinyin);
  await expect(cell(page, earlier.ref)).toHaveAttribute("data-revealed", "false");
  await reveal(page, earlier.ref, "Enter");
  const extra = candidates.distinct.find((entry) => entry.hanzi !== earlier.hanzi)!;
  await reveal(page, extra.ref, "Space");
  const saved = await snapshot(page);
  expect(new Set(saved.state.revealed)).toEqual(new Set([later.ref, earlier.ref, extra.ref]));
  expect(saved.cards).toEqual([]);
  await page.goto("/lessons");
  await expect(lessonCard(page, nextTitle).getByRole("button", { name: /^Start lesson\s*:/ })).toBeVisible();
  await page.goto(firstLesson);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  for (const ref of saved.state.revealed) await expect(cell(page, ref)).toHaveAttribute("data-save-state", "saved");
  await finishButton(page).click();
  await expect(page.getByRole("heading", { name: "Collected revision", exact: true })).toBeVisible();
  const frozen = await snapshot(page);
  expect(frozen.state.phase).toBe("revision-flashcards");
  expect(frozen.cards).toEqual(revisionCards(first, saved.state.revealed, curriculum));
  expect(frozen.cards.find((card) => card.character.hanzi === earlier.hanzi)?.occurrence.ref).toBe(earlier.ref);
  await expect(page.getByLabel("Saved sentence context")).toHaveCount(0);
  await page.getByRole("button", { name: "Reveal", exact: true }).click();
  const card = frozen.cards[0];
  await expect(page.getByRole("list", { name: `Readings for ${card.character.hanzi}`, exact: true }).getByRole("listitem")).toHaveText([...card.character.pinyin]);
  const context = page.getByLabel("Saved sentence context");
  for (const token of card.sentence) if (typeof token !== "string") {
    const pinyin = context.locator(`[data-context-occurrence="${token.ref}"] .reader-pinyin`);
    if (token.showPinyin) await expect(pinyin).toBeVisible();
    else await expect(pinyin).toBeHidden();
  }
  await page.reload();
  expect(await snapshot(page)).toEqual(frozen);
  const other = await browser.newContext({ baseURL: origin });
  try {
    const otherPage = await other.newPage();
    await login(otherPage, credentials);
    await otherPage.goto(firstLesson);
    await expect(otherPage.getByRole("heading", { name: "Collected revision", exact: true })).toBeVisible();
    expect(await snapshot(otherPage)).toEqual(frozen);
  } finally { await other.close(); }
});

test("no-click Finish completes directly, is idempotent, and leaves later lessons available", async ({ page }) => {
  await register(page);
  await startReader(page);
  const before = (await snapshot(page)).state;
  await finishButton(page).click();
  await expect(page.getByRole("heading", { name: "Lesson complete", exact: true })).toBeVisible();
  const completed = await snapshot(page);
  expect(completed.state).toMatchObject({ attemptId: before.attemptId, contentRevision: before.contentRevision, phase: "complete", revealed: [] });
  expect(completed.state.version).toBeGreaterThan(before.version);
  expect(completed.cards).toEqual([]);
  for (const response of await Promise.all(Array.from({ length: 3 }, () => post(page.request, endpoint, form(before, "finish-reading"))))) {
    expect(response.status()).toBe(200);
    expect((await response.json()).state).toEqual(completed.state);
  }
  expect((await post(page.request, endpoint, form(before))).status()).toBe(409);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Lesson complete", exact: true })).toBeVisible();
  await page.goto("/lessons");
  await expect(lessonCard(page, firstTitle).getByText("Completed", { exact: true })).toBeVisible();
  await expect(lessonCard(page, nextTitle).getByRole("button", { name: /^Start lesson\s*:/ })).toBeVisible();
  for (const lesson of lessons.slice(2)) await expect(lessonCard(page, lesson.title).getByRole("button", { name: /^Start lesson\s*:/ })).toBeVisible();
  expect(await snapshot(page)).toEqual(completed);
});

test("duplicate/concurrent atomic reveals merge and concurrent Finish freezes exactly once", async ({ page }) => {
  await register(page);
  await startReader(page);
  const state = (await snapshot(page)).state;
  const refs = candidates.taught.slice(0, 9).map((entry) => entry.ref);
  const responses = await Promise.all([...refs, ...refs.slice().reverse(), refs[0]].map((ref) => post(page.request, endpoint, form(state, "reveal", ref))));
  for (const response of responses) expect(response.status()).toBe(200);
  const merged = await snapshot(page);
  expect(merged.state.revealed).toHaveLength(refs.length);
  expect(new Set(merged.state.revealed)).toEqual(new Set(refs));
  const finishes = await Promise.all(Array.from({ length: 4 }, () => post(page.request, endpoint, form(state, "finish-reading"))));
  const frozen = await snapshot(page);
  for (const response of finishes) {
    expect(response.status()).toBe(200);
    expect((await response.json()).state).toEqual(frozen.state);
  }
  expect(frozen.state.phase).toBe("revision-flashcards");
  expect(frozen.state.revealed).toEqual(merged.state.revealed);
  expect(frozen.cards).toEqual(revisionCards(first, refs));
  expect((await post(page.request, endpoint, form(state))).status()).toBe(409);
  expect(await snapshot(page)).toEqual(frozen);
});

test("a reveal racing Finish is either frozen or rejected, never lost after acknowledgement", async ({ page }) => {
  await register(page);
  await startReader(page);
  const state = (await snapshot(page)).state;
  const [revealed, finished] = await Promise.all([post(page.request, endpoint, form(state)), post(page.request, endpoint, form(state, "finish-reading"))]);
  expect(finished.status()).toBe(200);
  expect([200, 409]).toContain(revealed.status());
  const frozen = await snapshot(page);
  expect(frozen.state.revealed).toEqual(revealed.status() === 200 ? [firstRef] : []);
  expect(frozen.state.phase).toBe(revealed.status() === 200 ? "revision-flashcards" : "complete");
  expect((await finished.json()).state).toEqual(frozen.state);
  expect((await post(page.request, endpoint, form(state, "reveal", secondRef))).status()).toBe(409);
});

test("resource rejects missing attempts, wrong phases, cross-lesson attempts and unknown lessons", async ({ page }) => {
  await register(page);
  expect((await page.request.get(endpoint)).status()).toBe(409);
  expect((await post(page.request, endpoint, { intent: "reveal", occurrence: firstRef, attempt_id: "invented", content_revision: String(first.contentRevision) })).status()).toBe(409);
  await page.goto(firstLesson);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Practice round", exact: true })).toBeVisible();
  const state = (await snapshot(page)).state;
  expect(state.phase).toBe("flashcards");
  for (const intent of ["reveal", "finish-reading"]) {
    expect((await post(page.request, endpoint, form(state, intent))).status()).toBe(409);
    for (const path of laterLessons) expect((await post(page.request, `${path}/reader`, form(state, intent))).status()).toBe(409);
  }
  for (const path of laterLessons) expect((await page.request.get(`${path}/reader`)).status()).toBe(409);
  expect((await page.request.get("/lessons/not-a-lesson/reader")).status()).toBe(404);
  expect((await post(page.request, "/lessons/not-a-lesson/reader", form(state))).status()).toBe(404);
  expect((await snapshot(page)).state).toEqual(state);
});

test("invalid/permanent/punctuation refs, revisions and duplicate fields never mutate saved state", async ({ page }) => {
  await register(page);
  await startReader(page);
  const initial = await snapshot(page);
  const valid = form(initial.state);
  const invalidRefs = [...candidates.permanent.map((entry) => entry.ref), ...candidates.punctuation, "999:0:1", "0:999:1", "-1:0:1", "00:0:1", "0:0:1.0", "0:0", "bogus", ""];
  const cases: { value: Record<string, string> | string; status: number }[] = [
    ...invalidRefs.map((occurrence) => ({ value: { ...valid, occurrence }, status: 400 })),
    ...["0", "-1", "1.0", "1e0", "01", "NaN", "Infinity", "9007199254740992", ""].map((content_revision) => ({ value: { ...valid, content_revision }, status: 400 })),
    { value: { ...valid, content_revision: String(initial.state.contentRevision + 1) }, status: 409 },
    { value: { ...valid, attempt_id: "stale-attempt" }, status: 409 },
    ...["revision-passed", "complete", "start", ""].map((intent) => ({ value: { ...valid, intent }, status: 400 })),
  ];
  for (const key of ["intent", "attempt_id", "content_revision", "occurrence"] as const) {
    const params = new URLSearchParams(valid);
    params.append(key, valid[key]!);
    cases.push({ value: params.toString(), status: 400 });
    params.delete(key);
    cases.push({ value: params.toString(), status: 400 });
  }
  const duplicateFinish = new URLSearchParams(form(initial.state, "finish-reading"));
  duplicateFinish.append("content_revision", String(initial.state.contentRevision));
  cases.push({ value: duplicateFinish.toString(), status: 400 });
  for (const { value, status } of cases) {
    const response = await post(page.request, endpoint, value);
    expect(response.status(), JSON.stringify(value)).toBe(status);
    expect(await response.json()).toEqual({ error: expect.any(String) });
  }
  expect(await snapshot(page)).toEqual(initial);
});

test("resource requires authentication, same origin and URL-encoded forms", async ({ page, browser }) => {
  const anonymous = await browser.newContext({ baseURL: origin });
  try {
    for (const response of [await anonymous.request.get(endpoint, { maxRedirects: 0 }), await post(anonymous.request, endpoint, { intent: "finish-reading", attempt_id: "fake", content_revision: String(first.contentRevision) })]) {
      expect(response.status()).toBe(401);
      expect(await response.json()).toEqual({ error: expect.stringMatching(/sign in/i) });
      expect(response.headers()["cache-control"]).toBe("no-store");
    }
  } finally { await anonymous.close(); }
  await register(page);
  await startReader(page);
  const initial = await snapshot(page);
  const body = form(initial.state);
  const rejectedHeaders: Record<string, string>[] = [{ Origin: "https://evil.example" }, { Origin: "null" }, { "Sec-Fetch-Site": "cross-site" }];
  for (const headers of rejectedHeaders) expect((await post(page.request, endpoint, body, headers)).status()).toBe(403);
  expect((await page.request.post(endpoint, { data: new URLSearchParams(body).toString(), headers: { "Content-Type": "application/x-www-form-urlencoded" }, maxRedirects: 0 })).status()).toBe(403);
  expect((await post(page.request, endpoint, JSON.stringify(body), { "Content-Type": "application/json" })).status()).toBe(415);
  expect(await snapshot(page)).toEqual(initial);
});

test("attempt ownership and help stay isolated despite forged owner/phase/milestones", async ({ page, browser }) => {
  await register(page);
  await startReader(page);
  const alice = (await snapshot(page)).state;
  const other = await browser.newContext({ baseURL: origin });
  try {
    const bobPage = await other.newPage();
    const bob = await register(bobPage);
    await startReader(bobPage);
    const bobInitial = await snapshot(bobPage);
    for (const intent of ["reveal", "finish-reading"]) {
      expect((await post(bobPage.request, endpoint, form(alice, intent))).status()).toBe(409);
      expect((await post(page.request, endpoint, form(bobInitial.state, intent))).status()).toBe(409);
    }
    expect((await post(page.request, endpoint, { ...form(alice), user_id: bob.username, phase: "complete", first_completed_at: "1", last_completed_at: "1" })).status()).toBe(200);
    expect((await snapshot(page)).state).toMatchObject({ phase: "story", revealed: [firstRef] });
    expect(await snapshot(bobPage)).toEqual(bobInitial);
  } finally { await other.close(); }
});

for (const failure of ["503", "network"] as const) {
  test(`${failure} reveal keeps help pending, blocks Finish, and retries the real resource`, async ({ page }) => {
    await register(page);
    await startReader(page);
    const initial = (await snapshot(page)).state;
    const retryArrived = barrier();
    const allowRetry = barrier();
    let attempts = 0;
    await page.route(resourcePattern, async (route) => {
      if (route.request().method() !== "POST" || new URLSearchParams(route.request().postData()!).get("intent") !== "reveal") return route.continue();
      attempts++;
      if (attempts === 1) {
        if (failure === "network") await route.abort("failed");
        else await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "Temporary outage" }) });
        return;
      }
      retryArrived.release();
      await allowRetry.promise;
      await route.continue();
    });
    try {
      await cell(page, firstRef).click();
      await expect(cell(page, firstRef)).toHaveAttribute("data-save-state", "pending");
      await expect(cell(page, firstRef).locator(".reader-pinyin")).toBeVisible();
      await expect(page.getByRole("status")).toContainText("retrying automatically");
      await expect(page.getByRole("status")).toContainText("not yet saved");
      await expect(finishButton(page)).toBeDisabled();
      await retryArrived.promise;
      expect((await snapshot(page)).state).toEqual(initial);
      allowRetry.release();
      await expect(cell(page, firstRef)).toHaveAttribute("data-save-state", "saved");
      await expect(finishButton(page)).toBeEnabled();
      expect(attempts).toBe(2);
      expect((await snapshot(page)).state.revealed).toEqual([firstRef]);
      await page.reload();
      await expect(cell(page, firstRef)).toHaveAttribute("data-save-state", "saved");
    } finally { allowRetry.release(); }
  });
}

test("reload discards unsaved memory-only help without presenting it as durable", async ({ page }) => {
  await register(page);
  await startReader(page);
  const initial = await snapshot(page);
  const storage = await page.evaluate(() => Object.entries(localStorage));
  await page.route(resourcePattern, async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "Offline" }) });
  });
  await cell(page, lastRef).click();
  await expect(cell(page, lastRef)).toHaveAttribute("data-save-state", "pending");
  await expect(page.getByRole("status")).toContainText("leaving or reloading can lose unsaved reveals");
  await expect(finishButton(page)).toBeDisabled();
  expect(await snapshot(page)).toEqual(initial);
  expect(await page.evaluate(() => Object.entries(localStorage))).toEqual(storage);
  await page.reload();
  await expect(cell(page, lastRef)).toHaveAttribute("data-save-state", "hidden");
  await expect(cell(page, lastRef).locator(".reader-pinyin")).toBeHidden();
  await expect(finishButton(page)).toBeEnabled();
  expect(await snapshot(page)).toEqual(initial);
});

test("a lost Finish response retries idempotently without changing the frozen result", async ({ page }) => {
  await register(page);
  await startReader(page);
  await reveal(page, lastRef);
  const retryArrived = barrier();
  const allowRetry = barrier();
  let frozen: StoryState | undefined;
  let attempts = 0;
  await page.route(resourcePattern, async (route) => {
    if (route.request().method() !== "POST" || new URLSearchParams(route.request().postData()!).get("intent") !== "finish-reading") return route.continue();
    attempts++;
    if (attempts === 1) {
      const response = await route.fetch();
      expect(response.status()).toBe(200);
      frozen = (await response.json()).state;
      await route.abort("failed");
      return;
    }
    retryArrived.release();
    await allowRetry.promise;
    await route.continue();
  });
  try {
    await finishButton(page).click();
    await retryArrived.promise;
    await expect(finishButton(page)).toBeDisabled();
    expect((await snapshot(page)).state).toEqual(frozen);
    allowRetry.release();
    await expect(page.getByRole("heading", { name: "Collected revision", exact: true })).toBeVisible();
    expect((await snapshot(page)).state).toEqual(frozen);
    expect(attempts).toBe(2);
  } finally { allowRetry.release(); }
});

for (const failure of ["authentication", "stale attempt", "invalid occurrence"] as const) {
  test(`${failure} is terminal with actionable feedback rather than automatic retries`, async ({ page }) => {
    await register(page);
    await startReader(page);
    let attempts = 0;
    if (failure === "authentication") expect((await post(page.request, "/logout", {})).status()).toBe(303);
    await page.route(resourcePattern, async (route) => {
      if (route.request().method() !== "POST") return route.continue();
      attempts++;
      const params = new URLSearchParams(route.request().postData()!);
      if (failure === "stale attempt") params.set("attempt_id", "no-longer-current");
      if (failure === "invalid occurrence") params.set("occurrence", punctuationRef);
      await route.continue({ postData: params.toString() });
    });
    const response = page.waitForResponse((response) => response.url().endsWith(endpoint) && response.request().method() === "POST");
    await cell(page, firstRef).click();
    expect((await response).status()).toBe(failure === "authentication" ? 401 : failure === "stale attempt" ? 409 : 400);
    await expect(page.getByRole("alert")).toContainText(failure === "authentication" ? "sign in again" : "Reload the lesson");
    await expect(finishButton(page)).toBeDisabled();
    await expect(cell(page, secondRef)).toHaveAttribute("aria-disabled", "true");
    await cell(page, secondRef).click({ force: true });
    await focusRefresh(page);
    await page.waitForTimeout(700);
    expect(attempts).toBe(1);
    await page.getByRole("button", { name: "Reload lesson", exact: true }).click();
    if (failure === "authentication") await expect(page).toHaveURL(/\/register$/);
    else expect((await snapshot(page)).state.revealed).toEqual([]);
  });
}

test("focus refresh merges another tab's saved help with this tab's pending reveal", async ({ page, context }) => {
  await register(page);
  await startReader(page);
  const other = await context.newPage();
  const arrived = barrier();
  const allowSave = barrier();
  await page.route(resourcePattern, async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    arrived.release();
    await allowSave.promise;
    await route.continue();
  });
  try {
    await other.goto(firstLesson);
    await cell(page, firstRef).click();
    await arrived.promise;
    await reveal(other, lastRef);
    await focusRefresh(page);
    await expect(cell(page, lastRef)).toHaveAttribute("data-save-state", "saved");
    await expect(cell(page, firstRef)).toHaveAttribute("data-save-state", "pending");
    await expect(finishButton(page)).toBeDisabled();
    allowSave.release();
    await expect(cell(page, firstRef)).toHaveAttribute("data-save-state", "saved");
    await focusRefresh(other);
    await expect(cell(other, firstRef)).toHaveAttribute("data-save-state", "saved");
    expect(new Set((await snapshot(page)).state.revealed)).toEqual(new Set([firstRef, lastRef]));
    await finishButton(other).click();
    await expect(other.getByRole("heading", { name: "Collected revision", exact: true })).toBeVisible();
    await focusRefresh(page);
    await expect(page.getByRole("heading", { name: "Collected revision", exact: true })).toBeVisible();
    expect(await snapshot(page)).toEqual(await snapshot(other));
  } finally { allowSave.release(); await other.close(); }
});

test("an older successful response cannot overwrite a newer saved snapshot", async ({ page }) => {
  await register(page);
  await startReader(page);
  const olderSaved = barrier();
  const deliverOlder = barrier();
  const delivered = barrier();
  let delayed = false;
  await page.route(resourcePattern, async (route) => {
    if (route.request().method() !== "POST" || delayed) return route.continue();
    delayed = true;
    const response = await route.fetch();
    expect(response.status()).toBe(200);
    olderSaved.release();
    await deliverOlder.promise;
    await route.fulfill({ response });
    delivered.release();
  });
  try {
    await cell(page, firstRef).click();
    await olderSaved.promise;
    await reveal(page, lastRef);
    await expect(cell(page, firstRef)).toHaveAttribute("data-save-state", "saved");
    const newer = await snapshot(page);
    deliverOlder.release();
    await delivered.promise;
    for (const ref of newer.state.revealed) await expect(cell(page, ref)).toHaveAttribute("data-save-state", "saved");
    await expect(finishButton(page)).toBeEnabled();
    expect(await snapshot(page)).toEqual(newer);
  } finally { deliverOlder.release(); }
});

test("a stale tab's late reveal after Finish is rejected and reloads the frozen deck", async ({ page, context }) => {
  await register(page);
  await startReader(page);
  const other = await context.newPage();
  try {
    await other.goto(firstLesson);
    await reveal(other, lastRef);
    await finishButton(other).click();
    await expect(other.getByRole("heading", { name: "Collected revision", exact: true })).toBeVisible();
    const frozen = await snapshot(other);
    const response = page.waitForResponse((response) => response.url().endsWith(endpoint) && response.request().method() === "POST");
    await cell(page, firstRef).evaluate((element) => (element as HTMLButtonElement).click());
    expect((await response).status()).toBe(409);
    await expect(page.getByRole("alert")).toContainText("Reading already ended");
    await expect(finishButton(page)).toBeDisabled();
    expect(await snapshot(page)).toEqual(frozen);
    await page.getByRole("button", { name: "Reload lesson", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Collected revision", exact: true })).toBeVisible();
  } finally { await other.close(); }
});

async function geometry(page: Page) {
  return page.locator(".reader-passage").evaluate((passage) => [passage, ...passage.querySelectorAll(".reader-paragraph, .reader-unit, .reader-cell, .reader-pinyin, .reader-hanzi, .reader-punctuation")].map((element) => {
    const r = element.getBoundingClientRect();
    return { x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height };
  }));
}
function expectStable(before: Awaited<ReturnType<typeof geometry>>, after: Awaited<ReturnType<typeof geometry>>) {
  expect(after).toHaveLength(before.length);
  before.forEach((rect, index) => {
    for (const key of ["x", "y", "width", "height"] as const) expect(Math.abs(after[index][key] - rect[key]), `element ${index} ${key}`).toBeLessThanOrEqual(0.5);
  });
}
for (const viewport of [{ name: "desktop", width: 1280, height: 900 }, { name: "narrow", width: 320, height: 844 }]) {
  test(`${viewport.name}: reveals preserve reserved lanes/positions and naturally wrapping paragraphs`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await register(page);
    await startReader(page);
    await page.evaluate(() => document.fonts.ready);
    const paragraphs = page.locator(".reader-paragraph");
    await expect(paragraphs).toHaveCount(first.story!.paragraphs.length);
    await expect(page.locator(".reader-passage br")).toHaveCount(0);
    const before = await geometry(page);
    const rects = await paragraphs.evaluateAll((elements) => elements.map((element) => { const r = element.getBoundingClientRect(); return { top: r.top, bottom: r.bottom }; }));
    for (let i = 1; i < rects.length; i++) expect(rects[i].top).toBeGreaterThan(rects[i - 1].bottom);
    if (viewport.name === "narrow") {
      const rows = await paragraphs.first().locator(".reader-cell").evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().top));
      expect(new Set(rows).size).toBeGreaterThan(1);
    }
    const refs = candidates.taught.map((entry) => entry.ref);
    await reveal(page, refs[0], "Enter");
    await page.screenshot({ path: testInfo.outputPath(`reader-${viewport.name}-mixed.png`), fullPage: true });
    await expect(cell(page, refs[0])).toBeFocused();
    await expect(cell(page, refs[0])).toHaveAttribute("aria-disabled", "true");
    expectStable(before, await geometry(page));
    for (const ref of refs.slice(1)) await reveal(page, ref);
    await expect(page.locator('.reader-cell[data-revealed="false"]')).toHaveCount(0);
    expectStable(before, await geometry(page));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const box of await page.locator(".reader-cell").evaluateAll((elements) => elements.map((element) => { const r = element.getBoundingClientRect(); return { width: r.width, height: r.height, left: r.left, right: r.right }; }))) {
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(78);
      expect(box.left).toBeGreaterThanOrEqual(0);
      expect(box.right).toBeLessThanOrEqual(viewport.width);
    }
    await expect(finishButton(page)).toBeEnabled();
    await page.screenshot({ path: testInfo.outputPath(`reader-${viewport.name}-revealed.png`), fullPage: true });
  });
}
