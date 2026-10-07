// @vitest-environment node
/**
 * Calculates the real WCAG contrast ratio of every foreground/background pair the UI uses,
 * straight from the hex values in tokens.css. Fails below 4.5:1 for normal text and below
 * 3:1 for large text and UI parts (focus ring, borders that carry meaning, progress dots).
 */
import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { contrastRatio } from "./test-utils/contrast";

const TEXT = 4.5;
const LARGE_TEXT_OR_UI = 3;

const tokensCss = readFileSync(new URL("./tokens.css", import.meta.url), "utf8");
const colors: Record<string, string> = Object.fromEntries(
  [...tokensCss.matchAll(/--(color-[\w-]+):\s*(#[0-9a-f]{6})\b/gi)].map((m) => [m[1]!, m[2]!.toLowerCase()]),
);

interface Pair {
  fg: string;
  bg: string;
  min: number;
  usedFor: string;
}

/** Every pair rendered anywhere. Add a row when a new color combination is used. */
const PAIRS: readonly Pair[] = [
  { fg: "color-text", bg: "color-bg", min: TEXT, usedFor: "page title and greeting" },
  { fg: "color-text", bg: "color-surface", min: TEXT, usedFor: "card body text" },
  { fg: "color-text", bg: "color-accent-soft", min: TEXT, usedFor: "next-step card body text" },
  { fg: "color-text-muted", bg: "color-bg", min: TEXT, usedFor: "muted text on the page" },
  { fg: "color-text-muted", bg: "color-surface", min: TEXT, usedFor: "card headings, teacher name" },
  { fg: "color-text-muted", bg: "color-accent-soft", min: TEXT, usedFor: "next-step card heading" },
  { fg: "color-accent", bg: "color-bg", min: LARGE_TEXT_OR_UI, usedFor: "focus ring on the page" },
  { fg: "color-accent", bg: "color-surface", min: LARGE_TEXT_OR_UI, usedFor: "focus ring inside cards" },
  { fg: "color-accent", bg: "color-accent-soft", min: LARGE_TEXT_OR_UI, usedFor: "next-step border, focus ring" },
  { fg: "color-success", bg: "color-surface", min: LARGE_TEXT_OR_UI, usedFor: "filled progress dot" },
  { fg: "color-meter-empty", bg: "color-surface", min: LARGE_TEXT_OR_UI, usedFor: "empty progress dot outline" },
];

/** Colors that never need contrast: purely decorative edges (meaning is carried elsewhere). */
const DECORATIVE = new Set(["color-border"]);

describe("contrastRatio (reference values)", () => {
  test("black on white is 21:1 and a color on itself is 1:1, in either order", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#ffffff", "#000000")).toBeCloseTo(21, 5);
    expect(contrastRatio("#4a5560", "#4a5560")).toBeCloseTo(1, 5);
  });

  test("matches the well-known AA boundary grays on white", () => {
    expect(contrastRatio("#767676", "#ffffff")).toBeCloseTo(4.54, 2);
    expect(contrastRatio("#777777", "#ffffff")).toBeCloseTo(4.48, 2);
  });

  test("rejects anything that is not a 6-digit hex color", () => {
    expect(() => contrastRatio("#fff", "#000000")).toThrow(/6-digit hex/);
  });
});

describe("tokens.css contrast (WCAG 2.2 AA)", () => {
  test("parses the color tokens from tokens.css", () => {
    expect(Object.keys(colors).length).toBeGreaterThanOrEqual(8);
  });

  test("every color token is either checked in a pair or explicitly decorative", () => {
    const covered = new Set([...PAIRS.flatMap((p) => [p.fg, p.bg]), ...DECORATIVE]);

    expect(Object.keys(colors).filter((name) => !covered.has(name))).toEqual([]);
  });

  test.each(PAIRS)("$fg on $bg ($usedFor) meets $min:1", ({ fg, bg, min }) => {
    expect(colors[fg], `--${fg} missing from tokens.css`).toBeDefined();
    expect(colors[bg], `--${bg} missing from tokens.css`).toBeDefined();

    expect(contrastRatio(colors[fg]!, colors[bg]!)).toBeGreaterThanOrEqual(min);
  });

  test("the contrast ratios noted in tokens.css comments match the calculated values", () => {
    expect(tokensCss, "replace estimated (~) ratios with calculated ones").not.toMatch(/~\s*\d/);
    const noted = [...tokensCss.matchAll(/--(color-[\w-]+):[^;]*;\s*\/\*([^*]*)\*\//g)];
    expect(noted.length).toBeGreaterThan(0);

    for (const [, fg, comment] of noted) {
      for (const [, ratio, bg] of comment!.matchAll(/(\d+\.\d{2}):1 on ([\w-]+)/g)) {
        const actual = contrastRatio(colors[fg!]!, colors[`color-${bg}`]!);
        expect(actual.toFixed(2), `--${fg} on --color-${bg}`).toBe(ratio);
      }
    }
  });
});
