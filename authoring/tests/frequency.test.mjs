import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { selectCharacters } from "../scripts/frequency.mjs";

const rows = JSON.parse(readFileSync(new URL("../data/subtlex-ch-characters.json", import.meta.url), "utf8"));

test("UTF-8 dataset retains corpus totals, rankings, and separate variants", () => {
  assert.equal(rows.length, 5936);
  assert.equal(new Set(rows.map((row) => row.hanzi)).size, rows.length);
  assert.equal(rows.reduce((sum, row) => sum + row.count, 0), 46841097);
  rows.forEach((row, index) => {
    assert.equal(row.rank, index + 1);
    assert.equal([...row.hanzi].length, 1);
    assert.ok(row.count > 0 && Number.isInteger(row.count));
    assert.ok(row.contextCount > 0 && row.contextCount <= 6243);
    if (index) assert.ok(rows[index - 1].count >= row.count);
  });
  assert.equal(rows.find((row) => row.hanzi === "这").count, 633842);
  assert.equal(rows.find((row) => row.hanzi === "這").count, 1);
});

test("small candidate windows preserve source ranks and can exclude taught characters", () => {
  assert.deepEqual(selectCharacters(rows, { limit: 3 }).map((row) => row.hanzi), ["我", "的", "你"]);
  assert.deepEqual(selectCharacters(rows, { start: 2, limit: 2, exclude: "的你" }), [
    { rank: 4, hanzi: "是", count: 1172098 },
    { rank: 5, hanzi: "了", count: 993990 },
  ]);
  assert.equal(selectCharacters(rows, { start: 5936 }).length, 1);
  for (const options of [{ start: 0 }, { start: 5937 }, { limit: 201 }, { limit: 1.5 }, { limit: NaN }]) {
    assert.throws(() => selectCharacters(rows, options));
  }
});

test("CLI emits bounded JSON and rejects invalid arguments", () => {
  const script = new URL("../scripts/frequency.mjs", import.meta.url);
  const run = (...args) => spawnSync(process.execPath, [script.pathname, ...args], { encoding: "utf8" });
  const valid = run("--limit", "2");
  assert.equal(valid.status, 0);
  assert.equal(JSON.parse(valid.stdout).length, 2);
  for (const args of [["--limit"], ["--unknown", "1"], ["--limit", "0"], ["--limit", "2", "--limit", "3"]]) {
    const result = run(...args);
    assert.notEqual(result.status, 0);
    assert.equal(result.stdout, "");
  }
});
