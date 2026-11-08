# Unpublished revision-kind end-to-end fixture

```sh
npm run test:revision:check
npm run test:revision
npx tsc --noEmit -p tests/tsconfig.json
```

Install Chromium with `npx playwright install chromium` if needed. To run only
one scenario, use e.g. `npm run test:revision -- --grep 'fixture list'`.

`test:revision` runs the separate `playwright.revision.config.ts`, validates
current content and the fixture curriculum, builds with Vite mode
`revision-fixture`, applies **local-only** D1 migrations, then serves the built
Worker with workerd. No endpoint, authentication, progress operation, or database
write is mocked. Accounts are random and prerequisites are completed through the
browser. Tests do not seed progress or bypass the previous lesson.

Isolation from the normal suite/developer server:

| Resource | Revision fixture |
| --- | --- |
| HTTP | `127.0.0.1:4174` (never reuse an existing server) |
| Build | `.wrangler/revision-build/` |
| D1 persistence | `.wrangler/playwright-revision/` |
| Traces/screenshots | `.wrangler/playwright-revision-results/` |
| Test collection | `tests/revision.e2e.spec.ts` only |

The fixture spec intentionally does **not** end in `.browser.spec.ts` or
`.ssr.spec.tsx`, so `npm test` does not collect it against production content.
Normal tests remain on port 4173 with their existing build and D1 directory.

In this build mode only, a Vite resolver redirects application curriculum imports
to `tests/revision-curriculum.ts` on both server and client. The adapter inserts
`app/content/fixtures/revision.ts` immediately after “First characters” and calls
the real curriculum helpers with that content. The fixture reuses the existing
checked first story, introduces no characters, and inherits only the preceding
five introductions. Validation asserts the normal curriculum still has exactly
three lessons and cannot find this fixture ID.

There is no runtime environment feature, special test route, production
curriculum modification, remote migration, or deployment. Do not deploy the
fixture build. It is checked illustrative content, not Mandarin/language approval.

Browser coverage:

- Revision badge / “No new characters,” authored list order, locked access.
- Starting and resuming directly in the story, with no introduction/initial deck.
- Earlier characters revealable; characters taught later retain permanent help.
- No-reveal reading completes without collected practice and unlocks the next
  learning lesson, with persistence in a fresh browser context.
- Help generates a frozen inherited-reading deck; completion waits for practice.
- Completed revisions revisit directly into a fresh story attempt, clear old
  reveals/decks, preserve first/latest milestones and later-lesson access, and
  resume without replacing the active revisit.
