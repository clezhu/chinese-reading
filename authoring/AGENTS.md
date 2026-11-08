# Authoring agent instructions

- Read `README.md`, `PRONUNCIATION.md` and `data/README.md` in this directory.
- Inspect the target's prior/current/combined bank with `npm run authoring:bank -- <lesson-id>` before drafting. Derive it again after any introduction/order changes; never maintain a cumulative list by hand.
- Query small frequency windows. Do not read the full dataset into context or import it into the application. Preserve source provenance and licences.
- Draft in `drafts/`, not published curriculum. Supply explicit per-Hanzi pinyin, sentence arrays and paragraph arrays. No dictionary inference, training-wheel flags, word groups or per-occurrence IDs.
- Use all current introductions naturally and deliberately reuse earlier ones. Unfamiliar Hanzi get permanent help automatically; review their quantity and appropriateness rather than treating frequency or validator success as approval.
- Run candidate-over-current validation, authoring tests and typechecks. Do a separate Mandarin/pronunciation review and record actual reviewer/status honestly.
- Follow the revision-bump and promotion checklist in `README.md`. #7 owns final approval and release; do not quietly publish a draft or mark an automated check as language approval.
