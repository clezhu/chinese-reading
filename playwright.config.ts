import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 2,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: "list",
  // Keep reports under the already-ignored .wrangler directory.
  outputDir: ".wrangler/playwright-results",
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run test:serve",
    url: "http://127.0.0.1:4173/login",
    timeout: 120_000,
    // Never silently test a developer server or its D1 data.
    reuseExistingServer: false,
    env: { CI: "true", WRANGLER_SEND_METRICS: "false" },
  },
  projects: [
    { name: "chromium", testMatch: /.*\.browser\.spec\.ts/, use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", testMatch: /mobile\.spec\.ts/, use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" } },
    { name: "ssr", testMatch: /.*\.ssr\.spec\.tsx/ },
  ],
});
