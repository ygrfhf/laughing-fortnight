/**
 * Data shapes the student app reads. Each field is listed in docs/data-inventory.md with
 * its purpose, retention, and who can access it. Add a field here only with an entry there.
 */

export type GradeLevel = "K" | 1 | 2 | 3 | 4 | 5;

export type Subject =
  | "math"
  | "reading"
  | "writing"
  | "science"
  | "social-studies"
  | "art"
  | "music"
  | "pe";

/** Picture cues for K–2 instruction steps. The UI maps these to icons. */
export type StepIcon = "read" | "write" | "draw" | "count" | "listen" | "think" | "check";

/** The signed-in student. Deliberately minimal: no email, photo, birthday, or contact info. */
export interface Student {
  readonly id: string;
  readonly firstName: string;
  readonly gradeLevel: GradeLevel;
  readonly classIds: readonly string[];
}

export interface ClassInfo {
  readonly id: string;
  readonly name: string;
  readonly subject: Subject;
  readonly teacherDisplayName: string;
}

export type ScheduleItemKind = "arrival" | "class" | "break" | "recess" | "lunch" | "dismissal";

export interface ScheduleItem {
  readonly id: string;
  readonly kind: ScheduleItemKind;
  /** Set only when kind === "class". */
  readonly classId?: string;
  readonly title: string;
  /** Local school time, "HH:MM" (24-hour). */
  readonly start: string;
  /** Local school time, "HH:MM" (24-hour). */
  readonly end: string;
}

export interface InstructionStep {
  readonly id: string;
  readonly text: string;
  readonly icon?: StepIcon;
}

/** Class-level: the same for every student in the class. */
export interface Assignment {
  readonly id: string;
  readonly classId: string;
  readonly title: string;
  readonly steps: readonly InstructionStep[];
  readonly estimatedMinutes: number;
  /** ISO local date, "YYYY-MM-DD". */
  readonly dueDate: string;
}

export type ProgressStatus = "not_started" | "in_progress" | "done";

/** Per-student. Becomes a row-level-security table when the real backend arrives. */
export interface AssignmentProgress {
  readonly assignmentId: string;
  readonly status: ProgressStatus;
  /** ISO timestamp, set when status becomes "done". */
  readonly completedAt?: string;
}
