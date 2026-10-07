import { describe, expect, test } from "vitest";
import type { Assignment, AssignmentProgress } from "../data/types";
import { summarizeProgress } from "./progress";

const assignment = (id: string): Assignment => ({
  id,
  classId: "math",
  title: id,
  steps: [{ id: "s1", text: "Do it." }],
  estimatedMinutes: 10,
  dueDate: "2026-10-06",
});

const today = [assignment("a"), assignment("b"), assignment("c")];

describe("summarizeProgress", () => {
  test("counts finished work out of today's assignments", () => {
    const progress: AssignmentProgress[] = [
      { assignmentId: "a", status: "done", completedAt: "2026-10-06T09:00:00.000Z" },
      { assignmentId: "b", status: "in_progress" },
    ];

    expect(summarizeProgress(today, progress)).toEqual({ done: 1, total: 3 });
  });

  test("ignores progress for assignments that are not due today", () => {
    const progress: AssignmentProgress[] = [
      { assignmentId: "yesterday", status: "done", completedAt: "2026-10-05T09:00:00.000Z" },
    ];

    expect(summarizeProgress(today, progress)).toEqual({ done: 0, total: 3 });
  });

  test("handles a day with nothing due", () => {
    expect(summarizeProgress([], [])).toEqual({ done: 0, total: 0 });
  });
});
