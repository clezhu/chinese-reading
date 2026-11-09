import { readFileSync, readdirSync } from "node:fs";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { expect, test } from "@playwright/test";
import { completeRevisionDeck, finishReading, getProgress, lessonStatus, passInitialDeck, revealOccurrence, startFlashcards, startIntroduction, startRevisit, storyState } from "../app/lib/progress.server";
import { candidates, first, firstRef, lessons } from "./content-helpers";
import type { StoryState } from "../app/lib/story";

// Execute the real progress SQL against ephemeral SQLite/JSON1, not a fake
// success DTO. This adapter covers only the D1 methods used by this public seam.
// Browser tests remain authoritative for workerd/D1 concurrency and routing.
function database() {
  const sqlite = new DatabaseSync(":memory:");
  const migrations = new URL("../migrations/", import.meta.url);
  for (const name of readdirSync(migrations).filter((name) => name.endsWith(".sql")).sort()) sqlite.exec(readFileSync(new URL(name, migrations), "utf8"));
  sqlite.prepare("INSERT INTO users VALUES (?, ?, ?, ?)").run("alice", "alice", "unused-test-hash", 1);
  sqlite.prepare("INSERT INTO users VALUES (?, ?, ?, ?)").run("bob", "bob", "unused-test-hash", 1);
  const db = {
    prepare(sql: string) {
      let values: SQLInputValue[] = [];
      return {
        bind(...args: SQLInputValue[]) { values = args; return this; },
        async first() { return sqlite.prepare(sql).get(...values) ?? null; },
        async all() { return { results: sqlite.prepare(sql).all(...values) }; },
        async run() { return { meta: { changes: Number(sqlite.prepare(sql).run(...values).changes) } }; },
      };
    },
  } as unknown as D1Database;
  return { db, close: () => sqlite.close() };
}
async function row(db: D1Database, user = "alice") {
  return (await getProgress(db, user)).find((entry) => entry.lesson_id === first.id)!;
}
async function initialReader(db: D1Database, user = "alice") {
  await startIntroduction(db, user, first.id);
  const started = await row(db, user);
  await startFlashcards(db, user, first.id, started.attempt_id);
  await passInitialDeck(db, user, first.id, started.attempt_id);
  return storyState(await row(db, user));
}
const conflict = (operation: Promise<unknown>) => expect(operation).rejects.toMatchObject({ status: 409 });
const reveal = (db: D1Database, saved: StoryState, ref = firstRef, user = "alice") => revealOccurrence(db, user, first.id, saved.attemptId, saved.contentRevision, ref);
const finish = (db: D1Database, saved: StoryState, user = "alice") => finishReading(db, user, first.id, saved.attemptId, saved.contentRevision);
const pass = (db: D1Database, saved: StoryState, user = "alice") => completeRevisionDeck(db, user, first.id, saved.attemptId, saved.contentRevision);

test("lessons can be completed out of order without changing earlier progress", async () => {
  const { db, close } = database();
  try {
    for (const lesson of [...lessons].reverse()) {
      expect(lessonStatus(lesson.id, await getProgress(db, "alice"))).toBe("available");
      await startIntroduction(db, "alice", lesson.id);
      const started = (await getProgress(db, "alice")).find((entry) => entry.lesson_id === lesson.id)!;
      if (lesson.kind === "learning") {
        await startFlashcards(db, "alice", lesson.id, started.attempt_id);
        await passInitialDeck(db, "alice", lesson.id, started.attempt_id);
      }
      expect((await finishReading(db, "alice", lesson.id, started.attempt_id, lesson.contentRevision)).phase).toBe("complete");
      const progress = await getProgress(db, "alice");
      expect(lessonStatus(lesson.id, progress)).toBe("completed");
      expect(progress).toHaveLength(lessons.length - lessons.indexOf(lesson));
      expect(lessonStatus(lesson.id, await getProgress(db, "bob"))).toBe("available");
    }
  } finally { close(); }
});

test("public progress seam permits unlimited clean-identity rereads and earns milestones only on zero-reveal Finish", async () => {
  const { db, close } = database();
  try {
    let current = await initialReader(db);
    const identities = new Set([current.attemptId]);
    for (let round = 0; round < 4; round++) {
      const ref = candidates.distinct[round % 2].ref;
      await reveal(db, current, ref);
      const frozen = await finish(db, current);
      expect(frozen).toMatchObject({ phase: "revision-flashcards", revealed: [ref] });
      expect(await finish(db, current)).toEqual(frozen);
      const next = await pass(db, frozen);
      expect(next).toMatchObject({ phase: "story", contentRevision: first.contentRevision, revealed: [], version: 0 });
      expect(identities.has(next.attemptId)).toBe(false);
      identities.add(next.attemptId);
      expect(storyState(await row(db))).toEqual(next);
      expect(await row(db)).toMatchObject({ first_completed_at: null, last_completed_at: null, first_completed_content_revision: null, last_completed_content_revision: null });
      expect(lessonStatus(lessons[1].id, await getProgress(db, "alice"))).toBe("available");
      for (const old of [current, frozen]) {
        await conflict(reveal(db, old));
        await conflict(finish(db, old));
        await conflict(pass(db, old));
      }
      expect(storyState(await row(db))).toEqual(next);
      current = next;
    }
    expect(identities.size).toBe(5);
    const completed = await finish(db, current);
    expect(completed).toMatchObject({ phase: "complete", attemptId: current.attemptId, revealed: [] });
    const earned = await row(db);
    expect(earned.first_completed_at).not.toBeNull();
    expect(earned.last_completed_at).toBe(earned.first_completed_at);
    expect(earned.first_completed_content_revision).toBe(first.contentRevision);
    expect(earned.last_completed_content_revision).toBe(first.contentRevision);
    expect(lessonStatus(lessons[1].id, await getProgress(db, "alice"))).toBe("available");
    expect(await finish(db, current)).toEqual(completed);
    expect(await row(db)).toEqual(earned);
  } finally { close(); }
});

test("reread phase/ownership/revision guards reject old or foreign identities without mutating either account", async () => {
  const { db, close } = database();
  try {
    const alice = await initialReader(db);
    const bob = await initialReader(db, "bob");
    await conflict(pass(db, alice));
    await conflict(pass(db, { ...alice, contentRevision: alice.contentRevision + 1 }));
    await reveal(db, alice);
    const frozen = await finish(db, alice);
    await conflict(pass(db, frozen, "bob"));
    await conflict(reveal(db, alice, firstRef, "bob"));
    expect(storyState(await row(db, "bob"))).toEqual(bob);
    const next = await pass(db, frozen);
    await conflict(pass(db, frozen));
    await conflict(pass(db, next));
    await conflict(startRevisit(db, "alice", first.id, next.attemptId));
    expect(storyState(await row(db))).toEqual(next);
    expect((await row(db)).first_completed_at).toBeNull();
  } finally { close(); }
});

test("explicit learning revisit restarts introduction while reread preserves existing completion dates and later access", async () => {
  const { db, close } = database();
  try {
    const initial = await initialReader(db);
    const complete = await finish(db, initial);
    const earned = await row(db);
    await startRevisit(db, "alice", first.id, complete.attemptId);
    const revisit = await row(db);
    expect(storyState(revisit)).toMatchObject({ phase: "introduction", revealed: [], version: 0 });
    expect(revisit.attempt_id).not.toBe(complete.attemptId);
    await startFlashcards(db, "alice", first.id, revisit.attempt_id);
    await passInitialDeck(db, "alice", first.id, revisit.attempt_id);
    const reader = storyState(await row(db));
    await reveal(db, reader);
    const frozen = await finish(db, reader);
    const fresh = await pass(db, frozen);
    const afterPractice = await row(db);
    expect(afterPractice.first_completed_at).toBe(earned.first_completed_at);
    expect(afterPractice.last_completed_at).toBe(earned.last_completed_at);
    expect(afterPractice.first_completed_content_revision).toBe(earned.first_completed_content_revision);
    expect(afterPractice.last_completed_content_revision).toBe(earned.last_completed_content_revision);
    expect(lessonStatus(lessons[1].id, await getProgress(db, "alice"))).toBe("available");
    await finish(db, fresh);
    const latest = await row(db);
    expect(latest.first_completed_at).toBe(earned.first_completed_at);
    expect(latest.last_completed_at!).toBeGreaterThanOrEqual(earned.last_completed_at!);
  } finally { close(); }
});
