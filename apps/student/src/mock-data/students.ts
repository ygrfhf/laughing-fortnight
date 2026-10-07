import type { Student } from "../data/types";
import { deepFreeze } from "./deep-freeze";

export type HomeroomId = "homeroom-g1" | "homeroom-g4";

/** Mock-only wrapper: the homeroom picks the daily schedule and is never exposed to screens. */
export interface MockStudentRecord {
  readonly student: Student;
  readonly homeroomId: HomeroomId;
}

/** FAKE students for development and demos. Never replace these with real children. */
export const STUDENTS: readonly MockStudentRecord[] = deepFreeze([
  {
    student: {
      id: "stu-k2-demo",
      firstName: "Testy",
      gradeLevel: 1,
      classIds: ["cls-g1-reading", "cls-g1-math", "cls-g1-science", "cls-g1-art"],
    },
    homeroomId: "homeroom-g1",
  },
  {
    student: {
      id: "stu-35-demo",
      firstName: "Demo",
      gradeLevel: 4,
      classIds: ["cls-g4-math", "cls-g4-reading", "cls-g4-social", "cls-g4-music"],
    },
    homeroomId: "homeroom-g4",
  },
]);
