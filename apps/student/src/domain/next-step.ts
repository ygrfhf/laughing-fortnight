import type { Assignment, AssignmentProgress, ScheduleItem } from "../data/types";
import { doneAssignmentIds } from "./progress";

/** The ONE thing the Today screen shows next (CLAUDE.md Section 5: one clear next step). */
export type NextStep =
  | {
      readonly kind: "assignment";
      readonly assignment: Assignment;
      /** "current-class": belongs to the class happening now. "due-today": earliest other work. */
      readonly reason: "current-class" | "due-today";
    }
  /** A non-class part of the day (arrival, recess, lunch, break, dismissal). */
  | { readonly kind: "activity"; readonly item: ScheduleItem }
  /** The current class had work today and it is all done: ask the teacher what is next. */
  | { readonly kind: "class-finished"; readonly item: ScheduleItem; readonly classId: string }
  /** The current class has no work due today: follow the class, don't jump to other work. */
  | { readonly kind: "class-time"; readonly item: ScheduleItem }
  | { readonly kind: "all-done" };

export interface NextStepInput {
  readonly schedule: readonly ScheduleItem[];
  /** Today's assignments for this student. */
  readonly assignments: readonly Assignment[];
  readonly progress: readonly AssignmentProgress[];
  /** Local time, "HH:MM". */
  readonly time: string;
}

/** The schedule item happening at `time`: start is inclusive, end is exclusive. */
export function findCurrentItem(schedule: readonly ScheduleItem[], time: string): ScheduleItem | null {
  return schedule.find((item) => item.start <= time && time < item.end) ?? null;
}

/**
 * Picks the next step:
 * 1. During a non-class activity (recess, lunch, ...), the activity itself.
 * 2. During a class, only that class: its next unfinished assignment; if its work is all done,
 *    "class-finished" until the block ends; if it had no work today, "class-time".
 *    Never jumps to another class's work mid-class.
 * 3. Outside class time, the next unfinished assignment, or all done. Work stays the next step
 *    before and after school, so home mode shows it too.
 *
 * "Next unfinished" means in-progress work first, then by when its class first meets today
 * (classes not on today's schedule last), then list order.
 */
export function selectNextStep({ schedule, assignments, progress, time }: NextStepInput): NextStep {
  const current = findCurrentItem(schedule, time);
  if (current && current.kind !== "class") {
    return { kind: "activity", item: current };
  }

  const doneIds = doneAssignmentIds(progress);
  const inProgressIds = new Set(progress.filter((p) => p.status === "in_progress").map((p) => p.assignmentId));
  const unfinished = orderForWork(
    assignments.filter((a) => !doneIds.has(a.id)),
    schedule,
    inProgressIds,
  );

  if (current) {
    return nextInClass(current, assignments, unfinished);
  }
  const [first] = unfinished;
  return first ? { kind: "assignment", assignment: first, reason: "due-today" } : { kind: "all-done" };
}

function nextInClass(
  item: ScheduleItem,
  assignments: readonly Assignment[],
  orderedUnfinished: readonly Assignment[],
): NextStep {
  const { classId } = item;
  if (!classId) {
    return { kind: "class-time", item };
  }
  const forClass = orderedUnfinished.find((a) => a.classId === classId);
  if (forClass) {
    return { kind: "assignment", assignment: forClass, reason: "current-class" };
  }
  return assignments.some((a) => a.classId === classId)
    ? { kind: "class-finished", item, classId }
    : { kind: "class-time", item };
}

/** Stable order: in-progress first, then by the class's first slot today, then list order. */
function orderForWork(
  assignments: readonly Assignment[],
  schedule: readonly ScheduleItem[],
  inProgressIds: ReadonlySet<string>,
): readonly Assignment[] {
  const slotOf = (classId: string): number => {
    const index = schedule.findIndex((item) => item.classId === classId);
    // schedule.length (not Infinity) so two unscheduled classes compare as 0, not NaN.
    return index === -1 ? schedule.length : index;
  };
  const startedRank = (a: Assignment): number => (inProgressIds.has(a.id) ? 0 : 1);
  return [...assignments].sort(
    (a, b) => startedRank(a) - startedRank(b) || slotOf(a.classId) - slotOf(b.classId),
  );
}
