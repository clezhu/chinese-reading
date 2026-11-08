# Chinese Reading

React Router 8 framework-mode, React, and TypeScript on Cloudflare Workers;
D1 holds accounts, sessions, and learner progress. Issue #3 implements the
account → ordered lesson list → character introduction slice of spec #1.
Flashcards, stories, and lesson completion are deliberately not implemented yet.
The three published learning fixtures are structural examples, not approved
frequency-graded curriculum. The reader under `prototype/` is unrelated throwaway work.

## Local development

Requires Node.js 22.12+ and npm.

```sh
npm ci
npm run db:migrate
npm run dev
```

Open the local URL printed by Vite. D1 persists under `.wrangler/`; local
migrations do not affect Cloudflare's database. Register with a 3–32-character
ASCII letters/numbers/underscore username and a 12–128-character password.
Usernames are case-insensitive. There is no email or account/password recovery.

```sh
npm run typecheck
npx playwright install chromium
npm test
```

Tests build and serve the real Worker with a separate local D1 store under
`.wrangler/playwright`. They create unique accounts; no Cloudflare credentials
are required. See `tests/README.md`. Stop other processes on port 4173 first.
For a manual built-runtime check, run `npm run build && npm run preview`.

## Deployment

Hosting requires access to a Cloudflare account with Workers and D1 enabled.
The checked-in D1 ID binds the deployed `chinese-reading` database. The app is
deployed at <https://chinese-reading.chinese-reading.workers.dev>.
For a separate Cloudflare account, create a new database:

```sh
npx wrangler login
npx wrangler whoami
npx wrangler d1 create chinese-reading
```

Put the returned database ID into `wrangler.jsonc` (`d1_databases[0].database_id`).
Database IDs are configuration, not credentials. Then:

```sh
npm run db:migrate:remote
npm run deploy
```

Wrangler prints the hosted workers.dev URL. Enable a workers.dev subdomain in
Cloudflare if prompted. Smoke-test registration, logout/login, the first lesson,
and rejection of a locked lesson at that HTTPS URL before declaring deployment
complete. Apply future remote migrations before deploying code that needs them;
back up existing D1 data before destructive migrations.

Do not commit Cloudflare tokens, `.env`, or `.dev.vars`. CI can supply
`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` through its secret store.
This app needs no application secret: sessions use random opaque tokens, with
only SHA-256 token hashes persisted in D1. Future application secrets should
use `wrangler secret put NAME` and ignored `.dev.vars` locally.

## Storage and security boundaries

- `app/content/curriculum.ts`: typed authored module/lesson lists, stable IDs,
  and character reading arrays. Array order is progression order; there are no
  position fields or curriculum tables. The unpublished revision fixture lives
  in `app/content/fixtures/revision.ts`.
- `migrations/0001_accounts.sql`: accounts, expiring server-side sessions, and
  per-user/per-lesson introduction progress. Completion milestones are reserved
  but no operation can set them in this slice. Later attempt-state migrations
  will add flashcard/story state; this is not a final lesson-engine schema.
- Native Workers `node:crypto` scrypt hashes passwords with random per-password
  salts (N=32768, r=8, p=3); raw passwords and session tokens are not stored.
- Production cookies are Secure, HttpOnly, SameSite=Lax, host-only cookies.
  Only loopback HTTP development uses a non-Secure cookie. Logout revokes the
  database session. Mutations check origin and derive ownership from the session,
  never browser-supplied user IDs. Locked reads and writes are checked server-side.

No R2, content administration, email/recovery system, or runtime content generation.
Sentence/occurrence IDs and authored contextual pinyin will be added with the
story slice rather than guessed at runtime.
