/**
 * Enforces "fake data only" (CLAUDE.md Section 2, .claude/rules/child-safety.md) on the
 * mock data itself, not just on what the data source returns.
 */
import { describe, expect, test } from "vitest";
import { STUDENTS } from "./students";
import { CLASSES } from "./classes";

const rawSources = import.meta.glob<string>(["./*.ts", "!./*.test.ts"], {
  query: "?raw",
  import: "default",
  eager: true,
});

/** Adding a student or teacher means choosing an obviously fake name and listing it here. */
const FAKE_STUDENT_FIRST_NAMES = new Set(["Testy", "Demo"]);
const FAKE_TEACHER_NAMES = new Set(["Mx. Example", "Mr. Placeholder", "Ms. Sample", "Mx. Fixture"]);

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const ALLOWED_EMAIL = /@example\.(com|org|net)$|\.test$|\.invalid$/i;
const IMAGE_OR_MEDIA = /\.(png|jpe?g|gif|webp|avif|heic|bmp|svg|mp3|mp4|wav|webm)\b|data:image\//i;
const URL = /https?:\/\//i;

describe("mock data is obviously fake", () => {
  test("the scan actually reads the mock data files", () => {
    const names = Object.keys(rawSources);

    expect(names).toEqual(expect.arrayContaining(["./students.ts", "./classes.ts", "./assignments.ts", "./schedule.ts"]));
  });

  test.each(Object.entries(rawSources))("%s has no real-looking emails", (_file, text) => {
    const emails = text.match(EMAIL) ?? [];

    expect(emails.filter((e) => !ALLOWED_EMAIL.test(e))).toEqual([]);
  });

  test.each(Object.entries(rawSources))("%s has no images, media, or links", (_file, text) => {
    expect(text).not.toMatch(IMAGE_OR_MEDIA);
    expect(text).not.toMatch(URL);
  });

  test("every student has an allowlisted fake first name", () => {
    for (const record of STUDENTS) {
      expect(FAKE_STUDENT_FIRST_NAMES).toContain(record.student.firstName);
    }
  });

  test("every teacher has an allowlisted fake name", () => {
    for (const c of CLASSES) {
      expect(FAKE_TEACHER_NAMES).toContain(c.teacherDisplayName);
    }
  });
});
