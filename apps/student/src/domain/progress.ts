import type { Assignment, AssignmentProgress } from "../data/types";

export interface ProgressSummary {
  readonly done: number;
  readonly total: number;
}

/** Ids of assignments the student has finished. Missing progress means not started. */
export function doneAssignmentIds(progress: readonly AssignmentProgress[]): ReadonlySet<string> {
  return new Set(progress.filter((p) => p.status === "done").map((p) => p.assignmentId));
}

/**
 * How much of today's work is finished. Counts only; never a score, rank, or comparison
 * with other students.
 */
export function summarizeProgress(
  assignments: readonly Assignment[],
  progress: readonly AssignmentProgress[],
): ProgressSummary {
  const doneIds = doneAssignmentIds(progress);
  return {
    done: assignments.filter((a) => doneIds.has(a.id)).length,
    total: assignments.length,
  };
}
