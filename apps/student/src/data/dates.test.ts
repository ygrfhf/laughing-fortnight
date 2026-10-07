import { describe, expect, test } from "vitest";
import { addDays, toIsoDate } from "./dates";

describe("toIsoDate", () => {
  test("formats the local calendar date with zero padding", () => {
    expect(toIsoDate(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
  });
});

describe("addDays", () => {
  test("crosses month and year boundaries", () => {
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  test("rejects anything that is not YYYY-MM-DD", () => {
    expect(() => addDays("10/06/2026", 1)).toThrow(/YYYY-MM-DD/);
  });
});
