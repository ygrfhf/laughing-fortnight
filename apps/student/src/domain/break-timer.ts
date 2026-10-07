import { timeToMinutes } from "../data/dates";
import type { ScheduleItem } from "../data/types";
import { findCurrentItem } from "./next-step";

export interface BreakDueInput {
  /** Sorted by start time, as StudentDataSource.getSchedule returns it. */
  readonly schedule: readonly ScheduleItem[];
  /** Local time, "HH:MM". */
  readonly time: string;
  readonly intervalMinutes: number;
  /** When the student last dismissed the prompt ("HH:MM"), or null. */
  readonly lastBreakTime: string | null;
}

/**
 * True when the student has been in class blocks, back to back, for at least
 * `intervalMinutes` since the stretch began or since they last dismissed the prompt.
 * Never during recess, lunch, breaks, or outside the school day.
 */
export function isBreakDue({ schedule, time, intervalMinutes, lastBreakTime }: BreakDueInput): boolean {
  const current = findCurrentItem(schedule, time);
  if (!current || current.kind !== "class") {
    return false;
  }
  const stretchStart = timeToMinutes(classStretchStart(schedule, current));
  const lastBreak = lastBreakTime === null ? -1 : timeToMinutes(lastBreakTime);
  const countingFrom = Math.max(stretchStart, lastBreak);
  return timeToMinutes(time) - countingFrom >= intervalMinutes;
}

/** Start of the run of class blocks that ends with `current` (no gaps, no non-class items). */
function classStretchStart(schedule: readonly ScheduleItem[], current: ScheduleItem): string {
  let index = schedule.indexOf(current);
  while (index > 0) {
    const previous = schedule[index - 1]!;
    const here = schedule[index]!;
    if (previous.kind !== "class" || previous.end !== here.start) break;
    index -= 1;
  }
  return schedule[index]!.start;
}
