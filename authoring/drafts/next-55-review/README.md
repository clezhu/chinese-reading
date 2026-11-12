# Stories 56–110: integration record

## Publication and preservation

The requested continuation appends **55 stories**, learning-51 through
learning-100 and revision-60/70/80/90/100, to the existing Fundamentals module.
The resulting publication has **110 stories: 100 learning lessons, ten latest-50
revision checkpoints, and 500 unique character introductions**. Overall story
numbers include revisions; learning IDs do not.

Runtime content is static authored data in
`app/content/frequency-continuation.ts`, exported as
`frequencyContinuationLessons` and appended by `curriculum.ts`. Every new
lesson starts at contentRevision 1. No runtime dictionary, frequency dataset,
draft import, generation, unit model or scheduling service was added.

The coordinator compared the entire integrated curriculum with the validated
combined candidate, and compared its first 55 lessons deeply with the frozen
baseline: both comparisons passed. Earlier stories, IDs, order, reading lists
and revisions are unchanged. `authoring/tests/content.test.mjs` retains the
earlier frozen fingerprints and adds fingerprints for the first 55 and new 55.

## Authorship, pronunciation and licences

Five workers authored eleven stories each. Their actual source consultations,
language self-reviews, contextual pinyin choices and scoped check results are
preserved in `worker-1.md` through `worker-5.md`. These are author self-reviews,
not independent Mandarin approval or learner testing. A mechanical pass cannot
establish naturalness, meaningful reuse or learning efficacy.

`readings-review.md` and `readings-map.json` preserve the coordinator's source
review of 250 newly introduced characters / 432 authored readings. The review
documents rare, regional, historical and neutral-tone scope and source caveats.
Contextual story readings remain explicit per-occurrence authored choices.

Primary source: **CC-CEDICT contributors**, distributed by
[MDBG](https://www.mdbg.net/chinese/dictionary?page=cedict),
[rolling download](https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.txt.gz).
The consulted archive is dated `2026-11-09T04:23:50Z`, compressed SHA-256
`2e8921a90b9abdca2ce78b8a6af104368f848681b7afe8020043f500fbe0238a`.
Adapted pronunciation material is attributed to the CC-CEDICT contributors
under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
Stories are newly authored, not copied dictionary examples. SUBTLEX-CH frequency
provenance and its separate CC BY 4.0 terms remain in `authoring/data/README.md`.

## Mechanical publication checks

- All 55 story and self-review artifacts existed before collection.
- The unchanged batch collector and full `validatePublishedCurriculum` API
  passed for all 110 stories, with **zero hard errors**.
- **54 soft length warnings** remain in total: 36 in the unchanged baseline,
  plus 18 in this batch (learning-53–60 and learning-81–90). These are advisory,
  not coverage exemptions. Worker reviews document their editorial decisions.
- All new stories have zero permanent-help characters at their curriculum
  position. This is not a claim that all words or sentences are easy.
- Count-dependent regression expectations were expanded without changing the
  scheduler or validation rules. The authoring suite passes **80/80** tests.

Runtime/browser/deployment outcomes are recorded separately in
`docs/release-next-55.md` once actually observed. Local source integration alone
does not establish hosted deployment.
