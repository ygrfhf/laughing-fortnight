/**
 * Automated accessibility check for component and screen tests (test-only; never imported by
 * app code). Fails with a readable list of every violation.
 *
 * jsdom has no layout or rendering, so color contrast and target size cannot be measured
 * here. Those are checked in a real browser by the Playwright + axe suite (build step 10).
 */
import axe from "axe-core";
import { expect } from "vitest";

const WCAG_AA_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

interface AxeOptions {
  /** Also run axe best practices (landmarks, heading order). Use for whole screens. */
  includeBestPractices?: boolean;
}

export async function expectNoAxeViolations(
  container: Element,
  { includeBestPractices = false }: AxeOptions = {},
): Promise<void> {
  const results = await axe.run(container, {
    runOnly: { type: "tag", values: includeBestPractices ? [...WCAG_AA_TAGS, "best-practice"] : WCAG_AA_TAGS },
    rules: { "color-contrast": { enabled: false } },
  });
  const violations = results.violations.map(
    (v) => `${v.id} (${v.impact ?? "unknown"}): ${v.help} at ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
  );
  expect(violations).toEqual([]);
}
