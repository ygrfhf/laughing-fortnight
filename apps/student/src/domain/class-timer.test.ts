import { describe, expect, test } from "vitest";
import type { ScheduleItem } from "../data/types";
import { timeLeftInBlock } from "./class-timer";

const math: ScheduleItem = { id: "math", kind: "class", classId: "math", title: "Math", start: "09:15", end: "10:15" };

describe("timeLeftInBlock", () => {
  test("counts the minutes left and the fraction of the block remaining", () => {
    expect(timeLeftInBlock(math, "09:30")).toEqual({ minutesLeft: 45, totalMinutes: 60, fractionLeft: 0.75 });
  });

  test("is full at the start of the block and down to the last minute just before the end", () => {
    expect(timeLeftInBlock(math, "09:15")?.fractionLeft).toBe(1);
    expect(timeLeftInBlock(math, "10:14")?.minutesLeft).toBe(1);
  });

  test("returns null outside the block", () => {
    expect(timeLeftInBlock(math, "09:14")).toBeNull();
    expect(timeLeftInBlock(math, "10:15")).toBeNull();
  });
});
