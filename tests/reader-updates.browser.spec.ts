import { execFileSync } from "node:child_process";
import { expect, test, type Page } from "@playwright/test";
import { firstLesson, lessonCard, post, register, startReader } from "./helpers";
import { first, firstRef, firstTitle, nextTitle, lessons, lessonPath } from "./content-helpers";
import type { StoryState } from "../app/lib/story";

const endpoint = `${firstLesson}/reader`;
const firstCompleted = 1700000000000;
const lastCompleted = 1700000010000;
const priorRevision = first.contentRevision - 1;

// Only seed an earlier deployment in the isolated test account/database. Never
// seed success for the current flow. Revision numbers and lesson ID follow data.
function previousDeployment(username: string, phase: string, completed = false, revision = priorRevision) {
  execFileSync("python3", ["-c", `
import glob,json,sqlite3,sys
username,phase,completed,revision,lesson_id=json.loads(sys.argv[1])
for path in glob.glob('.wrangler/playwright/v3/d1/miniflare-D1DatabaseObject/*.sqlite'):
    with sqlite3.connect(path, timeout=20) as db:
        if not db.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='users'").fetchone(): continue
        user=db.execute('SELECT id FROM users WHERE username=?',(username,)).fetchone()
        if not user: continue
        db.execute('''UPDATE lesson_progress SET phase=?,content_revision=?,state_version=50,
          first_completed_at=?,last_completed_at=?,first_completed_content_revision=?,last_completed_content_revision=?
          WHERE user_id=? AND lesson_id=?''',
          (phase,revision,1700000000000 if completed else None,1700000010000 if completed else None,
           1 if completed else None,1 if completed else None,user[0],lesson_id))
        db.commit()
        sys.exit(0)
sys.exit('Isolated test account was not found')
`, JSON.stringify([username, phase, completed, revision, first.id])], { stdio: "pipe" });
}
async function state(page: Page): Promise<StoryState> {
  const response = await page.request.get(endpoint);
  expect(response.status()).toBe(200);
  return (await response.json()).state;
}
const revealForm = (saved: StoryState) => ({ intent: "reveal", attempt_id: saved.attemptId, content_revision: String(saved.contentRevision), occurrence: firstRef });

for (const phase of ["flashcards", "story", "revision-flashcards"]) {
  test(`a content update resets the unfinished ${phase} attempt and rejects old writes`, async ({ page }) => {
    const credentials = await register(page);
    await startReader(page);
    const old = await state(page);
    expect((await post(page.request, endpoint, revealForm(old))).status()).toBe(200);
    previousDeployment(credentials.username, phase);
    await page.reload();
    await expect(page.getByRole("button", { name: "Continue", exact: true })).toBeVisible();
    await expect(page.locator("[data-occurrence]")).toHaveCount(0);
    const reset = await state(page);
    expect(reset).toMatchObject({ contentRevision: first.contentRevision, phase: "introduction", revealed: [], version: 0 });
    expect(reset.attemptId).not.toBe(old.attemptId);
    for (const intent of ["reveal", "finish-reading"]) expect((await post(page.request, endpoint, { ...revealForm(old), intent, content_revision: String(priorRevision) })).status()).toBe(409);
    expect((await post(page.request, firstLesson, { intent: "revision-passed", attempt_id: old.attemptId, content_revision: String(priorRevision) })).status()).toBe(409);
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await expect(page.getByText(`Card 1 of ${first.newCharacters.length} · 0 missed this round`, { exact: true })).toBeVisible();
    await page.goto("/lessons");
    await expect(lessonCard(page, nextTitle).getByText("Available", { exact: true })).toBeVisible();
  });
}
for (const phase of ["complete", "story"]) {
  test(`a content update preserves earned dates/revisions and later access for ${phase}`, async ({ page }) => {
    const credentials = await register(page);
    await startReader(page);
    const old = await state(page);
    previousDeployment(credentials.username, phase, true);
    await page.reload();
    await expect(page.getByRole("heading", { name: phase === "complete" ? "Lesson complete" : "Meet your new characters", exact: true })).toBeVisible();
    const reset = await state(page);
    expect(reset.phase).toBe(phase === "complete" ? "complete" : "introduction");
    expect(reset.contentRevision).toBe(first.contentRevision);
    expect(reset.attemptId).not.toBe(old.attemptId);
    expect(reset.revealed).toEqual([]);
    const milestones = page.locator('[aria-label="Completion milestones"]');
    await expect(milestones.locator("dd")).toHaveText([
      `${new Date(firstCompleted).toISOString()} · content revision 1`,
      `${new Date(lastCompleted).toISOString()} · content revision 1`,
    ]);
    if (phase === "story") {
      await page.getByRole("button", { name: "Continue", exact: true }).click();
      await expect(page.getByRole("heading", { name: "Practice round", exact: true })).toBeVisible();
      expect((await post(page.request, firstLesson, { intent: "deck-passed", attempt_id: reset.attemptId })).status()).toBe(303);
      expect((await post(page.request, endpoint, { intent: "finish-reading", attempt_id: reset.attemptId, content_revision: String(first.contentRevision) })).status()).toBe(200);
      await page.reload();
      await expect(milestones.locator("dd").first()).toHaveText(`${new Date(firstCompleted).toISOString()} · content revision 1`);
      await expect(milestones.locator("dd").last()).toContainText(`content revision ${first.contentRevision}`);
    }
    await page.goto("/lessons");
    await expect(lessonCard(page, firstTitle).getByText("Completed", { exact: true })).toBeVisible();
    await expect(lessonCard(page, nextTitle).getByText("Available", { exact: true })).toBeVisible();
    expect((await page.request.get(lessonPath(lessons[1]))).status()).toBe(200);
  });
}

test("an older deployment refuses newer attempts without clearing saved reveals", async ({ page }) => {
  const credentials = await register(page);
  await startReader(page);
  const old = await state(page);
  expect((await post(page.request, endpoint, revealForm(old))).status()).toBe(200);
  previousDeployment(credentials.username, "story", false, first.contentRevision + 1);
  expect((await page.request.get(endpoint)).status()).toBe(409);
  expect((await page.request.get(endpoint)).status()).toBe(409);
  previousDeployment(credentials.username, "story", false, first.contentRevision);
  expect(await state(page)).toMatchObject({ attemptId: old.attemptId, revealed: [firstRef] });
});

test("trailing-slash lesson URLs save and finish using the canonical resource endpoint", async ({ page }) => {
  await register(page);
  await startReader(page);
  await page.goto(`${firstLesson}/`);
  const target = page.locator(`[data-occurrence="${firstRef}"]`);
  await target.click();
  await expect(target).toHaveAttribute("data-save-state", "saved");
  await page.getByRole("button", { name: "Finish reading", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Collected revision", exact: true })).toBeVisible();
});
