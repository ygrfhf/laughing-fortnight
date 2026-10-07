// @vitest-environment node
/**
 * Guards on the shared stylesheets: no third-party requests from a student device, and the
 * accessibility basics every screen relies on are present.
 */
import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

// Read from disk: Vitest blanks CSS module imports (even ?raw) unless css processing is on.
const SRC_DIR = new URL("./", import.meta.url);
const stylesheets = Object.fromEntries(
  readdirSync(SRC_DIR)
    .filter((name) => name.endsWith(".css"))
    .map((name) => [name, readFileSync(new URL(name, SRC_DIR), "utf8")]),
);
const allCss = Object.values(stylesheets).join("\n");

describe("shared stylesheets", () => {
  test("the scan actually reads the stylesheets, and they are not empty", () => {
    expect(Object.keys(stylesheets)).toEqual(expect.arrayContaining(["styles.css", "tokens.css"]));
    for (const [name, text] of Object.entries(stylesheets)) {
      expect(text.trim().length, `${name} is empty`).toBeGreaterThan(0);
    }
  });

  test("load nothing from another origin (fonts are self-hosted, no CDN)", () => {
    expect(allCss).not.toMatch(/https?:\/\//i);
    expect(allCss).not.toMatch(/url\(\s*["']?\/\//i);
  });

  test("define a visible keyboard focus style", () => {
    expect(allCss).toMatch(/:focus-visible\s*\{[^}]*outline:\s*var\(--focus-ring-width\)/);
  });

  test("respect the reduced-motion preference", () => {
    expect(allCss).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  });

  test("K–2 mode raises the touch target size to at least 64px", () => {
    const k2Block = allCss.match(/\[data-grade-band="K-2"\]\s*\{([^}]*)\}/);
    const size = k2Block?.[1]?.match(/--touch-target-min:\s*(\d+)px/);

    expect(Number(size?.[1])).toBeGreaterThanOrEqual(64);
  });

  test("define a minimum touch target size token of at least 48px", () => {
    const match = allCss.match(/--touch-target-min:\s*(\d+)px/);
    expect(Number(match?.[1])).toBeGreaterThanOrEqual(48);
  });
});
