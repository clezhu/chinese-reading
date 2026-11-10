import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { lstat, mkdir, mkdtemp, readFile, realpath, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { launchAuthoring, main } from "../scripts/launch-authoring.mjs";

async function fixture(t, count = 1) {
  const temporary = await mkdtemp(join(tmpdir(), "authoring launcher-"));
  t.after(() => rm(temporary, { recursive: true, force: true }));
  const repoRoot = await realpath(temporary);
  const runDir = join(repoRoot, "run with 'quotes; and spaces");
  await mkdir(runDir);
  const manifest = {
    version: 1, repoRoot, baselineHash: "planner-owned-content-hash",
    content: { modules: [], inert: "throw new Error('do not execute scaffold')" },
    workers: Array.from({ length: count }, (_, i) => ({ id: `worker-${i + 1}`, lessonIds: [`lesson-${i + 1}`] })),
    unrelatedPlannerMetadata: { allowed: true },
  };
  for (const worker of manifest.workers) {
    await mkdir(join(runDir, worker.id));
    await writeFile(join(runDir, worker.id, "assignment.md"), `# ${worker.id}\nRead repository instructions.\n`);
  }
  const saveManifest = () => writeFile(join(runDir, "manifest.json"), JSON.stringify(manifest));
  await saveManifest();
  const env = Object.freeze({
    HERDR_ENV: "1", HERDR_WORKSPACE_ID: "caller's-workspace", HERDR_TAB_ID: "caller's-tab", HERDR_PANE_ID: "caller's-pane",
    PATH: "/deliberately/not/a/real/herdr/path", HERDR_SOCKET: "inherited-session-socket",
  });
  const calls = [];
  let panes = 0;
  let hook;
  const runner = async (file, args, options) => {
    const call = { file, args, options };
    calls.push(call);
    if (hook) await hook(call);
    if (file === "git") {
      assert.deepEqual(args, ["rev-parse", "--show-toplevel"]);
      return { stdout: `${repoRoot}\n` };
    }
    assert.equal(file, "herdr");
    assert.equal(options.cwd, repoRoot);
    assert.equal(options.env, env); // Keep socket/session and caller context intact.
    assert.equal(options.shell, undefined);
    if (args[0] === "tab" && args[1] === "create") {
      return { stdout: JSON.stringify({ result: { tab: { tab_id: "new-tab-from-server" }, root_pane: { pane_id: `opaque-pane-${++panes}` } } }) };
    }
    if (args[0] === "pane" && args[1] === "split") {
      return { stdout: JSON.stringify({ result: { pane: { pane_id: `opaque-pane-${++panes}` } } }) };
    }
    assert.ok(args[0] === "agent" && ["start", "prompt"].includes(args[1]));
    return { stdout: JSON.stringify({ result: { submitted: true } }) };
  };
  // Layout fixtures deliberately contain no curriculum; planner validation has
  // its own integration tests. Inject the boundary, never bypass it in the CLI.
  const options = { cwd: repoRoot, env, runner, validateRun: async () => {} };
  return {
    repoRoot, runDir, manifest, saveManifest, calls, env, options,
    setHook(fn) { hook = fn; },
    journal: async () => JSON.parse(await readFile(join(runDir, "launch.json"), "utf8")),
  };
}

function assertBalanced(commands, count) {
  const root = {};
  const leaves = new Map([["opaque-pane-1", root]]);
  let next = 1;
  for (const command of commands.filter((c) => c.args[0] === "pane")) {
    const args = command.resolvedArgs;
    const oldId = args[args.indexOf("--pane") + 1];
    const node = leaves.get(oldId);
    assert.ok(node && !node.children, "split must target an existing leaf, never the caller");
    node.direction = args[args.indexOf("--direction") + 1];
    node.children = [{}, {}];
    leaves.set(oldId, node.children[0]);
    leaves.set(`opaque-pane-${++next}`, node.children[1]);
  }
  function visit(node, depth = 0) {
    if (!node.children) {
      assert.ok(depth <= Math.ceil(Math.log2(count)));
      return 1;
    }
    assert.equal(node.direction, depth % 2 ? "down" : "right");
    const [left, right] = node.children.map((child) => visit(child, depth + 1));
    assert.ok(Math.abs(left - right) <= 1);
    return left + right;
  }
  assert.equal(visit(root), count);
}

for (const count of [1, 4, 3, 5, 9]) {
  test(`${count} worker(s): balanced background layout, explicit cwd/context, named agents and assignment prompts`, async (t) => {
    const f = await fixture(t, count);
    const result = await launchAuthoring(f.runDir, f.options);
    const calls = f.calls.filter((c) => c.file === "herdr");
    assert.equal(calls.length, 3 * count);
    assert.equal(result.status, "complete");
    assert.equal(result.tabId, "new-tab-from-server");
    assert.deepEqual(result.caller, { tabId: f.env.HERDR_TAB_ID, paneId: f.env.HERDR_PANE_ID });
    assert.equal(result.baselineHash, f.manifest.baselineHash);
    const creations = calls.filter((c) => c.args[0] !== "agent");
    assert.equal(creations.length, count);
    for (const { args } of creations) {
      assert.ok(args.includes("--no-focus"));
      assert.equal(args[args.indexOf("--cwd") + 1], f.repoRoot);
    }
    assert.equal(creations[0].args[0], "tab");
    assert.equal(creations[0].args[creations[0].args.indexOf("--workspace") + 1], f.env.HERDR_WORKSPACE_ID);
    for (const { args } of calls) {
      assert.ok(!args.includes("--focus") && !args.includes("focus"));
      assert.ok(!args.includes("--current") && !args.includes("--env"));
      assert.ok(!args.includes("workspace") && !args.includes("worktree"));
      assert.ok(!args.includes(f.env.HERDR_PANE_ID) && !args.includes(f.env.HERDR_TAB_ID));
      assert.ok(!args.some((arg) => arg.startsWith("@pane-")));
    }
    const starts = calls.filter((c) => c.args[1] === "start");
    const prompts = calls.filter((c) => c.args[1] === "prompt");
    assert.equal(starts.length, count);
    assert.equal(prompts.length, count);
    assert.equal(new Set(starts.map((c) => c.args[2])).size, count);
    assert.equal(new Set(result.workers.map((w) => w.paneId)).size, count);
    result.workers.forEach((worker, index) => {
      assert.match(worker.agentName, /^[a-z][a-z0-9_-]{0,31}$/);
      assert.ok(worker.agentName.length < 26);
      assert.deepEqual(starts[index].args, ["agent", "start", worker.agentName, "--kind", "codex", "--pane", worker.paneId]);
      assert.deepEqual(prompts[index].args.slice(0, 3), ["agent", "prompt", worker.agentName]);
      assert.match(prompts[index].args[3], /^First read your run assignment file/);
      assert.ok(prompts[index].args[3].includes(JSON.stringify(join(f.runDir, worker.id, "assignment.md"))));
      assert.ok(prompts[index].args[3].includes(worker.lessonIds[0]));
      assert.equal(prompts[index].args.length, 4, "do not wait for one worker to finish before launching the next");
    });
    assertBalanced(result.commands, count);
    assert.ok(result.commands.every((c) => c.status === "succeeded"));
    assert.deepEqual(await f.journal(), result);
    assert.equal((await lstat(join(f.runDir, "launch.json"))).mode & 0o777, 0o600);
  });
}

test("CLI dry run prints a symbolic command plan, honors kind, and has no Herdr or filesystem mutations", async (t) => {
  const f = await fixture(t, 5);
  const before = await readdir(f.runDir, { recursive: true });
  let output;
  const result = await main([f.runDir, "--kind", "pi", "--dry-run"], { ...f.options, output: (text) => { output = text; } });
  assert.deepEqual(JSON.parse(output), result);
  assert.equal(result.status, "dry-run");
  assert.equal(result.commands.length, 15);
  assert.equal(result.commands.filter((c) => c.args[1] === "start").length, 5);
  assert.ok(result.commands.filter((c) => c.args[1] === "start").every((c) => c.args.includes("pi")));
  assert.ok(result.commands.some((c) => c.args.includes("@pane-1")));
  assert.deepEqual(f.calls.map((c) => c.file), ["git"]);
  assert.deepEqual(await readdir(f.runDir, { recursive: true }), before);
  await assert.rejects(lstat(join(f.runDir, "launch.json")), { code: "ENOENT" });
});

test("kind override launches that kind; names differ between separate runs", async (t) => {
  const a = await fixture(t);
  const b = await fixture(t);
  const first = await launchAuthoring(a.runDir, { ...a.options, kind: "claude" });
  const second = await launchAuthoring(b.runDir, b.options);
  assert.ok(first.commands.find((c) => c.args[1] === "start").args.includes("claude"));
  assert.notEqual(first.workers[0].agentName, second.workers[0].agentName);
});

test("invocation in a repository subdirectory still launches at the verified repo root", async (t) => {
  const f = await fixture(t);
  const cwd = join(f.repoRoot, "nested");
  await mkdir(cwd);
  const result = await launchAuthoring(f.runDir, { ...f.options, cwd });
  assert.equal(result.repoRoot, f.repoRoot);
  assert.equal(f.calls[0].options.cwd, cwd);
});

test("Herdr environment and complete caller context are mandatory, including dry runs", async (t) => {
  const f = await fixture(t);
  for (const key of ["HERDR_ENV", "HERDR_WORKSPACE_ID", "HERDR_TAB_ID", "HERDR_PANE_ID"]) {
    for (const dryRun of [false, true]) {
      await assert.rejects(launchAuthoring(f.runDir, { ...f.options, dryRun, env: { ...f.env, [key]: "" } }), /HERDR_ENV=1|Missing caller context/);
    }
  }
  assert.equal(f.calls.length, 0);
});

test("rejects malformed manifests and ambiguous ownership before any Herdr mutation", async (t) => {
  const changes = [
    (m) => { m.version = 2; },
    (m) => { m.repoRoot = "."; },
    (m) => { delete m.baselineHash; },
    (m) => { m.content = "./executable-scaffold.mjs"; },
    (m) => { m.workers = []; },
    (m) => { m.workers[0].id = "../escape"; },
    (m) => { m.workers[1].id = m.workers[0].id; },
    (m) => { m.workers[0].lessonIds = []; },
    (m) => { m.workers[1].lessonIds = m.workers[0].lessonIds; },
  ];
  for (const change of changes) {
    const f = await fixture(t, 2);
    change(f.manifest);
    await f.saveManifest();
    await assert.rejects(launchAuthoring(f.runDir, f.options));
    assert.equal(f.calls.filter((c) => c.file === "herdr").length, 0);
    await assert.rejects(lstat(join(f.runDir, "launch.json")), { code: "ENOENT" });
  }
});

test("manifest cannot redirect cwd to another repository", async (t) => {
  const f = await fixture(t);
  const other = join(f.repoRoot, "other-repo");
  await mkdir(other);
  f.manifest.repoRoot = other;
  await f.saveManifest();
  await assert.rejects(launchAuthoring(f.runDir, f.options), /refusing cwd redirection/);
  assert.deepEqual(f.calls.map((c) => c.file), ["git"]);
});

test("planner admission failure blocks Herdr and journal creation, including dry runs", async (t) => {
  const f = await fixture(t);
  for (const dryRun of [false, true]) {
    await assert.rejects(launchAuthoring(f.runDir, {
      ...f.options, dryRun, validateRun: async () => { throw new Error("unsealed or stale plan"); },
    }), /unsealed or stale plan/);
  }
  assert.ok(f.calls.every((call) => call.file !== "herdr"));
  await assert.rejects(f.journal(), { code: "ENOENT" });
});

test("requires every assignment and refuses symlink redirection or empty assignments", async (t) => {
  for (const mode of ["missing", "symlink", "empty"]) {
    const f = await fixture(t, 4);
    const path = join(f.runDir, "worker-4", "assignment.md");
    await rm(path);
    if (mode === "symlink") {
      const outside = join(f.repoRoot, "unrelated.md");
      await writeFile(outside, "not an assignment");
      await symlink(outside, path);
    } else if (mode === "empty") await writeFile(path, "");
    await assert.rejects(launchAuthoring(f.runDir, f.options));
    assert.equal(f.calls.length, 0, "validate ALL assignments before even discovering Git");
  }
});

test("each mutation is journaled before execution, and split failure preserves IDs and stops without cleanup/retry", async (t) => {
  const f = await fixture(t, 4);
  let mutations = 0;
  f.setHook(async ({ file, args }) => {
    if (file !== "herdr") return;
    const journal = await f.journal();
    const active = journal.commands.filter((c) => c.status === "running");
    assert.equal(active.length, 1);
    assert.deepEqual(active[0].resolvedArgs, args);
    assert.equal(journal.status, "launching");
    if (++mutations === 3) throw Object.assign(new Error("split response lost"), { stderr: "transport disconnected" });
  });
  await assert.rejects(launchAuthoring(f.runDir, f.options), /do not blindly retry/);
  const journal = await f.journal();
  assert.equal(journal.status, "failed");
  assert.equal(journal.tabId, "new-tab-from-server");
  assert.deepEqual(Object.values(journal.references), ["opaque-pane-1", "opaque-pane-2"]);
  assert.deepEqual(journal.commands.slice(0, 4).map((c) => c.status), ["succeeded", "succeeded", "failed", "planned"]);
  assert.equal(journal.commands[2].stderr, "transport disconnected");
  assert.equal(f.calls.filter((c) => c.file === "herdr").length, 3);
  const calls = f.calls.length;
  for (const dryRun of [false, true]) await assert.rejects(launchAuthoring(f.runDir, { ...f.options, dryRun }), /Launch already exists/);
  assert.equal(f.calls.length, calls);
});

test("agent startup and uncertain prompt failures stop immediately and preserve failure output", async (t) => {
  for (const failAt of ["start", "prompt"]) {
    const f = await fixture(t, 3);
    f.setHook(async ({ file, args }) => {
      if (file === "herdr" && args[0] === "agent" && args[1] === failAt) {
        throw Object.assign(new Error(`agent_${failAt === "start" ? "not_ready" : "prompt_stalled"}`), {
          stdout: "possibly applied", stderr: "inspect blocked/unknown agent",
        });
      }
    });
    await assert.rejects(launchAuthoring(f.runDir, f.options), /Launch stopped/);
    const journal = await f.journal();
    const failed = journal.commands.find((c) => c.status === "failed");
    assert.equal(failed.id, `${failAt}-worker-1`);
    assert.equal(failed.stdout, "possibly applied");
    assert.equal(failed.stderr, "inspect blocked/unknown agent");
    assert.equal(journal.workers[0].paneId, "opaque-pane-1");
    assert.equal(f.calls.filter((c) => c.args[1] === failAt).length, 1);
    assert.ok(journal.commands.find((c) => c.id === "start-worker-2").status === "planned");
  }
});

test("malformed or error JSON is not mistaken for a successful mutation", async (t) => {
  for (const stdout of ["not JSON", '{"result":{"tab":{},"root_pane":{}}}', '{"ok":false,"error":{"code":"bad"}}']) {
    const f = await fixture(t);
    const runner = async (file, args, options) => file === "git"
      ? f.options.runner(file, args, options)
      : { stdout };
    await assert.rejects(launchAuthoring(f.runDir, { ...f.options, runner }), /Launch stopped/);
    const journal = await f.journal();
    assert.equal(journal.status, "failed");
    assert.equal(journal.commands[0].stdout, stdout);
    assert.ok(journal.commands.slice(1).every((c) => c.status === "planned"));
  }
});

test("existing complete, corrupt, and dangling-symlink journals all block relaunch", async (t) => {
  for (const mode of ["complete", "corrupt", "symlink"]) {
    const f = await fixture(t);
    const path = join(f.runDir, "launch.json");
    if (mode === "symlink") await symlink(join(f.runDir, "missing"), path);
    else await writeFile(path, mode === "complete" ? '{"status":"complete"}' : "partial");
    await assert.rejects(launchAuthoring(f.runDir, f.options), /Launch already exists/);
    assert.equal(f.calls.length, 0);
  }
});

test("concurrent launchers cannot both mutate Herdr", async (t) => {
  const f = await fixture(t);
  const results = await Promise.allSettled([launchAuthoring(f.runDir, f.options), launchAuthoring(f.runDir, f.options)]);
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  assert.equal(f.calls.filter((c) => c.file === "herdr" && c.args[0] === "tab").length, 1);
  assert.equal((await f.journal()).status, "complete");
});

test("CLI rejects missing/unknown/duplicate flags before invoking a runner", async () => {
  const options = { runner: () => assert.fail("must not invoke runner") };
  for (const args of [[], ["--dry-run"], ["run", "--kind"], ["run", "--oops"], ["run", "extra"], ["run", "--dry-run", "--dry-run"], ["run", "--kind", "pi", "--kind", "codex"], ["run", "--kind", "bad kind"]]) {
    await assert.rejects(main(args, options), /Use node|Invalid agent kind/);
  }
  const cli = spawnSync(process.execPath, [new URL("../scripts/launch-authoring.mjs", import.meta.url).pathname, "run"], {
    env: { ...process.env, HERDR_ENV: "0" }, encoding: "utf8",
  });
  assert.equal(cli.status, 1);
  assert.equal(cli.stdout, "");
  assert.match(cli.stderr, /requires HERDR_ENV=1/);
});
