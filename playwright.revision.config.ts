import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  // Deliberately not *.browser.spec.ts: the normal suite must never collect
  // fixture-only assertions against the published three-lesson curriculum.
  testMatch: "revision.e2e.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 2,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: "list",
  outputDir: ".wrangler/playwright-revision-results",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://127.0.0.1:4174",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run test:revision:serve",
    url: "http://127.0.0.1:4174/login",
    timeout: 120_000,
    reuseExistingServer: false,
    env: { CI: "true", WRANGLER_SEND_METRICS: "false" },
  },
});
