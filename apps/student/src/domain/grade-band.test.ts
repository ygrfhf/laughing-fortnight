import { describe, expect, test } from "vitest";
import type { GradeLevel } from "../data/types";
import { DEFAULT_GRADE_BAND, gradeBandFor } from "./grade-band";

describe("gradeBandFor", () => {
  test.each<[GradeLevel, string]>([
    ["K", "K-2"],
    [1, "K-2"],
    [2, "K-2"],
    [3, "3-5"],
    [4, "3-5"],
    [5, "3-5"],
  ])("grade %s uses the %s experience", (grade, band) => {
    expect(gradeBandFor(grade)).toBe(band);
  });

  test("the demo default is K–2 (CLAUDE.md Section 11)", () => {
    expect(DEFAULT_GRADE_BAND).toBe("K-2");
  });
});
