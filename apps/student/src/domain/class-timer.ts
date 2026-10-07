import { timeToMinutes } from "../data/dates";
import type { ScheduleItem } from "../data/types";

export interface TimeLeft {
  readonly minutesLeft: number;
  readonly totalMinutes: number;
  /** 1 at the start of the block, approaching 0 at the end. */
  readonly fractionLeft: number;
}

/** Time left in a schedule block at `time` ("HH:MM"), or null outside it. */
export function timeLeftInBlock(item: ScheduleItem, time: string): TimeLeft | null {
  const now = timeToMinutes(time);
  const start = timeToMinutes(item.start);
  const end = timeToMinutes(item.end);
  if (now < start || now >= end) {
    return null;
  }
  const totalMinutes = end - start;
  const minutesLeft = end - now;
  return { minutesLeft, totalMinutes, fractionLeft: minutesLeft / totalMinutes };
}
