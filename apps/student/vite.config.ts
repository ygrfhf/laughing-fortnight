import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    name: "student",
    environment: "jsdom",
    // Vitest tests live next to the code in src/. apps/student/test/ is reserved for the
    // node:test guard tests run by `npm run test:guard`.
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./src/test-utils/setup.ts"],
  },
});
