import { execFileSync } from "node:child_process";
import { expect, test } from "@playwright/test";
import { firstLesson, lessonCard, post, register, startReader } from "./helpers";
import type { StoryState } from "../app/lib/story";

const endpoint = `${firstLesson}/reader`;
const firstCompleted = 1700000000000;
const lastCompleted = 1700000010000;

/** Seed an earlier deployment's attempt, not an alternative application API.
 * Only the isolated Playwright database and this test's random user are touched.
 * Assertions below use real browser/HTTP behaviour, not the table shape. */
function previousDeployment(username: string, phase: string, completed = false, revision = 1) {
  execFileSync("python3", ["-c", `
import glob,json,sqlite3,sys
username,phase,completed,revision=json.loads(sys.argv[1])
for path in glob.glob('.wrangler/playwright/v3/d1/miniflare-D1DatabaseObject/*.sqlite'):
    with sqlite3.connect(path, timeout=20) as db:
        if not db.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='users'").fetchone(): continue
        user=db.execute('SELECT id FROM users WHERE username=?',(username,)).fetchone()
        if not user: continue
        db.execute('''UPDATE lesson_progress SET phase=?,content_revision=?,state_version=50,
          first_completed_at=?,last_completed_at=?,first_completed_content_revision=?,last_completed_content_revision=?
          WHERE user_id=? AND lesson_id='first-characters' ''',
          (phase,revision,1700000000000 if completed else None,1700000010000 if completed else None,
           1 if completed else None,1 if completed else None,user[0]))
        db.commit()
        sys.exit(0)
sys.exit('Isolated test account was not found')
`, JSON.stringify([username, phase, completed, revision])], { stdio: "pipe" });
}

async function state(page: import("@playwright/test").Page): Promise<StoryState> {
  const response = await page.request.get(endpoint);
  expect(response.status()).toBe(200);
  return (await response.json()).state;
}

for (const phase of ["flashcards", "story", "revision-flashcards"]) {
  test(`a content update resets the whole unfinished ${phase} attempt and rejects old writes`, async ({ page }) => {
    const credentials = await register(page);
    await startReader(page);
    const old = await state(page);
    expect((await post(page.request, endpoint, { intent: "reveal", attempt_id: old.attemptId, content_revision: String(old.contentRevision), occurrence: "0:0:1" })).status()).toBe(200);
    previousDeployment(credentials.username, phase);
    await page.reload();
    await expect(page.getByRole("button", { name: "Start flashcards", exact: true })).toBeVisible();
    await expect(page.locator("[data-occurrence]")).toHaveCount(0);
    const reset = await state(page);
    expect(reset).toMatchObject({ contentRevision: 2, phase: "introduction", revealed: [], version: 0 });
    expect(reset.attemptId).not.toBe(old.attemptId);
    expect((await post(page.request, endpoint, { intent: "reveal", attempt_id: old.attemptId, content_revision: "1", occurrence: "0:0:1" })).status()).toBe(409);
    await page.getByRole("button", { name: "Start flashcards", exact: true }).click();
    await expect(page.getByText("Card 1 of 5 · 0 missed this round", { exact: true })).toBeVisible();
    await page.goto("/lessons");
    await expect(lessonCard(page, "People and places").getByText("Locked", { exact: true })).toBeVisible();
  });
}

for (const phase of ["complete", "story"]) {
  test(`a content update preserves completion milestones/revisions and later access for ${phase}`, async ({ page }) => {
    const credentials = await register(page);
    await startReader(page);
    const old = await state(page);
    previousDeployment(credentials.username, phase, true);
    await page.reload();
    await expect(page.getByRole("heading", { name: phase === "complete" ? "Lesson complete" : "First characters", exact: true })).toBeVisible();
    const reset = await state(page);
    expect(reset.phase).toBe(phase === "complete" ? "complete" : "introduction");
    expect(reset.contentRevision).toBe(2);
    expect(reset.attemptId).not.toBe(old.attemptId);
    expect(reset.revealed).toEqual([]);
    const milestones = page.locator('[aria-label="Completion milestones"]');
    await expect(milestones.locator("dd")).toHaveText([
      `${new Date(firstCompleted).toISOString()} · content revision 1`,
      `${new Date(lastCompleted).toISOString()} · content revision 1`,
    ]);
    if (phase === "story") {
      // Finish the fresh attempt to update only the latest milestone/revision.
      await page.getByRole("button", { name: "Start flashcards", exact: true }).click();
      await expect(page.getByRole("heading", { name: "Practice round", exact: true })).toBeVisible();
      expect((await post(page.request, firstLesson, { intent: "deck-passed", attempt_id: reset.attemptId })).status()).toBe(303);
      const finished = await post(page.request, endpoint, { intent: "finish-reading", attempt_id: reset.attemptId, content_revision: "2" });
      expect(finished.status()).toBe(200);
      await page.reload();
      await expect(milestones.locator("dd").first()).toHaveText(`${new Date(firstCompleted).toISOString()} · content revision 1`);
      await expect(milestones.locator("dd").last()).toContainText("content revision 2");
    }
    await page.goto("/lessons");
    await expect(lessonCard(page, "First characters").getByText("Completed", { exact: true })).toBeVisible();
    await expect(lessonCard(page, "People and places").getByText("Available", { exact: true })).toBeVisible();
    expect((await page.request.get("/lessons/people-and-places")).status()).toBe(200);
  });
}

test("an older deployment refuses newer attempts rather than clearing their saved reveals", async ({ page }) => {
  const credentials = await register(page);
  await startReader(page);
  const old = await state(page);
  expect((await post(page.request, endpoint, { intent: "reveal", attempt_id: old.attemptId, content_revision: "2", occurrence: "0:0:1" })).status()).toBe(200);
  previousDeployment(credentials.username, "story", false, 3);
  expect((await page.request.get(endpoint)).status()).toBe(409);
  expect((await page.request.get(endpoint)).status()).toBe(409);
  // Simulate returning to a deployment matching the saved content, to prove
  // the rejected old deployment did not rewrite the attempt or its reveal set.
  previousDeployment(credentials.username, "story", false, 2);
  expect(await state(page)).toMatchObject({ attemptId: old.attemptId, revealed: ["0:0:1"] });
});

test("trailing-slash lesson URLs still save and finish using the canonical resource endpoint", async ({ page }) => {
  await register(page);
  await startReader(page);
  await page.goto(`${firstLesson}/`);
  const target = page.locator('[data-occurrence="0:0:1"]');
  await target.click();
  await expect(target).toHaveAttribute("data-save-state", "saved");
  await expect(page.getByRole("button", { name: "Finish reading", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "Finish reading", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Collected revision", exact: true })).toBeVisible();
});
