# Issue #3 tests

```sh
npm ci
npx playwright install chromium
npm test
```

`npm test` builds the app with the existing build script, applies migrations
locally, and starts the **built Worker** using its generated Wrangler config.
This is real workerd/D1, not a mocked API or Vite's source dev server. It never
deploys or runs remote migrations. Port 4173 must be free; an existing server is
deliberately not reused.

Both migration and server commands use `.wrangler/playwright` for persistence,
separate from the developer's default `.wrangler/state`. Accounts have random
usernames, so reruns do not depend on a clean database or a test execution order.
Tests only inspect browser/HTTP behavior, never database tables or password hashes.
Failure traces/screenshots go to `.wrangler/playwright-results`.

The Chromium browser suite covers auth, copied-token revocation, invalid forms,
same-origin writes, ordered curriculum, locked route/write protection, forged
completion claims, grouped readings, saved introductions and account isolation.
The mobile project checks narrow-screen overflow, touch-target heights, and
keyboard focus/activation. Browser emulation does not simulate an OS virtual
keyboard. The SSR project renders the shared lesson card using the unpublished
revision fixture; it adds no route or curriculum entry.

To run only one project: `npm test -- --project=chromium` (or `mobile`, `ssr`).
The same isolated local Worker is started for each invocation.

Type-check tests as well as app code with `npx tsc --noEmit -p tests/tsconfig.json`
(after `npm run typegen` on a fresh checkout). Expected rejected cross-origin
requests can produce React Router CSRF errors in the server log; the suite
asserts their 400/403 responses.
