import { defineConfig, devices } from "@playwright/test";

// Dedicated ports so end-to-end runs never collide with a developer's `npm run dev` (5173).
const DEV_PORT = 5199;
const PROD_PORT = 5198;

export default defineConfig({
  testDir: "apps/student/e2e",
  fullyParallel: true,
  reporter: "list",
  use: { trace: "retain-on-failure" },
  projects: [
    {
      // Dev server: app behaviour, using the dev toolbar.
      name: "dev",
      testIgnore: /prod\//,
      use: { ...devices["Desktop Chrome"], baseURL: `http://localhost:${DEV_PORT}` },
    },
    {
      // Production build: what students get (PWA, offline, CSP, no dev toolbar).
      name: "prod",
      testMatch: /prod\/.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], baseURL: `http://localhost:${PROD_PORT}` },
    },
  ],
  webServer: [
    {
      command: `npm run dev -w @laughing-fortnight/student -- --port ${DEV_PORT} --strictPort`,
      url: `http://localhost:${DEV_PORT}`,
      reuseExistingServer: false,
      timeout: 60_000,
    },
    {
      command: `npm run build -w @laughing-fortnight/student && npm run preview -w @laughing-fortnight/student -- --port ${PROD_PORT} --strictPort`,
      url: `http://localhost:${PROD_PORT}`,
      reuseExistingServer: false,
      timeout: 180_000,
    },
  ],
});
