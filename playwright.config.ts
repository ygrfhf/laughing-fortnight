import { defineConfig, devices } from "@playwright/test";

// A dedicated port so end-to-end runs never collide with a developer's `npm run dev` (5173).
const PORT = 5199;

export default defineConfig({
  testDir: "apps/student/e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run dev -w @laughing-fortnight/student -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
