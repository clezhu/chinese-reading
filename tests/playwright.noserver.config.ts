import { defineConfig } from "@playwright/test";

// Pure/SSR and local SQLite contract tests only. Never starts a Worker/browser
// server, touches a persisted D1 database, or runs migrations remotely.
export default defineConfig({
  testDir: ".", testMatch: /.*\.ssr\.spec\.tsx/,
  outputDir: "../.wrangler/playwright-noserver-results",
  workers: 1, reporter: "list", forbidOnly: !!process.env.CI,
});
