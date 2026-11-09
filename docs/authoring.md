# Authoring references

- [Toolkit and agent workflow](../authoring/README.md)
- [Runtime content contract and revision policy](../app/content/README.md)
- [Pronunciation references, reuse terms and review scope](../authoring/PRONUNCIATION.md)
- [Frequency dataset source/licence](../authoring/data/README.md)
- [Frequency source comparison](research/character-frequency-sources.md)
- [Candidate drafts and archival status](../authoring/drafts/README.md)

#7's newly owner-approved authoring decisions supersede older conflicting #1/#5
and #7 wording. The canonical rules and commands are in the toolkit README:

- Exact frequency introductions in ordered groups of five; static briefs supply
  prior/current/combined definitions, top100 training pool, taught + top100 allowed
  set, and new/Fibonacci-due/revision mandatory targets. No previous-story reading.
- Fibonacci **gaps** 1,1,2,3,5,8… yield offsets 1,2,4,7,12,20… from introduction.
  Only learning lessons count; extra appearances/revisions never reset the clock.
- Revision checkpoints every 10 learning lessons / 50 introductions cover the
  latest50, introduce none and do not advance Fibonacci. Future obligations are
  pending, not missing-story errors; keep only three initial lessons published.
- Hard checks require all mandatory targets at least once and prohibit Hanzi
  outside taught + top100. Meaningful use and language quality are self-review.
- Soft length interpolates cumulative-introduction anchors
  5:60, 50:75, 100:90, 250:145, 500:230, 1000:400; cap learning at400. Revision
  target is 5× preceding learning target; ±25% ranges only warn.
- Workflow: supplied brief/prompt → free writing → author self-review → tool
  check → revise/self-review until passing. **No separate reviewer or human
  approval gate.** A mechanical pass still does not prove natural language quality.

`npm run authoring:bank -- <lesson-id>` prints the brief without prior stories.
`npm run authoring:check` validates publication policy and reports pending future
obligations; it never generates or publishes stories. `validatePublishedCurriculum`
is the real-content API. Generic structural fixtures explicitly select
`{ policy: "structural" }` so small examples are not mistaken for canonical
curriculum. Runtime permanent pinyin, lesson-owned reading lists and revision-scoped
indexes remain unchanged; authoring policy/data are never runtime dependencies.
