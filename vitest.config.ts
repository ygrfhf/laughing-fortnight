import { defineConfig } from "vitest/config";

// packages/ui joins this list once it has its first component tests (build step 3).
export default defineConfig({
  test: {
    projects: ["apps/student"],
  },
});
