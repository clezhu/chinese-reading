# Stories 111–165: integration record

## Runtime publication and preservation

The user requested integration, verification, commit/push and Cloudflare deployment
on 2026-11-12. This supersedes the original draft-only authorization recorded in
`coordination.md`; that document is retained as historical authoring evidence.

Added 55 stories to the existing Fundamentals module: learning-101–150 and
revision-110/120/130/140/150. The runtime now has **165 stories: 150 learning,
15 latest-50 checkpoints and 750 unique introductions**. There is no new unit
logic, runtime scheduler, dictionary or offline-data import.

`app/content/frequency-further.ts` exports `frequencyFurtherLessons` as static,
explicitly authored story tokens and character definitions. `curriculum.ts`
appends them in order. All additions start at contentRevision 1. Existing lesson
IDs, revisions, definitions, titles, stories and order remain unchanged.

After canonical collection passed, the coordinator compared the entire integrated
runtime curriculum deeply against the validated candidate: exact match. The first
110 lessons also match the frozen baseline. Authoring regression tests preserve
the existing fingerprints and freeze the first-110 fingerprint
`d746b0bcddbc844cdc036066083339f8b311a0a2e7110bb7ac384ff550954187`.

## Language review and sources

`readings-review.md` records reviewed lists, CC-CEDICT archive identification,
licence, supplemental references and exceptional/rare-reading caveats.
`readings-evidence.json` retains limited consulted dictionary records. Preserve
CC-CEDICT contributor attribution and CC BY-SA 4.0 terms for adapted readings;
frequency provenance remains in `authoring/data/README.md`.

Each `worker-N-review.md` documents its author's narrative, meaningful target
reuse, meanings, occurrence pinyin, source consultation, help load and revisions.
These are author self-reviews, **not independent Mandarin approval or learner
testing**. Mechanical validation cannot establish naturalness or pedagogy.

All 55 additions have zero permanent-help characters under their supplied banks.
The combined canonical report retains 79 warning-only length messages, 25 for
the new stories and 54 for existing ones. Short complete revision stories were
not padded; coverage and exact allowed banks still pass. The new stories contain
22,246 Hanzi occurrences. Future Fibonacci/checkpoint obligations remain pending.

## Integration checks actually completed

- Canonical batch collection: no errors; all 165 candidate stories checked.
- `npm run authoring:check`: passed on integrated runtime content.
- `npm run authoring:test`: 80 passed, zero failed.
- `npm run authoring:typecheck`: passed.
- `npm run typecheck`: passed (generated binding/route types included).
- `npx tsc --noEmit -p tests/tsconfig.json`: passed.
- `npm test`: 117 passed, including every one of the 165 stories completed
  through the UI, 150 learning introductions/decks and 15 direct-story revisions.
  Tests use isolated local Worker/D1, not production accounts or data.
- `npm run test:revision`: 3 passed on the separate four-lesson revision fixture.
- `npm run build`: production build passed.
- `npx wrangler deploy --dry-run`: passed; existing `chinese-reading` Worker and
  existing D1 binding retained, no remote migration/config changes required.
- Local interactive browser smoke on `http://127.0.0.1:5174`: 165 lesson headings,
  final revision-150 displayed as lesson 165, direct-story start and reader
  rendering passed; no horizontal overflow in the inspected desktop states.
  An optional screenshot capture timed out; semantic/browser-suite checks passed.

The full browser suite and isolated revision suite are run serially. Deployment
and its separate hosted smoke results are recorded only after they occur.
