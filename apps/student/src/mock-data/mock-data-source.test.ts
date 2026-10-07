import { afterEach, describe, expect, test } from "vitest";
import { describeStudentDataSourceContract } from "../data/student-data-source.contract";
import { addDays } from "../data/dates";
import { createMockDataSource, MOCK_STUDENT_IDS } from "./mock-data-source";

const TODAY = "2026-10-06";
const FIXED_NOW = () => new Date("2026-10-06T14:30:00Z");

const mock = (studentId: string) => createMockDataSource({ studentId, today: TODAY, now: FIXED_NOW });

describeStudentDataSourceContract("mock, K–2 student", () => ({
  source: mock(MOCK_STUDENT_IDS.k2),
  date: TODAY,
  foreignAssignmentId: "asg-g4-math-fractions",
  classmate: mock(MOCK_STUDENT_IDS.k2Classmate),
}));

describeStudentDataSourceContract("mock, 3–5 student", () => ({
  source: mock(MOCK_STUDENT_IDS.g35),
  date: TODAY,
  foreignAssignmentId: "asg-g1-math-count",
  classmate: mock(MOCK_STUDENT_IDS.g35Classmate),
}));

describe("mock data source", () => {
  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  test("throws for an unknown student id", () => {
    expect(() => createMockDataSource({ studentId: "nobody", today: TODAY })).toThrow(/unknown mock student/i);
  });

  test("the K–2 demo student is in grade 1 and the 3–5 demo student is in grade 4", async () => {
    const k2 = await createMockDataSource({ studentId: MOCK_STUDENT_IDS.k2, today: TODAY }).getMe();
    const g35 = await createMockDataSource({ studentId: MOCK_STUDENT_IDS.g35, today: TODAY }).getMe();

    expect(k2.gradeLevel).toBe(1);
    expect(g35.gradeLevel).toBe(4);
  });

  test("assignments due on another date are not returned for today", async () => {
    const source = createMockDataSource({ studentId: MOCK_STUDENT_IDS.k2, today: TODAY });

    const today = await source.getAssignmentsDueOn(TODAY);
    const tomorrow = await source.getAssignmentsDueOn(addDays(TODAY, 1));

    expect(tomorrow.length).toBeGreaterThan(0);
    const todayIds = new Set(today.map((a) => a.id));
    expect(tomorrow.some((a) => todayIds.has(a.id))).toBe(false);
  });

  test("completedAt comes from the injected clock", async () => {
    const source = createMockDataSource({ studentId: MOCK_STUDENT_IDS.k2, today: TODAY, now: FIXED_NOW });
    const [first] = await source.getAssignmentsDueOn(TODAY);

    const result = await source.markDone(first!.id);

    expect(result.completedAt).toBe("2026-10-06T14:30:00.000Z");
  });

  test("progress is in memory only: nothing is written to browser storage", async () => {
    const source = createMockDataSource({ studentId: MOCK_STUDENT_IDS.k2, today: TODAY });
    const [first] = await source.getAssignmentsDueOn(TODAY);

    await source.markDone(first!.id);

    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
  });

  test("a new source starts fresh (shared cart devices keep no state between students)", async () => {
    const first = createMockDataSource({ studentId: MOCK_STUDENT_IDS.k2, today: TODAY });
    const [assignment] = await first.getAssignmentsDueOn(TODAY);
    await first.markDone(assignment!.id);

    const second = createMockDataSource({ studentId: MOCK_STUDENT_IDS.k2, today: TODAY });
    const progress = await second.getMyProgress(TODAY);

    expect(progress.every((p) => p.status === "not_started")).toBe(true);
  });

  test("one student's progress never appears in another student's source", async () => {
    const k2 = createMockDataSource({ studentId: MOCK_STUDENT_IDS.k2, today: TODAY });
    const g35 = createMockDataSource({ studentId: MOCK_STUDENT_IDS.g35, today: TODAY });
    const [k2Assignment] = await k2.getAssignmentsDueOn(TODAY);

    await k2.markDone(k2Assignment!.id);
    const g35Progress = await g35.getMyProgress(TODAY);

    expect(g35Progress.some((p) => p.assignmentId === k2Assignment!.id)).toBe(false);
    expect(g35Progress.every((p) => p.status === "not_started")).toBe(true);
  });
});
