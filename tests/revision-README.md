# Isolated revision-kind end-to-end curriculum

```sh
npm run test:revision:check
npm run test:revision
npx tsc --noEmit -p tests/tsconfig.json
```

Coordinate server-backed execution serially. `test:revision` uses the separate
`playwright.revision.config.ts`, validates content, builds Vite mode
`revision-fixture`, applies local-only D1 migrations and serves a built Worker.
No application endpoint/progress operation is mocked and prerequisites are
completed through the browser, not seeded success rows.

| Resource | Revision fixture |
| --- | --- |
| HTTP | `127.0.0.1:4174` (never reuse an existing server) |
| Build | `.wrangler/revision-build/` |
| D1 persistence | `.wrangler/playwright-revision/` |
| Traces/screenshots | `.wrangler/playwright-revision-results/` |
| Test collection | `tests/revision.e2e.spec.ts` only |

The spec intentionally does not match normal `.browser.spec.ts` collection.
Only this build redirects application curriculum imports to
`tests/revision-curriculum.ts`. The adapter inserts a test-only revision lesson
after the current first learning lesson; its story and content revision come
from that published lesson. The real curriculum helpers still determine prior
introductions. Validation checks inherited characters, a valid story, three
unchanged published entries and one extra unpublished fixture entry.

Tests derive refs/readings/help and list order from this checked adapter, not
old story coordinates or module counts. Coverage includes:

- Revision badge, no new characters, authored order, locked access.
- Start/resume straight into story; inherited taught help starts hidden,
  permanent help remains visible.
- No-reveal completion, cross-device persistence, later access and an explicit
  revision-kind revisit that starts a fresh story without initial learning.
- Reveals freeze the current pass's contextual cards; **Reread story** creates a
  new empty/version-zero attempt and does not earn milestones or unlock access.
- Repeating the same reveal/deck after reload must start practice again, not
  inherit the old browser's recognised deck. A later zero-reveal Finish completes.

There is no production feature flag, extra route or remote migration. Never
deploy the fixture build. These tests do not constitute Mandarin approval.
