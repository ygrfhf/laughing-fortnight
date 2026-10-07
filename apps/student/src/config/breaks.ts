import type { GradeBand } from "../domain/grade-band";

/**
 * Minutes of class time, back to back, before the break prompt appears. One config value so
 * it can become a teacher setting later. Decided 2026-10-06: 15 for K–2, 25 for 3–5.
 */
export const BREAK_INTERVAL_MINUTES: Readonly<Record<GradeBand, number>> = Object.freeze({
  "K-2": 15,
  "3-5": 25,
});
