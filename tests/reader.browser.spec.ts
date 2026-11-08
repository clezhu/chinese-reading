import { expect, test, type Page } from "@playwright/test";
import type { RevisionCard, StoryState } from "../app/lib/story";
import { firstLesson, lessonCard, lockedLessons, login, origin, post, register, startReader } from "./helpers";

const endpoint = `${firstLesson}/reader`;
const cell = (page: Page, ref: string) => page.locator(`[data-occurrence="${ref}"]`);
const finishButton = (page: Page) => page.getByRole("button", { name: "Finish reading", exact: true });
type Snapshot = { state: StoryState; cards: RevisionCard[] };

async function snapshot(page: Page): Promise<Snapshot> {
  const response = await page.request.get(endpoint);
  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toBe("no-store");
  return response.json();
}

function form(state: StoryState, intent = "reveal", occurrence = "0:0:1") {
  return { intent, attempt_id: state.attemptId, content_revision: String(state.contentRevision), ...(intent === "reveal" ? { occurrence } : {}) };
}

async function reveal(page: Page, ref: string, keyboard?: "Enter" | "Space") {
  const target = cell(page, ref);
  if (keyboard) {
    await target.focus();
    await target.press(keyboard);
  } else await target.click();
  await expect(target).toHaveAttribute("data-save-state", "saved");
}

// Barriers control actual resource requests/responses, not fabricated success
// state. Always release them in finally so a failed assertion cannot hang cleanup.
function barrier() {
  let release!: () => void;
  const promise = new Promise<void>((resolve) => { release = resolve; });
  return { promise, release };
}

async function focusRefresh(page: Page) {
  await page.bringToFront();
  // Headless window managers do not consistently emit OS focus changes.
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
}

test("independent repeated/polyphonic occurrences persist and freeze sentence-specific revision help", async ({ page, browser }) => {
  const credentials = await register(page);
  const attemptId = await startReader(page);
  const initial = await snapshot(page);
  expect(initial.state).toMatchObject({ attemptId, phase: "story", revealed: [] });
  expect(initial.cards).toEqual([]);
  await expect(cell(page, "0:0:1").locator(".reader-pinyin")).toBeHidden();
  await expect(cell(page, "0:0:0")).toHaveAttribute("data-permanent", "true");
  await expect(cell(page, "0:0:0")).not.toHaveRole("button");
  await expect(cell(page, "0:0:0").locator(".reader-pinyin")).toBeVisible();
  await expect(page.getByText("这, zhè, permanent help, paragraph 1, sentence 1, token 1.", { exact: true })).toHaveCount(1);
  await expect(cell(page, "0:0:6")).toHaveCount(0); // Punctuation has no reveal control.

  // Click the later sentence first; neither the first appearance nor click order
  // may choose the collected sentence. Both authored readings of 了 are used.
  await reveal(page, "1:2:8");
  await expect(cell(page, "1:2:8").locator(".reader-pinyin")).toHaveText("liǎo");
  for (const ref of ["0:2:3", "1:1:4", "1:2:3", "1:2:10"]) {
    await expect(cell(page, ref)).toHaveAttribute("data-revealed", "false");
  }
  await reveal(page, "0:2:3", "Enter");
  await expect(cell(page, "0:2:3").locator(".reader-pinyin")).toHaveText("le");
  await reveal(page, "0:2:8", "Space"); // 是: its first appearance stays hidden.
  await expect(cell(page, "0:0:1")).toHaveAttribute("data-revealed", "false");
  await reveal(page, "0:2:4"); // Later help within 了's already selected sentence.
  const saved = await snapshot(page);
  expect(new Set(saved.state.revealed)).toEqual(new Set(["1:2:8", "0:2:3", "0:2:8", "0:2:4"]));
  expect(saved.cards).toEqual([]); // The revision deck is not frozen until Finish.

  await page.getByRole("link", { name: "Return to lesson list", exact: true }).click();
  await expect(lessonCard(page, "People and places").getByText("Locked", { exact: true })).toBeVisible();
  await page.goto(firstLesson);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  for (const ref of saved.state.revealed) await expect(cell(page, ref)).toHaveAttribute("data-save-state", "saved");
  await expect(cell(page, "0:2:9")).toHaveAttribute("data-revealed", "false");
  await expect(finishButton(page)).toBeEnabled();
  await finishButton(page).click();
  await expect(page.getByRole("heading", { name: "Collected revision", exact: true })).toBeVisible();
  const frozen = await snapshot(page);
  expect(frozen.state.phase).toBe("revision-flashcards");
  expect(frozen.cards.map((card) => [card.character.hanzi, card.occurrence.ref])).toEqual([
    ["了", "0:2:3"], ["一", "0:2:4"], ["是", "0:2:8"],
  ]);
  expect(frozen.cards[0].character.pinyin).toEqual(["le", "liǎo"]);
  expect(frozen.cards[0].occurrence.pinyin).toBe("le");
  expect(frozen.cards[1].character.pinyin).toEqual(["yī", "yāo"]);
  expect(frozen.cards[1].occurrence.pinyin).toBe("yí");
  expect(frozen.cards[0].sentence).toHaveLength(13); // Exactly one authored sentence.
  expect(frozen.cards[0].sentence.filter((token) => typeof token === "string")).toEqual(["，", "。"]);
  expect(frozen.cards[0].sentence.filter((token) => typeof token !== "string").map((token) => [token.ref, token.pinyin, token.revealed, token.showPinyin])).toEqual([
    ["0:2:0", "xiǎo", false, true], ["0:2:1", "lín", false, true], ["0:2:2", "dú", false, true],
    ["0:2:3", "le", true, true], ["0:2:4", "yí", true, true], ["0:2:5", "biàn", false, true],
    ["0:2:7", "hái", false, true], ["0:2:8", "shì", true, true], ["0:2:9", "bù", false, false],
    ["0:2:10", "míng", false, true], ["0:2:11", "bai", false, true],
  ]);
  const preview = page.locator('[data-revision-character="了"]');
  await expect(preview).toHaveCount(0); // Context belongs on the back, never the front.
  await page.getByRole("button", { name: "Reveal", exact: true }).click();
  await expect(page.getByRole("list", { name: "Readings for 了", exact: true }).getByRole("listitem")).toHaveText(["le", "liǎo"]);
  await expect(preview.locator('[data-context-occurrence="0:2:4"] .reader-pinyin')).toBeVisible();
  await expect(preview.locator('[data-context-occurrence="0:2:9"] .reader-pinyin')).toBeHidden();
  await expect(preview.locator('[data-context-occurrence="0:2:0"] .reader-pinyin')).toBeVisible();
  await expect(preview.locator('[data-context-occurrence="1:2:8"]')).toHaveCount(0);
  await page.reload();
  expect(await snapshot(page)).toEqual(frozen);
  // Nothing about phase, reveals or context depends on this browser's storage.
  const other = await browser.newContext({ baseURL: origin });
  try {
    const otherPage = await other.newPage();
    await login(otherPage, credentials);
    await otherPage.goto(firstLesson);
    await expect(otherPage.getByRole("heading", { name: "Collected revision", exact: true })).toBeVisible();
    expect(await snapshot(otherPage)).toEqual(frozen);
    await otherPage.goto("/lessons");
    await expect(lessonCard(otherPage, "First characters").getByText("In progress", { exact: true })).toBeVisible();
    await expect(lessonCard(otherPage, "People and places").getByText("Locked", { exact: true })).toBeVisible();
  } finally { await other.close(); }
});

test("no-click Finish completes directly, persists, and unlocks only the next lesson", async ({ page }) => {
  await register(page);
  await startReader(page);
  const before = (await snapshot(page)).state;
  const started = Date.now();
  await finishButton(page).click();
  await expect(page.getByRole("heading", { name: "Lesson complete", exact: true })).toBeVisible();
  await expect(page.getByRole("list", { name: "Collected revision cards", exact: true })).toHaveCount(0);
  const completed = await snapshot(page);
  expect(completed.state).toMatchObject({ attemptId: before.attemptId, contentRevision: before.contentRevision, phase: "complete", revealed: [] });
  expect(completed.state.version).toBeGreaterThan(before.version);
  expect(completed.state.updatedAt).toBeGreaterThanOrEqual(started);
  expect(completed.cards).toEqual([]);
  // Lost Finish responses must not rewrite the completion/version/timestamp.
  for (const response of await Promise.all(Array.from({ length: 3 }, () => post(page.request, endpoint, form(before, "finish-reading"))))) {
    expect(response.status()).toBe(200);
    expect((await response.json()).state).toEqual(completed.state);
  }
  expect((await post(page.request, endpoint, form(before))).status()).toBe(409);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Lesson complete", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Next lesson", exact: true }).click();
  await expect(page).toHaveURL(lockedLessons[0]);
  await expect(page.getByRole("list", { name: "New characters", exact: true })).toBeVisible();
  await page.goto("/lessons");
  // Completion milestones are deliberately not in the resource DTO. Public
  // completion/access after reload verifies the persisted milestone predicate.
  await expect(lessonCard(page, "First characters").getByText("Completed", { exact: true })).toBeVisible();
  await expect(lessonCard(page, "People and places").getByText("Available", { exact: true })).toBeVisible();
  await expect(lessonCard(page, "Everyday connections").getByText("Locked", { exact: true })).toBeVisible();
  expect(await snapshot(page)).toEqual(completed);
});

test("duplicate/concurrent atomic reveals merge without loss and concurrent Finish freezes exactly once", async ({ page }) => {
  await register(page);
  await startReader(page);
  const state = (await snapshot(page)).state;
  const refs = ["0:0:1", "0:0:4", "0:1:2", "0:1:7", "0:2:3", "0:2:4", "0:2:8", "0:2:9", "1:2:8"];
  const responses = await Promise.all([...refs, ...refs.slice().reverse(), refs[0]].map((ref) => post(page.request, endpoint, form(state, "reveal", ref))));
  for (const response of responses) expect(response.status()).toBe(200);
  const merged = await snapshot(page);
  expect(merged.state.revealed).toHaveLength(refs.length);
  expect(new Set(merged.state.revealed)).toEqual(new Set(refs));
  expect(merged.state.phase).toBe("story");
  const finishes = await Promise.all(Array.from({ length: 4 }, () => post(page.request, endpoint, form(state, "finish-reading"))));
  const frozen = await snapshot(page);
  for (const response of finishes) {
    expect(response.status()).toBe(200);
    expect((await response.json()).state).toEqual(frozen.state);
  }
  expect(frozen.state.phase).toBe("revision-flashcards");
  expect(frozen.state.revealed).toEqual(merged.state.revealed);
  expect(frozen.cards.map((card) => card.character.hanzi)).toEqual(["是", "的", "不", "了", "一"]);
  for (const ref of [refs[0], "1:2:3"]) {
    expect((await post(page.request, endpoint, form(state, "reveal", ref))).status()).toBe(409);
  }
  expect(await snapshot(page)).toEqual(frozen);
});

test("a reveal racing Finish is either saved in the frozen set or rejected, never lost after acknowledgement", async ({ page }) => {
  await register(page);
  await startReader(page);
  const state = (await snapshot(page)).state;
  const [revealResponse, finishResponse] = await Promise.all([
    post(page.request, endpoint, form(state)), post(page.request, endpoint, form(state, "finish-reading")),
  ]);
  expect(finishResponse.status()).toBe(200);
  expect([200, 409]).toContain(revealResponse.status());
  const frozen = await snapshot(page);
  expect(frozen.state.revealed).toEqual(revealResponse.status() === 200 ? ["0:0:1"] : []);
  expect(frozen.state.phase).toBe(revealResponse.status() === 200 ? "revision-flashcards" : "complete");
  expect((await finishResponse.json()).state).toEqual(frozen.state);
  expect((await post(page.request, endpoint, form(state, "reveal", "0:0:4"))).status()).toBe(409);
  expect(await snapshot(page)).toEqual(frozen);
});

test("resource rejects no attempt, wrong phase, locked lessons and unknown lessons", async ({ page }) => {
  await register(page);
  expect((await page.request.get(endpoint)).status()).toBe(409);
  expect((await post(page.request, endpoint, { intent: "reveal", occurrence: "0:0:1", attempt_id: "invented", content_revision: "1" })).status()).toBe(409);
  await page.goto(firstLesson);
  await page.getByRole("button", { name: "Start flashcards", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Practice round", exact: true })).toBeVisible();
  const state = (await snapshot(page)).state;
  expect(state.phase).toBe("flashcards");
  for (const intent of ["reveal", "finish-reading"]) {
    expect((await post(page.request, endpoint, form(state, intent))).status()).toBe(409);
    for (const path of lockedLessons) expect((await post(page.request, `${path}/reader`, form(state, intent))).status()).toBe(403);
  }
  for (const path of lockedLessons) expect((await page.request.get(`${path}/reader`)).status()).toBe(403);
  expect((await page.request.get("/lessons/not-a-lesson/reader")).status()).toBe(404);
  expect((await post(page.request, "/lessons/not-a-lesson/reader", form(state))).status()).toBe(404);
  expect((await snapshot(page)).state).toEqual(state);
});

test("invalid/permanent/punctuation references, revisions and duplicate fields never mutate saved state", async ({ page }) => {
  await register(page);
  await startReader(page);
  const initial = await snapshot(page);
  const valid = form(initial.state);
  const cases: { value: Record<string, string> | string; status: number }[] = [
    ...["0:0:0", "0:0:6", "0:0:99", "9:0:1", "0:9:1", "-1:0:1", "00:0:1", "0:0:1.0", "0:0", "bogus", ""].map((occurrence) => ({ value: { ...valid, occurrence }, status: 400 })),
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
    const anon = await anonymous.newPage();
    for (const response of [
      await anon.request.get(endpoint, { maxRedirects: 0 }),
      await post(anon.request, endpoint, { intent: "finish-reading", attempt_id: "fake", content_revision: "1" }),
    ]) {
      expect(response.status()).toBe(401);
      expect(await response.json()).toEqual({ error: expect.stringMatching(/sign in/i) });
      expect(response.headers()["cache-control"]).toBe("no-store");
    }
  } finally { await anonymous.close(); }
  await register(page);
  await startReader(page);
  const initial = await snapshot(page);
  const body = form(initial.state);
  const invalidOrigins: Record<string, string>[] = [{ Origin: "https://evil.example" }, { Origin: "null" }, { "Sec-Fetch-Site": "cross-site" }];
  for (const headers of invalidOrigins) {
    expect((await post(page.request, endpoint, body, headers)).status()).toBe(403);
  }
  expect((await page.request.post(endpoint, {
    data: new URLSearchParams(body).toString(), headers: { "Content-Type": "application/x-www-form-urlencoded" }, maxRedirects: 0,
  })).status()).toBe(403);
  expect((await post(page.request, endpoint, JSON.stringify(body), { "Content-Type": "application/json" })).status()).toBe(415);
  expect(await snapshot(page)).toEqual(initial);
});

test("attempt ownership and reveals stay isolated even with forged owner/phase/completion fields", async ({ page, browser }) => {
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
    expect((await post(page.request, endpoint, {
      ...form(alice), user_id: bob.username, username: bob.username, phase: "complete", first_completed_at: "1", last_completed_at: "1",
    })).status()).toBe(200);
    expect((await snapshot(page)).state).toMatchObject({ phase: "story", revealed: ["0:0:1"] });
    expect(await snapshot(bobPage)).toEqual(bobInitial);
    await page.goto("/lessons");
    await expect(lessonCard(page, "People and places").getByText("Locked", { exact: true })).toBeVisible();
  } finally { await other.close(); }
});

for (const failure of ["503", "network"] as const) {
  test(`${failure} reveal failure keeps optimistic pinyin pending, blocks Finish, and retries the real resource automatically`, async ({ page }) => {
    await register(page);
    await startReader(page);
    const initial = (await snapshot(page)).state;
    const retryArrived = barrier();
    const allowRetry = barrier();
    let attempts = 0;
    await page.route("**/lessons/first-characters/reader*", async (route) => {
      const request = route.request();
      if (request.method() !== "POST" || new URLSearchParams(request.postData()!).get("intent") !== "reveal") return route.continue();
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
      await cell(page, "0:0:1").click();
      await expect(cell(page, "0:0:1")).toHaveAttribute("data-save-state", "pending");
      await expect(cell(page, "0:0:1").locator(".reader-pinyin")).toBeVisible();
      await expect(page.getByRole("status")).toContainText("retrying automatically");
      await expect(page.getByRole("status")).toContainText("not yet saved");
      await expect(finishButton(page)).toBeDisabled();
      await retryArrived.promise;
      expect((await snapshot(page)).state).toEqual(initial); // The failure was not acknowledged as durable.
      await expect(finishButton(page)).toBeDisabled();
      allowRetry.release();
      await expect(cell(page, "0:0:1")).toHaveAttribute("data-save-state", "saved");
      await expect(page.getByRole("status")).toContainText("All reveals saved.");
      await expect(finishButton(page)).toBeEnabled();
      expect(attempts).toBe(2);
      expect((await snapshot(page)).state.revealed).toEqual(["0:0:1"]);
      await page.reload();
      await expect(cell(page, "0:0:1")).toHaveAttribute("data-save-state", "saved");
    } finally { allowRetry.release(); }
  });
}

test("reloading may discard unsaved memory-only help but never presents it as durable", async ({ page }) => {
  await register(page);
  await startReader(page);
  const initial = await snapshot(page);
  const storage = await page.evaluate(() => Object.entries(localStorage));
  await page.route("**/lessons/first-characters/reader*", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "Offline" }) });
  });
  await cell(page, "1:2:8").click();
  await expect(cell(page, "1:2:8")).toHaveAttribute("data-save-state", "pending");
  await expect(cell(page, "1:2:8").locator(".reader-pinyin")).toBeVisible();
  await expect(page.getByRole("status")).toContainText("leaving or reloading can lose unsaved reveals");
  await expect(finishButton(page)).toBeDisabled();
  expect(await snapshot(page)).toEqual(initial);
  expect(await page.evaluate(() => Object.entries(localStorage))).toEqual(storage);
  await page.reload();
  await expect(cell(page, "1:2:8")).toHaveAttribute("data-save-state", "hidden");
  await expect(cell(page, "1:2:8").locator(".reader-pinyin")).toBeHidden();
  await expect(page.getByRole("status")).toContainText("No reveals yet.");
  await expect(finishButton(page)).toBeEnabled();
  expect(await snapshot(page)).toEqual(initial);
});

test("a lost Finish response retries idempotently without changing the frozen result", async ({ page }) => {
  await register(page);
  await startReader(page);
  await reveal(page, "1:2:8");
  const retryArrived = barrier();
  const allowRetry = barrier();
  let frozen: StoryState | undefined;
  let attempts = 0;
  await page.route("**/lessons/first-characters/reader*", async (route) => {
    if (route.request().method() !== "POST" || new URLSearchParams(route.request().postData()!).get("intent") !== "finish-reading") return route.continue();
    attempts++;
    if (attempts === 1) {
      const response = await route.fetch(); // The real D1 write succeeds; only its response is lost.
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
    await expect(finishButton(page)).toBeEnabled();
    await finishButton(page).click();
    await retryArrived.promise;
    await expect(finishButton(page)).toBeDisabled();
    await expect(page.getByRole("status")).toContainText("retrying automatically");
    expect((await snapshot(page)).state).toEqual(frozen);
    allowRetry.release();
    await expect(page.getByRole("heading", { name: "Collected revision", exact: true })).toBeVisible();
    expect((await snapshot(page)).state).toEqual(frozen);
    expect(attempts).toBe(2);
  } finally { allowRetry.release(); }
});

for (const failure of ["authentication", "stale attempt", "invalid occurrence"] as const) {
  test(`${failure} is terminal with actionable feedback rather than an automatic retry loop`, async ({ page }) => {
    await register(page);
    await startReader(page);
    let attempts = 0;
    if (failure === "authentication") expect((await post(page.request, "/logout", {})).status()).toBe(303);
    await page.route("**/lessons/first-characters/reader*", async (route) => {
      if (route.request().method() !== "POST") return route.continue();
      attempts++;
      const params = new URLSearchParams(route.request().postData()!);
      if (failure === "stale attempt") params.set("attempt_id", "no-longer-current");
      if (failure === "invalid occurrence") params.set("occurrence", "0:0:6");
      await route.continue({ postData: params.toString() });
    });
    const expectedStatus = failure === "authentication" ? 401 : failure === "stale attempt" ? 409 : 400;
    const response = page.waitForResponse((response) => response.url().endsWith(endpoint) && response.request().method() === "POST");
    await cell(page, "0:0:1").click();
    expect((await response).status()).toBe(expectedStatus);
    await expect(page.getByRole("alert")).toContainText(failure === "authentication" ? "sign in again" : "Reload the lesson");
    await expect(page.getByRole("button", { name: "Reload lesson", exact: true })).toBeVisible();
    await expect(finishButton(page)).toBeDisabled();
    await expect(cell(page, "0:0:4")).toHaveAttribute("aria-disabled", "true");
    await cell(page, "0:0:4").click({ force: true });
    await focusRefresh(page);
    // Longer than the first retry delay: a terminal 4xx must not be retried.
    await page.waitForTimeout(700);
    expect(attempts).toBe(1);
    await expect(page.getByRole("status")).not.toContainText("retrying automatically");
    await page.getByRole("button", { name: "Reload lesson", exact: true }).click();
    if (failure === "authentication") await expect(page).toHaveURL(/\/login$/);
    else {
      await expect(cell(page, "0:0:1")).toHaveAttribute("data-revealed", "false");
      expect((await snapshot(page)).state.revealed).toEqual([]);
    }
  });
}

test("focus refresh merges another tab's durable help with this tab's pending reveal", async ({ page, context }) => {
  await register(page);
  await startReader(page);
  const other = await context.newPage();
  const pendingArrived = barrier();
  const allowSave = barrier();
  await page.route("**/lessons/first-characters/reader*", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    pendingArrived.release();
    await allowSave.promise;
    await route.continue();
  });
  try {
    await other.goto(firstLesson);
    await cell(page, "0:0:1").click();
    await pendingArrived.promise;
    await reveal(other, "1:2:8");
    await focusRefresh(page);
    await expect(cell(page, "1:2:8")).toHaveAttribute("data-save-state", "saved");
    await expect(cell(page, "0:0:1")).toHaveAttribute("data-save-state", "pending");
    await expect(cell(page, "0:0:1").locator(".reader-pinyin")).toBeVisible();
    await expect(finishButton(page)).toBeDisabled();
    allowSave.release();
    await expect(cell(page, "0:0:1")).toHaveAttribute("data-save-state", "saved");
    await expect(finishButton(page)).toBeEnabled();
    await focusRefresh(other);
    await expect(cell(other, "0:0:1")).toHaveAttribute("data-save-state", "saved");
    await expect(cell(other, "1:2:8")).toHaveAttribute("data-save-state", "saved");
    expect(new Set((await snapshot(page)).state.revealed)).toEqual(new Set(["0:0:1", "1:2:8"]));
    await expect(finishButton(other)).toBeEnabled();
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
  const olderDelivered = barrier();
  let delayed = false;
  await page.route("**/lessons/first-characters/reader*", async (route) => {
    if (route.request().method() !== "POST" || delayed) return route.continue();
    delayed = true;
    const response = await route.fetch();
    expect(response.status()).toBe(200);
    olderSaved.release();
    await deliverOlder.promise;
    await route.fulfill({ response });
    olderDelivered.release();
  });
  try {
    await cell(page, "0:0:1").click();
    await olderSaved.promise;
    await expect(cell(page, "0:0:1")).toHaveAttribute("data-save-state", "pending");
    await reveal(page, "1:2:8");
    await expect(cell(page, "0:0:1")).toHaveAttribute("data-save-state", "saved");
    const newer = await snapshot(page);
    deliverOlder.release();
    await olderDelivered.promise;
    await expect(page.getByRole("status")).toContainText("All reveals saved.");
    for (const ref of newer.state.revealed) await expect(cell(page, ref)).toHaveAttribute("data-save-state", "saved");
    await expect(finishButton(page)).toBeEnabled();
    expect(await snapshot(page)).toEqual(newer);
  } finally { deliverOlder.release(); }
});

test("a stale browser tab's reveal after another tab finishes gets 409 and reloads the frozen deck", async ({ page, context }) => {
  await register(page);
  await startReader(page);
  const other = await context.newPage();
  try {
    await other.goto(firstLesson);
    await reveal(other, "1:2:8");
    await expect(finishButton(other)).toBeEnabled();
    await finishButton(other).click();
    await expect(other.getByRole("heading", { name: "Collected revision", exact: true })).toBeVisible();
    const frozen = await snapshot(other);
    // Do not focus-refresh the stale page first: exercise its real late write.
    const lateResponse = page.waitForResponse((response) => response.url().endsWith(endpoint) && response.request().method() === "POST");
    // Dispatch on the background document without switching OS focus; switching
    // tabs first would correctly refresh it and prevent this deliberately stale write.
    await cell(page, "0:0:1").evaluate((element) => (element as HTMLButtonElement).click());
    expect((await lateResponse).status()).toBe(409);
    await expect(page.getByRole("alert")).toContainText("Reading already ended");
    await expect(finishButton(page)).toBeDisabled();
    expect(await snapshot(page)).toEqual(frozen);
    await page.getByRole("button", { name: "Reload lesson", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Collected revision", exact: true })).toBeVisible();
    expect(await snapshot(page)).toEqual(frozen);
  } finally { await other.close(); }
});

async function geometry(page: Page) {
  return page.locator(".reader-passage").evaluate((passage) => {
    const rect = (element: Element) => {
      const r = element.getBoundingClientRect();
      return { x: r.x + window.scrollX, y: r.y + window.scrollY, width: r.width, height: r.height };
    };
    return [passage, ...passage.querySelectorAll(".reader-paragraph, .reader-unit, .reader-cell, .reader-pinyin, .reader-hanzi, .reader-punctuation")].map(rect);
  });
}

function expectStable(before: Awaited<ReturnType<typeof geometry>>, after: Awaited<ReturnType<typeof geometry>>) {
  expect(after).toHaveLength(before.length);
  before.forEach((rect, index) => {
    for (const key of ["x", "y", "width", "height"] as const) {
      expect(Math.abs(after[index][key] - rect[key]), `element ${index} ${key}`).toBeLessThanOrEqual(0.5);
    }
  });
}

for (const viewport of [{ name: "desktop", width: 1280, height: 900 }, { name: "narrow", width: 320, height: 844 }]) {
  test(`${viewport.name}: mixed/all reveals preserve both lanes, every character position and continuous multi-sentence paragraphs`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await register(page);
    await startReader(page);
    await page.evaluate(() => document.fonts.ready);
    const paragraphs = page.locator(".reader-paragraph");
    await expect(paragraphs).toHaveCount(2);
    await expect(page.locator(".reader-passage br")).toHaveCount(0);
    const before = await geometry(page);
    const paragraphRects = await paragraphs.evaluateAll((elements) => elements.map((element) => {
      const r = element.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom };
    }));
    expect(paragraphRects[1].top).toBeGreaterThan(paragraphRects[0].bottom);
    if (viewport.name === "desktop") {
      const end = await cell(page, "0:0:5").boundingBox();
      const next = await cell(page, "0:1:0").boundingBox();
      expect(end).not.toBeNull();
      expect(next).not.toBeNull();
      expect(next!.y).toBe(end!.y); // A sentence boundary is not a forced line break.
      expect(next!.x).toBeGreaterThan(end!.x);
    } else {
      const rows = await paragraphs.first().locator(".reader-cell").evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().top));
      expect(new Set(rows).size).toBeGreaterThan(1); // Actual natural wrapping.
    }
    const refs = await page.locator('.reader-reveal[data-revealed="false"]').evaluateAll((elements) => elements.map((element) => element.getAttribute("data-occurrence")!));
    await reveal(page, refs[0], "Enter");
    await page.screenshot({ path: testInfo.outputPath(`reader-${viewport.name}-mixed.png`), fullPage: true });
    await expect(cell(page, refs[0])).toBeFocused();
    await expect(cell(page, refs[0])).toHaveAttribute("aria-disabled", "true");
    expectStable(before, await geometry(page));
    for (const ref of refs.slice(1)) await reveal(page, ref);
    await expect(page.locator('.reader-cell[data-revealed="false"]')).toHaveCount(0);
    await expect(page.locator('.reader-cell[data-save-state="pending"]')).toHaveCount(0);
    expectStable(before, await geometry(page));
    const sizing = await page.locator(".reader-passage").evaluate((passage) => ({
      passageWidth: passage.getBoundingClientRect().width,
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
      cells: [...passage.querySelectorAll(".reader-cell")].map((element) => {
        const r = element.getBoundingClientRect();
        return { width: r.width, height: r.height, left: r.left, right: r.right };
      }),
    }));
    expect(sizing.passageWidth).toBeLessThanOrEqual(viewport.width);
    expect(sizing.scrollWidth).toBeLessThanOrEqual(sizing.viewportWidth);
    for (const r of sizing.cells) {
      expect(r.width).toBeGreaterThanOrEqual(44);
      expect(r.height).toBeGreaterThanOrEqual(78);
      expect(r.left).toBeGreaterThanOrEqual(0);
      expect(r.right).toBeLessThanOrEqual(viewport.width);
    }
    await expect(finishButton(page)).toBeEnabled();
    await page.screenshot({ path: testInfo.outputPath(`reader-${viewport.name}-revealed.png`), fullPage: true });
  });
}
