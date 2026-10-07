import { describe, expect, test } from "vitest";
import type { ScheduleItem } from "../data/types";
import { BREAK_INTERVAL_MINUTES } from "../config/breaks";
import { isBreakDue } from "./break-timer";

const schedule: readonly ScheduleItem[] = [
  { id: "arrive", kind: "arrival", title: "Good morning", start: "08:00", end: "08:15" },
  { id: "read", kind: "class", classId: "reading", title: "Reading", start: "08:15", end: "09:15" },
  { id: "math", kind: "class", classId: "math", title: "Math", start: "09:15", end: "10:15" },
  { id: "recess", kind: "recess", title: "Recess", start: "10:15", end: "10:35" },
  { id: "sci", kind: "class", classId: "science", title: "Science", start: "10:35", end: "11:30" },
];

const due = (time: string, intervalMinutes: number, lastBreakTime: string | null = null) =>
  isBreakDue({ schedule, time, intervalMinutes, lastBreakTime });

describe("BREAK_INTERVAL_MINUTES (one config value, future teacher setting)", () => {
  test("is 15 minutes for K–2 and 25 minutes for 3–5", () => {
    expect(BREAK_INTERVAL_MINUTES).toEqual({ "K-2": 15, "3-5": 25 });
  });
});

describe("isBreakDue", () => {
  test("becomes due after the interval of class time back to back", () => {
    expect(due("08:29", 15)).toBe(false);
    expect(due("08:30", 15)).toBe(true);
    expect(due("08:39", 25)).toBe(false);
    expect(due("08:40", 25)).toBe(true);
  });

  test("counts back-to-back class blocks as one stretch of work", () => {
    expect(due("09:20", 60)).toBe(true); // Reading 08:15 + Math, 65 minutes in
  });

  test("is never due during recess, lunch, breaks, or outside the school day", () => {
    expect(due("10:20", 15)).toBe(false);
    expect(due("08:05", 15)).toBe(false);
    expect(due("07:00", 15)).toBe(false);
    expect(due("15:00", 15)).toBe(false);
  });

  test("recess resets the count", () => {
    expect(due("10:45", 15)).toBe(false); // 10 minutes into Science
    expect(due("10:50", 15)).toBe(true);
  });

  test("dismissing the prompt restarts the count from that moment", () => {
    expect(due("08:40", 15, "08:30")).toBe(false);
    expect(due("08:45", 15, "08:30")).toBe(true);
  });

  test("a dismissal from before the current stretch does not delay it", () => {
    expect(due("10:50", 15, "09:30")).toBe(true);
  });
});
