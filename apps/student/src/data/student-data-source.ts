import type { Assignment, AssignmentProgress, ClassInfo, ScheduleItem, Student } from "./types";

/**
 * Everything the student screens read or write. Screens depend on this interface only, so
 * the mock can be swapped for the real backend without touching them.
 *
 * There are no studentId parameters on purpose: the source is bound to the signed-in student
 * (mock: at construction; real backend: from the session). A screen cannot ask for another
 * student's data. The real backend must also enforce this with row-level security.
 *
 * Dates are ISO local dates, "YYYY-MM-DD".
 */
export interface StudentDataSource {
  getMe(): Promise<Student>;
  /** Only the signed-in student's classes. */
  getClasses(): Promise<readonly ClassInfo[]>;
  /** The student's day, sorted by start time. */
  getSchedule(date: string): Promise<readonly ScheduleItem[]>;
  /** Assignments due on `date` in the student's own classes. */
  getAssignmentsDueOn(date: string): Promise<readonly Assignment[]>;
  /** Null when the assignment does not exist or is not in one of the student's classes. */
  getAssignment(id: string): Promise<Assignment | null>;
  /** One record per assignment due on `date`; assignments with no activity are "not_started". */
  getMyProgress(date: string): Promise<readonly AssignmentProgress[]>;
  /**
   * Marks one of the student's assignments done. Calling it again keeps the first completedAt.
   * Rejects with NotFoundError if the assignment is not visible to this student.
   */
  markDone(assignmentId: string): Promise<AssignmentProgress>;
}

export class NotFoundError extends Error {
  constructor(what: string) {
    super(`${what} not found`);
    this.name = "NotFoundError";
  }
}
