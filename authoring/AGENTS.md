# Authoring agent instructions

- Read `README.md`, `PRONUNCIATION.md` and `data/README.md` in this directory.
- Use `npm run authoring:bank -- <lesson-id>` for the supplied static brief: prior/current/combined definitions, exact frequency group, top100 pool, allowed set, mandatory targets and soft length. Never maintain these by hand or read previous stories before writing.
- Query small frequency windows. Do not read the full dataset into context or import it into the application. Preserve source provenance and licences.
- Draft in `drafts/`, not published curriculum. Supply explicit per-Hanzi pinyin, sentence arrays and paragraph arrays. No dictionary inference, training-wheel flags, word groups or per-occurrence IDs.
- Introduce exactly the next five frequency characters in order. Allowed story Hanzi are taught + top100 only. Every new/Fibonacci-due/revision target must appear at least once; meaningfulness is author self-review, not an automated rule.
- Fibonacci gaps are 1,1,2,3,5,8… (offsets 1,2,4,7,12,20…). Count learning lessons only; extra appearances and revisions never reset/advance the clock. Checkpoints follow every 10 learning lessons / 50 introductions and cover the latest50 without introductions. Future obligations remain pending: do not add a fourth published lesson.
- Follow tool brief → free writing → author self-review → tool check → revise/self-review until passing. Review naturalness, meanings, pinyin and help load yourself using references; there is no separate reviewer or human gate. Report mechanical checks and self-review honestly.
- Run publication-policy candidate checks, authoring tests and typechecks. Use `validatePublishedCurriculum` for real content; explicit `{ policy: "structural" }` is for generic fixtures, not publishing.
- Length is warning-only: piecewise anchors cumulative introduced 5:60,50:75,100:90,250:145,500:230,1000:400; learning cap400; revisions 5× preceding target; range ±25%. Never pad to fit it.
- Follow the revision-bump/promotion checklist in `README.md`. Keep exactly three initial published lessons, preserve stable IDs, and archive/remove stale drafts. A tool pass is not a language-quality claim.
