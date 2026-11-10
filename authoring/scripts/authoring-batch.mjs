import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, rename, unlink } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { loadContent, repoRoot } from "./load-content.mjs";
import { authoringBrief, nextLessonSpec } from "./authoring-policy.mjs";
import { validatePlannedLessons, validatePublishedCurriculum } from "./content-tools.mjs";

const hash = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const allLessons = (content) => content.modules.flatMap((module) => module.lessons);
const json = async (path) => JSON.parse(await readFile(path, "utf8"));
export const quoteShellArgument = (value) => `'${value.replaceAll("'", "'\\''")}'`;
async function save(path, value) {
  const temporary = `${path}.tmp`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, { flag: "wx" });
  await rename(temporary, path);
}
function requireValid(result) {
  if (result.errors.length) throw new Error(result.errors.join("\n"));
  return result;
}
async function current() { return (await loadContent("app/content/curriculum.ts")).curriculum; }

/** Only allocation lives here; nextLessonSpec owns sequence/checkpoint rules. */
export function makeBatch(baseline, counts, root = repoRoot) {
  requireValid(validatePublishedCurriculum(baseline));
  if (!Array.isArray(counts) || !counts.length || counts.some((n) => !Number.isSafeInteger(n) || n < 1)) {
    throw new Error("Each worker needs a positive safe integer lesson count");
  }
  const content = structuredClone(baseline);
  const workers = [];
  const known = new Set([...content.modules.map((module) => module.id), ...allLessons(content).map((lesson) => lesson.id)]);
  for (const [index, count] of counts.entries()) {
    const worker = { id: `worker-${index + 1}`, lessonIds: [] };
    workers.push(worker);
    for (let i = 0; i < count; i++) {
      const spec = nextLessonSpec(content);
      const id = `${spec.kind === "learning" ? "learning" : "revision"}-${spec.learningNumber}`;
      if (known.has(id)) throw new Error(`Generated ID collision: ${id}`);
      known.add(id);
      content.modules.at(-1).lessons.push({
        id, title: `${spec.kind} ${spec.learningNumber}`, description: "Planned authoring draft",
        kind: spec.kind, contentRevision: 1,
        // No guessed pronunciations. The coordinator authors these before sealing.
        newCharacters: spec.introductions.map((hanzi) => ({ id: hanzi, hanzi, pinyin: [] })),
      });
      worker.lessonIds.push(id);
    }
  }
  return { version: 1, repoRoot: root, baselineHash: hash(baseline), content, workers };
}

function checkAllocation(manifest, baseline) {
  if (manifest.version !== 1 || resolve(manifest.repoRoot) !== resolve(repoRoot)) throw new Error("Wrong batch version/repository");
  if (manifest.baselineHash !== hash(baseline)) throw new Error("Published curriculum changed; create a fresh plan");
  const oldLessons = allLessons(baseline), lessons = allLessons(manifest.content);
  if (manifest.content.modules.length !== baseline.modules.length) throw new Error("Batch may only append to the last module");
  for (const [index, module] of baseline.modules.entries()) {
    const planned = manifest.content.modules[index];
    if (module.id !== planned.id || module.title !== planned.title ||
        (index < baseline.modules.length - 1 && hash(module) !== hash(planned))) throw new Error("Baseline modules changed");
  }
  if (hash(lessons.slice(0, oldLessons.length)) !== hash(oldLessons)) throw new Error("Baseline lessons changed");
  const assigned = manifest.workers.flatMap((worker, index) => {
    if (worker.id !== `worker-${index + 1}` || !worker.lessonIds.length) throw new Error("Invalid worker allocation");
    return worker.lessonIds;
  });
  if (!assigned.length || new Set(assigned).size !== assigned.length || hash(assigned) !== hash(lessons.slice(oldLessons.length).map((lesson) => lesson.id))) {
    throw new Error("Workers must partition appended lessons in order, without gaps or duplicates");
  }
  if (lessons.slice(oldLessons.length).some((lesson) => lesson.story !== undefined || lesson.contentRevision !== 1)) {
    throw new Error("The shared plan contains metadata only; new lessons must start at revision 1");
  }
  // Future definitions must also remain compatible with existing occurrences.
  requireValid(validatePlannedLessons(manifest.content, oldLessons.map((lesson) => lesson.id)));
}

export async function verifySealedRun(directory, baseline = undefined) {
  const manifest = await json(join(directory, "manifest.json"));
  const { seal, ...payload } = manifest;
  if (!seal || seal !== hash(payload)) throw new Error("Run is unsealed or its plan changed; do not launch or check it");
  checkAllocation(manifest, baseline ?? await current());
  for (const worker of manifest.workers) {
    for (const filename of ["assignment.md", "briefs.json"]) {
      const key = `${worker.id}/${filename}`;
      if (hash(await readFile(join(directory, key), "utf8")) !== manifest.artifacts?.[key]) {
        throw new Error(`Immutable run artifact changed: ${key}; create a fresh run`);
      }
    }
    const briefs = await json(join(directory, worker.id, "briefs.json"));
    if (hash(briefs) !== hash(worker.lessonIds.map((id) => authoringBrief(manifest.content, id)))) {
      throw new Error("Authoring rules changed since briefs were generated; create a fresh run");
    }
  }
  return manifest;
}

export async function planRun(directory, counts) {
  const manifest = makeBatch(await current(), counts);
  await mkdir(directory, { recursive: false }); // Refuse reuse; never overwrite a run.
  await writeFile(join(directory, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, { flag: "wx" });
  return { status: "needs-authored-readings", directory, workers: manifest.workers };
}

export async function sealRun(directory) {
  const path = join(directory, "manifest.json"), manifest = await json(path);
  if (manifest.seal) throw new Error("Already sealed; create a fresh run to change the plan");
  checkAllocation(manifest, await current());
  for (const worker of manifest.workers) {
    const workerDir = join(directory, worker.id);
    await mkdir(workerDir);
    const briefs = worker.lessonIds.map((id) => authoringBrief(manifest.content, id));
    await save(join(workerDir, "briefs.json"), briefs);
    const metadata = allLessons(manifest.content).filter((lesson) => worker.lessonIds.includes(lesson.id));
    await save(join(workerDir, "lessons.json"), metadata);
    await writeFile(join(workerDir, "assignment.md"), `# ${worker.id}\n\nRead authoring/parallel-authoring.md (worker instructions) and all required authoring references.\n\nYour run: ${JSON.stringify(directory)}\nYour lessons in order: ${worker.lessonIds.join(", ")}\n\nRead only your briefs.json and lessons.json, not manifest.json or other stories. Author full lessons in your lessons.json; keep assigned IDs, kinds, revisions and introductions unchanged. Save self-review and pronunciation sources in review.md in this directory.\n\nCheck one completed story without waiting for the rest:\n\n\`\`\`sh\nnode authoring/scripts/authoring-batch.mjs check ${quoteShellArgument(directory)} --worker ${worker.id} --lesson LESSON_ID\n\`\`\`\n\nReplace LESSON_ID with an assigned ID. Finish by checking all your assigned lessons (omit --lesson). Revise and rerun until hard checks pass; report warnings honestly. Do not edit shared code, plan, assignments, published content or other workers' files.\n`, { flag: "wx" });
  }
  manifest.artifacts = {};
  for (const worker of manifest.workers) {
    for (const filename of ["assignment.md", "briefs.json"]) {
      const key = `${worker.id}/${filename}`;
      manifest.artifacts[key] = hash(await readFile(join(directory, key), "utf8"));
    }
  }
  manifest.seal = hash(manifest);
  await save(path, manifest);
  return { status: "sealed", directory, workers: manifest.workers };
}

export function applyWorkerLessons(manifest, worker, drafts) {
  if (!Array.isArray(drafts) || hash(drafts.map((lesson) => lesson.id)) !== hash(worker.lessonIds)) throw new Error("Worker output must contain exactly its assigned lessons, in order");
  const planned = new Map(allLessons(manifest.content).map((lesson) => [lesson.id, lesson]));
  for (const lesson of drafts) {
    const before = planned.get(lesson.id);
    for (const key of ["id", "kind", "contentRevision", "newCharacters"]) {
      if (hash(lesson[key]) !== hash(before[key])) throw new Error(`${lesson.id}: frozen ${key} changed; create a fresh plan instead`);
    }
  }
  const byId = new Map(drafts.map((lesson) => [lesson.id, lesson]));
  return { modules: manifest.content.modules.map((module) => ({ ...module, lessons: module.lessons.map((lesson) => byId.get(lesson.id) ?? lesson) })) };
}

export async function checkRun(directory, { workerId, lessonId, collect = false } = {}) {
  if (collect) {
    // A failed recollection must not leave an older result looking current.
    await unlink(join(directory, "candidate.json")).catch((error) => { if (error.code !== "ENOENT") throw error; });
  }
  const manifest = await verifySealedRun(directory);
  let content = manifest.content;
  let selected;
  if (collect) {
    for (const worker of manifest.workers) {
      content = applyWorkerLessons({ ...manifest, content }, worker, await json(join(directory, worker.id, "lessons.json")));
    }
    const result = requireValid(validatePublishedCurriculum(content));
    await save(join(directory, "candidate.json"), content);
    return { status: "combined-candidate-checked-not-published", ...result };
  }
  const worker = manifest.workers.find((entry) => entry.id === workerId);
  if (!worker) throw new Error("Specify a known --worker worker-N");
  if (lessonId && !worker.lessonIds.includes(lessonId)) throw new Error("Lesson is not owned by this worker");
  content = applyWorkerLessons(manifest, worker, await json(join(directory, worker.id, "lessons.json")));
  selected = lessonId ? [lessonId] : worker.lessonIds;
  return { status: "scoped-drafts-checked-not-publication", ...requireValid(validatePlannedLessons(content, selected)) };
}

export async function main(args = process.argv.slice(2)) {
  const [command, ...rest] = args;
  const options = {};
  let directory;
  if (command !== "plan") directory = rest.shift();
  while (rest.length) {
    const flag = rest.shift();
    if (!["--out", "--agents", "--lessons-per-agent", "--counts", "--worker", "--lesson"].includes(flag) || !rest[0] || rest[0].startsWith("--") || options[flag] !== undefined) throw new Error("Unknown, duplicate or incomplete option");
    options[flag] = rest.shift();
  }
  const permitted = command === "plan" ? ["--out", "--agents", "--lessons-per-agent", "--counts"]
    : command === "check" ? ["--worker", "--lesson"] : [];
  if (Object.keys(options).some((key) => !permitted.includes(key))) throw new Error("Option is not valid for this command");
  let result;
  if (command === "plan") {
    if (options["--counts"] && (options["--agents"] || options["--lessons-per-agent"])) throw new Error("Use --counts OR --agents with --lessons-per-agent");
    const agents = Number(options["--agents"] ?? 4), count = Number(options["--lessons-per-agent"] ?? 11);
    if (!Number.isSafeInteger(agents) || agents < 1) throw new Error("Invalid agent count");
    const counts = options["--counts"] ? options["--counts"].split(",").map(Number) : Array(agents).fill(count);
    if (!options["--out"]) throw new Error("plan requires --out <new-run-directory>");
    result = await planRun(resolve(options["--out"]), counts);
  } else if (directory && ["seal", "check", "collect"].includes(command)) {
    directory = resolve(directory);
    result = command === "seal" ? await sealRun(directory) : await checkRun(directory, { workerId: options["--worker"], lessonId: options["--lesson"], collect: command === "collect" });
  } else throw new Error("Use plan --out PATH [--agents N --lessons-per-agent N | --counts N,N], seal PATH, check PATH --worker worker-N [--lesson ID], or collect PATH");
  console.log(JSON.stringify(result, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
