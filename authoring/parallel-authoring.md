# Parallel lesson authoring

This is an adapter around the existing offline authoring system, not another
curriculum policy. Read `README.md`, `PRONUNCIATION.md`, `data/README.md` and
`../app/content/README.md` first. `authoring-policy.mjs` owns scheduling and
`content-tools.mjs` owns validation. No rule is copied into the launcher or skill.

## Coordinator workflow

Run from the repository root, on Node >=22.12 with dependencies installed.
Creating the skill does not authorize launching an authoring batch. Launch only
when the user requests the batch. Defaults are four agents and eleven lessons
each; **revision checkpoints count as lessons**. Arbitrary positive counts work
within the frequency dataset and available terminal resources. Do not promise
that arbitrarily many panes will fit on screen.

### 1. Plan without launching

Choose a fresh run directory; keep unfinished drafts until deliberately archived.
The ignored `.authoring-runs/` directory is suitable for temporary runs:

```sh
mkdir -p .authoring-runs
node authoring/scripts/authoring-batch.mjs plan \
  --out .authoring-runs/my-batch --agents 4 --lessons-per-agent 11
# Alternatively, uneven workloads (mutually exclusive with the two flags above):
# ... plan --out .authoring-runs/my-batch --counts 3,7,11
```

The manifest appends lessons after the current publication in the existing last
module. Workers receive consecutive, disjoint slices of the global sequence.
Checkpoint placement does not restart at worker boundaries. A batch can end
before a checkpoint; the normal scheduler determines what remains pending.
New IDs are `learning-N` and `revision-N`, where N is the global learning number;
collisions fail rather than silently renaming lessons.

### 2. Author metadata, then seal

In `manifest.json`, author complete `newCharacters[].pinyin` lists for every new
learning lesson using the pronunciation references. They start empty on purpose:
neither frequency data nor a spelling validator establishes dictionary readings.
Use small frequency/reference windows. Do not guess readings or fill placeholder
`a` lists. Record consulted sources in a run-level `readings-review.md`.

Keep character groups, lesson order, IDs, kinds and revision numbers as planned.
Titles/descriptions may be made meaningful now or by workers later. Baseline
stories and definitions are frozen. Do not read earlier story text to construct
new stories. The checker checks new definitions against existing occurrences
without requiring the writer to read those stories.

```sh
node authoring/scripts/authoring-batch.mjs seal .authoring-runs/my-batch
```

Sealing validates all metadata and compatibility with the current baseline, then
creates each worker's `assignment.md`, `briefs.json` and `lessons.json`. Briefs
come directly from `authoringBrief()` and contain no earlier story text. The
manifest has a seal over its content; edits invalidate it. A changed publication,
changed introductions/readings, or an interrupted seal requires a fresh run,
not editing the hash or patching other workers' briefs. JSON is local draft data;
no executable draft modules are loaded by this adapter.

### 3. Launch in Herdr

Read the installed **herdr** skill. Verify `HERDR_ENV=1`; if absent, stop rather
than controlling somebody else's focused Herdr session. Discover installed
syntax using `herdr --help`, `herdr tab`, `herdr pane`, `herdr agent` and check
`herdr status`. The launcher uses the CLI validated during implementation; if
the installed API has changed, stop and update the adapter instead of guessing.

```sh
node authoring/scripts/launch-authoring.mjs .authoring-runs/my-batch --dry-run
node authoring/scripts/launch-authoring.mjs .authoring-runs/my-batch --kind codex
```

Use the user's requested agent kind when supplied; otherwise default to Codex.
The launcher creates one background tab in the caller's workspace, one balanced
pane per worker, and named agents in this repo's working directory. It does not
switch focus or create worktrees. Prompts direct agents to their assignment
files. It verifies the sealed plan before changing Herdr.

`launch.json` journals each operation before execution. Existing journals prevent
automatic relaunch (including after a failure). Inspect journal IDs, `herdr agent
get/read` and live layout before deciding how to recover; never blindly resend a
prompt or recreate panes after a timeout. Do not answer approval dialogs without
the user's consent. Do not close panes you did not create.

### 4. Collect and validate

Use Herdr's lifecycle waits/read surfaces to coordinate; idle alone is not proof
of correct drafts. Each worker writes its own `review.md` with actual self-review,
source consultations and commands/results. Inspect these; missing or inadequate
self-review is unfinished authoring even if mechanical checks pass.

```sh
node authoring/scripts/authoring-batch.mjs collect .authoring-runs/my-batch
npm run authoring:test
npm run authoring:typecheck
```

Collection requires every story and runs the **unchanged full publication API**
on the assembled curriculum. Only a passing result writes `candidate.json` in
the run directory. This is not publication or deployment. If the baseline has
changed, start a new plan; never merge against a different curriculum silently.

When integration is requested, manually move authored content into
`app/content/`, preserving IDs, explicit readings and revision policy. Do not
import the manifest, dataset or draft files into the app. Follow `README.md`'s
promotion and validation checklist, including runtime/browser checks. Archive
temporary drafts and stale candidates only after successful integration. A tool
pass never establishes Mandarin quality, meaningful reuse or learner testing.

## Worker instructions

1. Read your assignment and the authoring references. Read only **your**
   `briefs.json` and `lessons.json`; do not read `manifest.json`, baseline stories,
   or other workers' drafts. Your supplied brief already contains the prior and
   current definitions, allowed bank, mandatory targets and length guidance.
2. Write complete structured lessons into your `lessons.json` array in assigned
   order. Keep IDs, kinds, revisions and character definitions exactly unchanged.
   Only author titles, descriptions and stories. Do not edit shared code or files.
3. Use explicit per-occurrence pinyin and correct paragraph/sentence/token nesting.
   Follow the brief's writing prompts and authoring self-review obligations.
   These are stories, not coverage strings. Change an unworkable premise instead
   of breaking the constraints. Never pad to satisfy a soft length warning.
4. Check each completed lesson without waiting for other stories:

   ```sh
   node authoring/scripts/authoring-batch.mjs check <run-dir> \
     --worker worker-N --lesson <assigned-lesson-id>
   ```

   The checker reads the frozen global metadata but checks story structure,
   pronunciation consistency and occurrence obligations only for selected
   stories. Unselected stories are explicitly `not-checked`. This is **not** a
   publication pass. Do not replace missing stories with synthetic placeholders.
5. Revise, self-review and rerun. Finish with the same command **without
   `--lesson`**, requiring all your assigned stories. Record results, warnings,
   pronunciation sources and language self-review in your `review.md`.
6. If a frozen definition is wrong, report the issue to the coordinator; do not
   alter it locally. Fixing it requires a fresh shared plan and revalidation of
   affected drafts. You do not publish, commit, deploy or modify other workers'
   files.

## Implementation boundary

- `authoring-batch.mjs`: allocation, frozen plan, briefs, JSON draft assembly.
- `launch-authoring.mjs`: Herdr topology and lifecycle admission only.
- `nextLessonSpec()` and `authoringPlan()`: canonical sequence and targets.
- `validatePlannedLessons()`: the same validation core as publication, with a
  selected-story scope. Global metadata always validates. Empty selection is
  metadata-only validation, never publication approval.
- `validatePublishedCurriculum()`: all stories required, all rules applied.

Do not add a second frequency lookup, Fibonacci calculator, checkpoint rule,
pinyin validator or coverage checker to the skill or adapter.
