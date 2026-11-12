# Draft coordination record

2026-11-12. Existing 110 stories preserved; no integration, publication, commit or deployment is authorized by this run.

- Began with the pre-existing unsealed `manifest.json`; filled only pinyin lists in its fifty new learning lessons (250 character cards). Source versions, hash, licence, reviewed lists and supplemental caveats are in `readings-review.md`; limited CC-CEDICT records are in `readings-evidence.json` with attribution/share-alike terms.
- `node authoring/scripts/authoring-batch.mjs seal /Users/chloezhu/projects/chinese-reading/.authoring-runs/next-55-20261112` exited 0 and created five immutable assignments/briefs and mutable lesson draft files. No frozen metadata was edited afterward.
- `node authoring/scripts/launch-authoring.mjs /Users/chloezhu/projects/chinese-reading/.authoring-runs/next-55-20261112 --dry-run` exited 0. No actual launch was performed.
- Read installed Herdr skill, verified HERDR_ENV=1, inspected installed CLI and compatible client/server 0.9.5/protocol 22, agent inventory and existing preparation outputs. Socket access required sandbox escalation; no approval dialog in another agent was answered.
- Sent exactly one sealed-assignment follow-up apiece to existing agents `auth-79ba18606814-2`, `auth-79ba18606814-3`, `auth-79ba18606814-4`, `auth-79ba18606814-5`. All four had settled after preparation. All four prompt calls returned `agent_prompted`, and subsequent live reads showed work/completion activity. No uncertain prompt was resent. No tabs, panes, agents or worktrees were created.
- Worker-1 authored learning-101–110 and revision-110 using its own sealed briefs, explicit occurrence pinyin and author self-review. Its final whole-worker check has no hard errors; length warnings remain. See worker-1/review.md and check-result.json.
- Before collection, coordinator inspected artifact presence/counts and read worker reviews. These reviews are author self-reviews, not independent language approval. Candidate collection and tests will be recorded below only after actual results exist.

## Completed draft collection and required checks

All five worker directories contain eleven stories and a substantive `review.md`. Coordinator read all five reviews, including the final worker-2 review after its turn settled. Reviews document actual dictionary consultations, narrative/meaningful-reuse judgements, contextual pinyin, help load, changes after failures and scoped-check results. All are author self-reviews; none claims independent Mandarin approval.

`node authoring/scripts/authoring-batch.mjs collect /Users/chloezhu/projects/chinese-reading/.authoring-runs/next-55-20261112` exited 0. `collection-result.json` reports `combined-candidate-checked-not-published`, no errors, all 165 stories checked; `candidate.json` contains the unchanged baseline plus 55 additions. Global frozen metadata/baseline compatibility was validated by the canonical collector.

The full candidate has 79 warning-only length messages, of which 25 concern the 55 new stories (the other 54 concern baseline stories). All 55 new selected-story reports have empty permanent-help sets. New stories total 22,246 Hanzi occurrences. These counts describe mechanical reporting, not difficulty or language quality.

- `npm run authoring:test`: exit 0; 80 tests passed, zero failures. Actual log: `authoring-test.log`.
- `npm run authoring:typecheck`: exit 0. Actual log: `authoring-typecheck.log`.
- Final `git status --short` is empty; tracked runtime content and shared checker code are unchanged. This ignored run directory holds drafts and source/check evidence only.

No further Herdr prompts were needed, and no approval dialogs were answered. No publishing, promotion, commit, push or deployment occurred. The candidate and every worker draft are retained for review or a separately requested integration step. Mechanical success does not establish complete dictionary scope, natural Mandarin, meaningful pedagogy or learner suitability.
