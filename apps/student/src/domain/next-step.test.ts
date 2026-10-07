import { describe, expect, test } from "vitest";
import type { Assignment, AssignmentProgress, ScheduleItem } from "../data/types";
import { findCurrentItem, selectNextStep } from "./next-step";

const DATE = "2026-10-06";

const schedule: readonly ScheduleItem[] = Object.freeze([
  { id: "arrive", kind: "arrival", title: "Good morning", start: "08:00", end: "08:15" },
  { id: "read", kind: "class", classId: "reading", title: "Reading", start: "08:15", end: "09:15" },
  { id: "math", kind: "class", classId: "math", title: "Math", start: "09:15", end: "10:15" },
  { id: "recess", kind: "recess", title: "Recess", start: "10:15", end: "10:35" },
  { id: "art", kind: "class", classId: "art", title: "Art", start: "10:35", end: "11:30" },
  { id: "lunch", kind: "lunch", title: "Lunch", start: "11:30", end: "12:15" },
  { id: "bye", kind: "dismissal", title: "Pack up", start: "14:20", end: "14:30" },
]);

const assignment = (id: string, classId: string): Assignment => ({
  id,
  classId,
  title: `Title ${id}`,
  steps: [{ id: "s1", text: "Do it." }],
  estimatedMinutes: 10,
  dueDate: DATE,
});

// Listed out of schedule order on purpose: ordering must come from the schedule.
const assignments: readonly Assignment[] = Object.freeze([
  assignment("art-1", "art"),
  assignment("math-1", "math"),
  assignment("math-2", "math"),
  assignment("reading-1", "reading"),
]);

const done = (...ids: string[]): AssignmentProgress[] =>
  ids.map((assignmentId) => ({ assignmentId, status: "done", completedAt: `${DATE}T12:00:00.000Z` }));

const next = (time: string, progress: readonly AssignmentProgress[] = [], list = assignments) =>
  selectNextStep({ schedule, assignments: list, progress, time });

describe("findCurrentItem", () => {
  test("includes the start minute and excludes the end minute", () => {
    expect(findCurrentItem(schedule, "09:15")?.id).toBe("math");
    expect(findCurrentItem(schedule, "10:14")?.id).toBe("math");
    expect(findCurrentItem(schedule, "10:15")?.id).toBe("recess");
  });

  test("returns null before school, in gaps, and after school", () => {
    expect(findCurrentItem(schedule, "07:59")).toBeNull();
    expect(findCurrentItem(schedule, "13:00")).toBeNull();
    expect(findCurrentItem(schedule, "14:30")).toBeNull();
  });
});

describe("selectNextStep", () => {
  test("during a class, picks the first unfinished assignment for that class", () => {
    expect(next("09:30")).toEqual({ kind: "assignment", assignment: assignments[1], reason: "current-class" });
    expect(next("09:30", done("math-1"))).toEqual({
      kind: "assignment",
      assignment: assignments[2],
      reason: "current-class",
    });
  });

  test("when the current class's work is done, says so instead of jumping to another class's work", () => {
    const result = next("09:30", done("math-1", "math-2"));

    expect(result).toEqual({ kind: "class-finished", item: schedule[2], classId: "math" });
  });

  test("keeps saying the class work is finished until the class block ends", () => {
    expect(next("10:14", done("math-1", "math-2"))).toMatchObject({ kind: "class-finished", classId: "math" });
    expect(next("10:15", done("math-1", "math-2"))).toMatchObject({ kind: "activity", item: { id: "recess" } });
  });

  test("during a class with nothing due today, the class itself is the step (no jumping to other work)", () => {
    const list = assignments.filter((a) => a.classId !== "math");

    expect(next("09:30", [], list)).toEqual({ kind: "class-time", item: schedule[2] });
  });

  test("in-progress work for the current class comes before its not-started work", () => {
    const progress: AssignmentProgress[] = [{ assignmentId: "math-2", status: "in_progress" }];

    expect(next("09:30", progress)).toEqual({ kind: "assignment", assignment: assignments[2], reason: "current-class" });
  });

  test("outside class, in-progress work comes before earlier not-started work", () => {
    const progress: AssignmentProgress[] = [{ assignmentId: "art-1", status: "in_progress" }];

    expect(next("07:30", progress)).toEqual({ kind: "assignment", assignment: assignments[0], reason: "due-today" });
  });

  test("another class's in-progress work never overrides the current class rule", () => {
    const progress: AssignmentProgress[] = [{ assignmentId: "art-1", status: "in_progress" }];

    expect(next("09:30", progress)).toEqual({ kind: "assignment", assignment: assignments[1], reason: "current-class" });
  });

  test("several in-progress assignments keep schedule order among themselves", () => {
    const progress: AssignmentProgress[] = [
      { assignmentId: "art-1", status: "in_progress" },
      { assignmentId: "math-2", status: "in_progress" },
    ];

    expect(next("07:30", progress)).toEqual({ kind: "assignment", assignment: assignments[2], reason: "due-today" });
  });

  test("before school, picks the first unfinished assignment in schedule order", () => {
    expect(next("07:30")).toEqual({ kind: "assignment", assignment: assignments[3], reason: "due-today" });
  });

  test("after school, unfinished work is still the next step (home mode)", () => {
    expect(next("16:00", done("reading-1", "math-1"))).toEqual({
      kind: "assignment",
      assignment: assignments[2],
      reason: "due-today",
    });
  });

  test.each([
    ["08:05", "arrive"],
    ["10:20", "recess"],
    ["11:45", "lunch"],
    ["14:25", "bye"],
  ])("at %s the non-class activity is the next step", (time, itemId) => {
    expect(next(time)).toEqual({ kind: "activity", item: schedule.find((i) => i.id === itemId) });
  });

  test("returns all-done outside class time when everything due today is finished", () => {
    expect(next("07:30", done("art-1", "math-1", "math-2", "reading-1"))).toEqual({ kind: "all-done" });
    expect(next("16:00", done("art-1", "math-1", "math-2", "reading-1"))).toEqual({ kind: "all-done" });
  });

  test("mid-class with everything finished, still points the student to their teacher", () => {
    expect(next("09:30", done("art-1", "math-1", "math-2", "reading-1"))).toMatchObject({
      kind: "class-finished",
      classId: "math",
    });
  });

  test("returns all-done when nothing is due and no class is running", () => {
    expect(next("13:00", [], [])).toEqual({ kind: "all-done" });
  });

  test("assignments for classes not on today's schedule come last, in list order", () => {
    const list = [assignment("pe-1", "pe"), ...assignments];

    const result = next("07:30", done("reading-1", "math-1", "math-2", "art-1"), list);

    expect(result).toEqual({ kind: "assignment", assignment: list[0], reason: "due-today" });
  });

  test("keeps list order between two classes that are both missing from the schedule", () => {
    const list = [assignment("pe-1", "pe"), assignment("music-1", "music"), assignment("pe-2", "pe")];

    expect(next("07:30", done("pe-1"), list)).toEqual({ kind: "assignment", assignment: list[1], reason: "due-today" });
  });

  test("ignores progress for assignments not in the list and treats missing progress as not started", () => {
    const result = next("09:30", [...done("someone-elses"), { assignmentId: "math-1", status: "in_progress" }]);

    expect(result).toEqual({ kind: "assignment", assignment: assignments[1], reason: "current-class" });
  });

  test("always returns exactly one next step and never changes its inputs", () => {
    const progress = Object.freeze(done("math-1"));

    for (const time of ["07:00", "08:05", "09:30", "10:20", "13:00", "16:00"]) {
      const result = next(time, progress);
      expect(["assignment", "activity", "class-finished", "class-time", "all-done"]).toContain(result.kind);
    }
  });
});
