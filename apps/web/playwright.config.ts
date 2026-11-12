import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: require.resolve("./tests/e2e/global-setup.ts"),
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 0 : 0,
  maxFailures: process.env.CI ? 3 : undefined,
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  workers: 1,
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report" }],
  ],
  use: {
    baseURL:
      process.env.BASE_URL ||
      process.env.PLAYWRIGHT_TEST_BASE_URL ||
      "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
