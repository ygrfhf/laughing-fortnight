/**
 * Behaviour every StudentDataSource must have. The mock runs it today; the real backend
 * client must run the same suite before it replaces the mock.
 */
import { beforeEach, describe, expect, test } from "vitest";
import { NotFoundError, type StudentDataSource } from "./student-data-source";

export interface ContractFixture {
  source: StudentDataSource;
  /** A date with at least two assignments due for this student. */
  date: string;
  /** An assignment that exists but belongs to a class this student is not in. */
  foreignAssignmentId: string;
}

const STUDENT_FIELDS = ["classIds", "firstName", "gradeLevel", "id"];
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const HH_MM = /^([01]\d|2[0-3]):[0-5]\d$/;

export function describeStudentDataSourceContract(
  name: string,
  setup: () => ContractFixture | Promise<ContractFixture>,
): void {
  describe(`StudentDataSource contract: ${name}`, () => {
    let fx: ContractFixture;

    beforeEach(async () => {
      fx = await setup();
    });

    test("getMe returns only the minimal student fields (no email, photo, or contact info)", async () => {
      const me = await fx.source.getMe();

      expect(Object.keys(me).sort()).toEqual(STUDENT_FIELDS);
      expect(me.firstName.length).toBeGreaterThan(0);
    });

    test("getClasses returns exactly the student's own classes", async () => {
      const me = await fx.source.getMe();
      const classes = await fx.source.getClasses();

      expect(classes.map((c) => c.id).sort()).toEqual([...me.classIds].sort());
    });

    test("getSchedule is sorted, well-formed, non-overlapping, and only references own classes", async () => {
      const me = await fx.source.getMe();
      const schedule = await fx.source.getSchedule(fx.date);

      expect(schedule.length).toBeGreaterThan(0);
      for (const item of schedule) {
        expect(item.start).toMatch(HH_MM);
        expect(item.end).toMatch(HH_MM);
        expect(item.start < item.end).toBe(true);
        if (item.kind === "class") {
          expect(me.classIds).toContain(item.classId);
        } else {
          expect(item.classId).toBeUndefined();
        }
      }
      for (let i = 1; i < schedule.length; i++) {
        expect(schedule[i - 1]!.end <= schedule[i]!.start).toBe(true);
      }
    });

    test("getAssignmentsDueOn returns only own-class assignments due that date", async () => {
      const me = await fx.source.getMe();
      const assignments = await fx.source.getAssignmentsDueOn(fx.date);

      expect(assignments.length).toBeGreaterThanOrEqual(2);
      for (const a of assignments) {
        expect(me.classIds).toContain(a.classId);
        expect(a.dueDate).toBe(fx.date);
        expect(a.dueDate).toMatch(ISO_DATE);
        expect(a.steps.length).toBeGreaterThan(0);
        expect(a.estimatedMinutes).toBeGreaterThan(0);
      }
    });

    test("getAssignment returns own assignments and null for other classes or unknown ids", async () => {
      const [first] = await fx.source.getAssignmentsDueOn(fx.date);

      expect(await fx.source.getAssignment(first!.id)).toEqual(first);
      expect(await fx.source.getAssignment(fx.foreignAssignmentId)).toBeNull();
      expect(await fx.source.getAssignment("does-not-exist")).toBeNull();
    });

    test("getMyProgress starts with one not_started record per assignment due", async () => {
      const assignments = await fx.source.getAssignmentsDueOn(fx.date);
      const progress = await fx.source.getMyProgress(fx.date);

      expect(progress.map((p) => p.assignmentId).sort()).toEqual(assignments.map((a) => a.id).sort());
      expect(progress.every((p) => p.status === "not_started")).toBe(true);
    });

    test("markDone records completion and later reads reflect it", async () => {
      const [first] = await fx.source.getAssignmentsDueOn(fx.date);

      const result = await fx.source.markDone(first!.id);
      const progress = await fx.source.getMyProgress(fx.date);

      expect(result.status).toBe("done");
      expect(Number.isNaN(Date.parse(result.completedAt ?? ""))).toBe(false);
      expect(progress.find((p) => p.assignmentId === first!.id)).toEqual(result);
      expect(progress.filter((p) => p.status === "done")).toHaveLength(1);
    });

    test("markDone twice keeps the first completedAt", async () => {
      const [first] = await fx.source.getAssignmentsDueOn(fx.date);

      const once = await fx.source.markDone(first!.id);
      const twice = await fx.source.markDone(first!.id);

      expect(twice).toEqual(once);
    });

    test("markDone rejects for another class's assignment and does not change progress", async () => {
      await expect(fx.source.markDone(fx.foreignAssignmentId)).rejects.toBeInstanceOf(NotFoundError);
      await expect(fx.source.markDone("does-not-exist")).rejects.toBeInstanceOf(NotFoundError);

      const progress = await fx.source.getMyProgress(fx.date);
      expect(progress.every((p) => p.status === "not_started")).toBe(true);
    });

    test("changing a returned object cannot change what later reads return", async () => {
      const me = await fx.source.getMe();
      const original = me.firstName;

      try {
        (me as unknown as Record<string, unknown>).firstName = "Changed";
      } catch {
        // Frozen objects throw in strict mode; that is also acceptable.
      }

      expect((await fx.source.getMe()).firstName).toBe(original);
    });
  });
}
