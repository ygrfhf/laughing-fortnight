import type { GradeLevel } from "../data/types";

/** CLAUDE.md Section 5: K–2 is icon-first and read-aloud; 3–5 has more text and independence. */
export type GradeBand = "K-2" | "3-5";

/** Demo default (CLAUDE.md Section 11), used until the student's grade is known. */
export const DEFAULT_GRADE_BAND: GradeBand = "K-2";

export function gradeBandFor(grade: GradeLevel): GradeBand {
  return grade === "K" || grade <= 2 ? "K-2" : "3-5";
}
