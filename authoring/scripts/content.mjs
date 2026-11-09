import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { loadContent } from "./load-content.mjs";
import { validateCurriculum, validatePublishedCurriculum, withDrafts } from "./content-tools.mjs";
import { authoringBrief } from "./authoring-policy.mjs";

export async function main(args = process.argv.slice(2)) {
  const [command, ...rest] = args;
  if (!["bank", "check"].includes(command)) throw new Error("Use bank <lesson-id> [--draft path] or check [--draft path ...]");
  const paths = [];
  let lessonId;
  if (command === "bank") lessonId = rest.shift();
  if (command === "bank" && (!lessonId || lessonId.startsWith("--"))) throw new Error("bank requires a target lesson ID");
  while (rest.length) {
    if (rest.shift() !== "--draft" || !rest[0] || rest[0].startsWith("--")) throw new Error("Expected --draft <trusted-repo-module.ts>");
    paths.push(rest.shift());
  }
  const { curriculum } = await loadContent("app/content/curriculum.ts");
  // A replacement may repair policy violations in the old publication. Check
  // baseline structure, then enforce full policy on the combined candidate.
  // With no drafts, check/build always enforce actual publication policy.
  const baseline = command === "bank" || paths.length
    ? validateCurriculum(curriculum, { policy: "structural", requireStories: command !== "bank" })
    : validatePublishedCurriculum(curriculum);
  if (baseline.errors.length) throw new Error(`Current content is invalid:\n${baseline.errors.join("\n")}`);
  const drafts = [];
  for (const path of paths) {
    const module = await loadContent(path);
    if (module.drafts) drafts.push(...module.drafts);
    else if (module.draft) drafts.push(module.draft);
    else throw new Error(`${path} must export draft or drafts`);
  }
  const content = paths.length ? withDrafts(curriculum, drafts) : curriculum;
  const result = command === "bank" ? validateCurriculum(content, { policy: "structural" }) : validatePublishedCurriculum(content);
  if (result.errors.length) throw new Error(result.errors.join("\n"));
  if (command === "bank") {
    console.log(JSON.stringify(authoringBrief(content, lessonId), null, 2));
    return;
  }
  // Keep revision-kind behaviour checked without adding a published lesson.
  const { revisionLessonFixture } = await loadContent("app/content/fixtures/revision.ts");
  const fixtureResult = validateCurriculum({ modules: [{ id: "fixture-module", title: "Fixture", lessons: [revisionLessonFixture] }] }, { policy: "structural" });
  if (fixtureResult.errors.length) throw new Error(fixtureResult.errors.join("\n"));
  console.log(JSON.stringify({
    status: "checked-author-self-review-required",
    mode: paths.length ? "candidate-over-current" : "published",
    baselineChecked: true,
    baselinePolicy: baseline.policy,
    revisionFixtureChecked: true,
    ...result,
  }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
