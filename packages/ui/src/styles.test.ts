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

  test("self-host both fonts from @fontsource (Atkinson Hyperlegible default, OpenDyslexic option)", () => {
    expect(allCss).toMatch(/@import "@fontsource\/atkinson-hyperlegible\/latin-400\.css"/);
    expect(allCss).toMatch(/@import "@fontsource\/opendyslexic\/latin-400\.css"/);
    expect(allCss).toMatch(/@import "@fontsource\/opendyslexic\/latin-700\.css"/);
  });

  test("the dyslexia option switches the body font to OpenDyslexic", () => {
    const block = allCss.match(/\[data-font="dyslexic"\]\s*\{([^}]*)\}/)?.[1] ?? "";

    expect(block).toMatch(/--font-body:\s*"OpenDyslexic"/);
  });

  test("the dyslexia option shrinks text about 10% (OpenDyslexic runs wide), in every band", () => {
    const dyslexic = allCss.match(/\[data-font="dyslexic"\]\s*\{([^}]*)\}/)?.[1] ?? "";
    expect(dyslexic).toMatch(/--font-scale:\s*0\.9\b/);

    // Every size token is computed on the app root, so the scale applies on top of K–2 sizes too.
    const computed = allCss.match(/:root,\s*\.lf-app\s*\{([^}]*)\}/)?.[1] ?? "";
    for (const size of ["base", "lg", "xl", "xxl"]) {
      expect(computed).toMatch(new RegExp(`--font-size-${size}:\\s*calc\\(var\\(--font-size-${size}-unscaled\\)\\s*\\*\\s*var\\(--font-scale\\)\\)`));
    }
  });

  test("provide a visually-hidden utility that keeps text available to screen readers", () => {
    const block = allCss.match(/\.lf-visually-hidden\s*\{([^}]*)\}/)?.[1] ?? "";

    expect(block).toMatch(/position:\s*absolute/);
    expect(block).toMatch(/clip-path:\s*inset\(50%\)/);
    expect(block).not.toMatch(/display:\s*none|visibility:\s*hidden/);
  });

  test("icon-only buttons stay square at the touch-target size", () => {
    const iconBlock = allCss.match(/\.lf-button--icon\s*\{([^}]*)\}/)?.[1] ?? "";

    expect(iconBlock).toMatch(/width:\s*var\(--touch-target-min\)/);
    expect(iconBlock).toMatch(/height:\s*var\(--touch-target-min\)/);
  });

  test("define a minimum touch target size token of at least 48px", () => {
    const match = allCss.match(/--touch-target-min:\s*(\d+)px/);
    expect(Number(match?.[1])).toBeGreaterThanOrEqual(48);
  });
});
