import { NotFoundError, type StudentDataSource } from "../data/student-data-source";
import type { AssignmentProgress } from "../data/types";
import { createAssignments } from "./assignments";
import { CLASSES } from "./classes";
import { deepFreeze } from "./deep-freeze";
import { SCHEDULES } from "./schedule";
import { STUDENTS } from "./students";

export const MOCK_STUDENT_IDS = {
  k2: "stu-k2-demo",
  k2Classmate: "stu-k2-classmate",
  g35: "stu-35-demo",
  g35Classmate: "stu-35-classmate",
} as const;

export interface MockDataSourceOptions {
  /** The pretend signed-in student. */
  studentId: string;
  /** "YYYY-MM-DD": mock assignments are due relative to this date. */
  today: string;
  /** Clock for completedAt timestamps. */
  now?: () => Date;
}

/**
 * In-memory StudentDataSource over fake data. Progress lives only in this object: nothing is
 * written to browser storage, so a reload or the next student on a shared device starts fresh.
 */
export function createMockDataSource({
  studentId,
  today,
  now = () => new Date(),
}: MockDataSourceOptions): StudentDataSource {
  const record = STUDENTS.find((r) => r.student.id === studentId);
  if (!record) {
    throw new Error(`Unknown mock student: ${studentId}`);
  }

  const { student, homeroomId } = record;
  const ownClassIds = new Set(student.classIds);
  const ownClasses = CLASSES.filter((c) => ownClassIds.has(c.id));
  const ownAssignments = createAssignments(today).filter((a) => ownClassIds.has(a.classId));

  let progressById: ReadonlyMap<string, AssignmentProgress> = new Map();

  const progressFor = (assignmentId: string): AssignmentProgress =>
    progressById.get(assignmentId) ?? deepFreeze({ assignmentId, status: "not_started" });

  return {
    async getMe() {
      return student;
    },

    async getClasses() {
      return ownClasses;
    },

    async getSchedule(_date) {
      return SCHEDULES[homeroomId];
    },

    async getAssignmentsDueOn(date) {
      return ownAssignments.filter((a) => a.dueDate === date);
    },

    async getAssignment(id) {
      return ownAssignments.find((a) => a.id === id) ?? null;
    },

    async getMyProgress(date) {
      return ownAssignments.filter((a) => a.dueDate === date).map((a) => progressFor(a.id));
    },

    async markDone(assignmentId) {
      assertOwnAssignment(assignmentId);
      const existing = progressById.get(assignmentId);
      if (existing?.status === "done") {
        return existing;
      }
      const done = deepFreeze<AssignmentProgress>({
        assignmentId,
        status: "done",
        completedAt: now().toISOString(),
      });
      progressById = new Map(progressById).set(assignmentId, done);
      return done;
    },

    async markNotDone(assignmentId) {
      assertOwnAssignment(assignmentId);
      const next = new Map(progressById);
      next.delete(assignmentId);
      progressById = next;
      return progressFor(assignmentId);
    },
  };

  function assertOwnAssignment(assignmentId: string): void {
    if (!ownAssignments.some((a) => a.id === assignmentId)) {
      throw new NotFoundError(`Assignment "${assignmentId}"`);
    }
  }
}
