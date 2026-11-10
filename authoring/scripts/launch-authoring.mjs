import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { lstat, open, readFile, realpath, rename, stat, unlink } from "node:fs/promises";
import { isAbsolute, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { verifySealedRun } from "./authoring-batch.mjs";

const exec = promisify(execFile);
const usage = "Use node authoring/scripts/launch-authoring.mjs <run-dir> [--kind codex] [--dry-run]";

// The runner receives argv, never a shell command, and returns { stdout, stderr }.
const defaultRunner = (file, args, options) => exec(file, args, {
  ...options, encoding: "utf8", maxBuffer: 4 * 1024 * 1024,
});

async function refuseExisting(path) {
  try {
    await lstat(path); // Also refuse a dangling symlink or an interrupted journal.
  } catch (error) {
    if (error.code === "ENOENT") return;
    throw error;
  }
  throw new Error(`Launch already exists at ${path}; inspect it and Herdr state manually. No automatic retries.`);
}

async function regularArtifact(path) {
  if (await realpath(path) !== path || !(await stat(path)).isFile()) {
    throw new Error(`Expected a regular run artifact without symlink redirection: ${path}`);
  }
}

async function prepare(runDir, { cwd, env, runner, validateRun }) {
  if (env.HERDR_ENV !== "1") throw new Error("The authoring launcher requires HERDR_ENV=1 inside Herdr.");
  for (const key of ["HERDR_WORKSPACE_ID", "HERDR_TAB_ID", "HERDR_PANE_ID"]) {
    if (typeof env[key] !== "string" || !env[key].trim()) throw new Error(`Missing caller context: ${key}`);
  }
  const directory = await realpath(resolve(cwd, runDir));
  const journalPath = join(directory, "launch.json");
  await refuseExisting(journalPath);
  const manifestPath = join(directory, "manifest.json");
  await regularArtifact(manifestPath);
  // JSON only: manifest.content is inert scaffold data, not an importable module.
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  if (!manifest || manifest.version !== 1 || !isAbsolute(manifest.repoRoot ?? "")) {
    throw new Error("Expected a version:1 manifest with an absolute repoRoot.");
  }
  if (typeof manifest.baselineHash !== "string" || !manifest.baselineHash.trim()) {
    throw new Error("Manifest requires baselineHash (opaque planner metadata).");
  }
  if (!manifest.content || typeof manifest.content !== "object" || Array.isArray(manifest.content)) {
    throw new Error("Manifest requires a content curriculum scaffold object.");
  }
  if (!Array.isArray(manifest.workers) || !manifest.workers.length) throw new Error("Manifest requires workers.");
  const ids = new Set();
  const lessons = new Set();
  const workers = [];
  for (const worker of manifest.workers) {
    if (!worker || !/^worker-[1-9][0-9]*$/.test(worker.id) || ids.has(worker.id)) {
      throw new Error("Worker IDs must be unique worker-<positive integer> names.");
    }
    ids.add(worker.id);
    if (!Array.isArray(worker.lessonIds) || !worker.lessonIds.length) throw new Error(`${worker.id} requires lessonIds.`);
    for (const id of worker.lessonIds) {
      if (typeof id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || lessons.has(id)) {
        throw new Error("Lesson IDs must be slugs assigned to exactly one worker.");
      }
      lessons.add(id);
    }
    const assignmentPath = join(directory, worker.id, "assignment.md");
    await regularArtifact(assignmentPath);
    if (!(await stat(assignmentPath)).size) throw new Error(`Empty assignment: ${assignmentPath}`);
    workers.push({ id: worker.id, lessonIds: worker.lessonIds, assignmentPath });
  }
  const callerCwd = await realpath(cwd);
  const { stdout } = await runner("git", ["rev-parse", "--show-toplevel"], { cwd: callerCwd, env });
  const repoRoot = await realpath(stdout.trim());
  if (await realpath(manifest.repoRoot) !== repoRoot) {
    throw new Error("Manifest repoRoot does not match the caller's current Git repository; refusing cwd redirection.");
  }
  await validateRun(directory);
  return { directory, journalPath, repoRoot, baselineHash: manifest.baselineHash, workers };
}

function commandPlan(workers, { repoRoot, workspaceId, kind, launchId }) {
  const commands = [{
    id: "tab", file: "herdr",
    args: ["tab", "create", "--workspace", workspaceId, "--cwd", repoRoot, "--label", `author-${launchId.slice(0, 12)}`, "--no-focus"],
    capture: "@pane-1",
  }];
  // Split subtrees in half, alternating axes. Unlike splitting the newest pane
  // repeatedly, depth is ceil(log2(n)); odd counts differ by at most one leaf.
  // Midpoint splits avoid assuming undocumented --ratio orientation semantics.
  function split(start, count, pane, depth) {
    if (count === 1) {
      workers[start].paneRef = pane;
      return;
    }
    const left = Math.ceil(count / 2);
    const next = `@pane-${start + left + 1}`;
    commands.push({
      id: `split-${commands.length}`, file: "herdr",
      args: ["pane", "split", "--pane", pane, "--direction", depth % 2 ? "down" : "right", "--cwd", repoRoot, "--no-focus"],
      capture: next,
    });
    split(start, left, pane, depth + 1);
    split(start + left, count - left, next, depth + 1);
  }
  split(0, workers.length, "@pane-1", 0);
  workers.forEach((worker, index) => {
    worker.agentName = `auth-${launchId.slice(0, 12)}-${(index + 1).toString(36)}`;
    commands.push({
      id: `start-${worker.id}`, file: "herdr", workerId: worker.id,
      args: ["agent", "start", worker.agentName, "--kind", kind, "--pane", worker.paneRef],
    }, {
      id: `prompt-${worker.id}`, file: "herdr", workerId: worker.id,
      args: ["agent", "prompt", worker.agentName,
        `First read your run assignment file at ${JSON.stringify(worker.assignmentPath)}. Follow that assignment and the repository's AGENTS.md and CLAUDE.md instructions. You are ${worker.id}; your assigned lesson IDs are ${worker.lessonIds.join(", ")}.`],
    });
  });
  return commands;
}

function responseId(value, label) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`Herdr response is missing ${label}; inspect state before retrying.`);
  return value;
}

// Exclusive creation is the relaunch lock. Later updates use atomic replacement;
// each command is durably recorded as running BEFORE any external side effect.
async function writeJournal(path, journal, initial = false) {
  const temporary = initial ? path : `${path}.${randomUUID()}.tmp`;
  const file = await open(temporary, "wx", 0o600);
  try {
    await file.writeFile(`${JSON.stringify(journal, null, 2)}\n`);
    await file.sync();
  } finally {
    await file.close();
  }
  if (!initial) {
    try { await rename(temporary, path); }
    finally { await unlink(temporary).catch((error) => { if (error.code !== "ENOENT") throw error; }); }
  }
}

/**
 * Launch a trusted local plan. Inject runner/cwd/env to test without Herdr.
 * A dry run only reads artifacts/Git and returns symbolic argv commands; it
 * neither calls Herdr nor writes launch.json. The planner verifies its seal,
 * baseline hash and curriculum metadata before any Herdr mutation.
 */
export async function launchAuthoring(runDir, {
  kind = "codex", dryRun = false, cwd = process.cwd(), env = process.env, runner = defaultRunner,
  validateRun = verifySealedRun,
} = {}) {
  if (typeof runDir !== "string" || !runDir) throw new Error(usage);
  if (typeof kind !== "string" || !/^[a-z][a-z0-9-]*$/.test(kind)) throw new Error("Invalid agent kind.");
  const prepared = await prepare(runDir, { cwd, env, runner, validateRun });
  const { directory, journalPath, repoRoot, baselineHash, workers } = prepared;
  const launchId = randomUUID().replaceAll("-", "");
  const workspaceId = env.HERDR_WORKSPACE_ID;
  const commands = commandPlan(workers, { repoRoot, workspaceId, kind, launchId });
  const journal = {
    version: 1, launchId, status: dryRun ? "dry-run" : "launching", runDir: directory,
    repoRoot, baselineHash, kind, workspaceId,
    caller: { tabId: env.HERDR_TAB_ID, paneId: env.HERDR_PANE_ID },
    workers, references: {}, commands: commands.map((command) => ({ ...command, status: "planned" })),
  };
  if (dryRun) return journal;
  await writeJournal(journalPath, journal, true); // wx closes the concurrent-launch race.
  try {
    for (const command of journal.commands) {
      command.resolvedArgs = command.args.map((arg) => {
        if (!arg.startsWith("@pane-")) return arg;
        return responseId(journal.references[arg], arg);
      });
      command.status = "running";
      await writeJournal(journalPath, journal);
      const { stdout, stderr } = await runner(command.file, command.resolvedArgs, { cwd: repoRoot, env });
      command.stdout = stdout;
      command.stderr = stderr ?? "";
      const response = JSON.parse(stdout);
      if (response.error || response.ok === false || response.success === false) {
        throw new Error(`Herdr rejected ${command.id}: ${JSON.stringify(response)}`);
      }
      if (!response.result || typeof response.result !== "object") throw new Error(`Missing Herdr result for ${command.id}.`);
      if (command.id === "tab") {
        journal.tabId = responseId(response.result.tab?.tab_id, "result.tab.tab_id");
        journal.references[command.capture] = responseId(response.result.root_pane?.pane_id, "result.root_pane.pane_id");
      } else if (command.capture) {
        journal.references[command.capture] = responseId(response.result.pane?.pane_id, "result.pane.pane_id");
      }
      for (const worker of workers) {
        if (journal.references[worker.paneRef]) worker.paneId = journal.references[worker.paneRef];
      }
      command.status = "succeeded";
      await writeJournal(journalPath, journal);
    }
    journal.status = "complete";
    await writeJournal(journalPath, journal);
    return journal;
  } catch (error) {
    journal.status = "failed";
    journal.error = error.message;
    const active = journal.commands.find((command) => command.status === "running");
    if (active) {
      active.status = "failed";
      active.error = error.message;
      if (error.stdout !== undefined) active.stdout = String(error.stdout);
      if (error.stderr !== undefined) active.stderr = String(error.stderr);
    }
    try { await writeJournal(journalPath, journal); }
    catch (journalError) { error.message += `; could not update journal: ${journalError.message}`; }
    throw new Error(`Launch stopped: ${error.message}. Inspect ${journalPath} and Herdr state; do not blindly retry.`, { cause: error });
  }
}

export async function main(args = process.argv.slice(2), options = {}) {
  const [runDir, ...rest] = args;
  if (!runDir || runDir.startsWith("--")) throw new Error(usage);
  let kind = "codex";
  let dryRun = false;
  const seen = new Set();
  while (rest.length) {
    const flag = rest.shift();
    if (seen.has(flag)) throw new Error(usage);
    seen.add(flag);
    if (flag === "--dry-run") dryRun = true;
    else if (flag === "--kind" && rest[0] && !rest[0].startsWith("--")) kind = rest.shift();
    else throw new Error(usage);
  }
  const result = await launchAuthoring(runDir, { ...options, kind, dryRun });
  (options.output ?? console.log)(JSON.stringify(result, null, 2));
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
