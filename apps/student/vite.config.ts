import { defineConfig } from "vitest/config";
import type { Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { CONTENT_SECURITY_POLICY } from "./content-security-policy.ts";
import { en } from "./src/strings/en.ts";

/** Adds the CSP <meta> tag to production builds only (Vite's dev server needs inline scripts). */
function contentSecurityPolicy(): Plugin {
  return {
    name: "lf-content-security-policy",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler: (html) => {
        const charset = '<meta charset="UTF-8" />';
        if (!html.includes(charset)) {
          throw new Error(`index.html must contain ${charset} so the CSP can be placed right after it`);
        }
        return html.replace(
          charset,
          `${charset}\n    <meta http-equiv="Content-Security-Policy" content="${CONTENT_SECURITY_POLICY}" />`,
        );
      },
    },
  };
}

/**
 * Installable PWA with an offline app shell. The service worker caches app code, styles,
 * the default font, and icons only; it never caches student data. OpenDyslexic is not
 * precached (so installs stay small) and is cached the first time a student uses it.
 */
const pwa = VitePWA({
  registerType: "autoUpdate",
  injectRegister: "script", // external registerSW.js: no inline script, so the CSP stays strict
  manifest: {
    name: en.app.title,
    short_name: en.app.title,
    lang: "en",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f6f4ef",
    theme_color: "#1d5fa8",
    icons: [
      { src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
      { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
      { src: "maskable-icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  },
  workbox: {
    globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
    globIgnores: ["**/opendyslexic-*"],
    navigateFallback: "/index.html",
    cleanupOutdatedCaches: true,
    runtimeCaching: [
      {
        urlPattern: ({ url }) => url.pathname.includes("/assets/opendyslexic-") && url.pathname.endsWith(".woff2"),
        handler: "CacheFirst",
        options: { cacheName: "lf-optional-fonts", expiration: { maxEntries: 4 } },
      },
    ],
  },
  devOptions: { enabled: false },
});

export default defineConfig({
  plugins: [react(), contentSecurityPolicy(), ...(process.env.VITEST ? [] : [pwa])],
  test: {
    name: "student",
    environment: "jsdom",
    // Vitest tests live next to the code in src/. apps/student/test/ is reserved for the
    // node:test guard tests run by `npm run test:guard`.
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./src/test-utils/setup.ts"],
  },
});
