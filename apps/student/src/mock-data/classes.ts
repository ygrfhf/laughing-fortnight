import type { ClassInfo } from "../data/types";
import { deepFreeze } from "./deep-freeze";

/** FAKE classes for development and demos. Teacher names are placeholders. */
export const CLASSES: readonly ClassInfo[] = deepFreeze([
  // Grade 1 homeroom
  { id: "cls-g1-reading", name: "Reading", subject: "reading", teacherDisplayName: "Ms. Sample" },
  { id: "cls-g1-math", name: "Math", subject: "math", teacherDisplayName: "Ms. Sample" },
  { id: "cls-g1-science", name: "Science", subject: "science", teacherDisplayName: "Ms. Sample" },
  { id: "cls-g1-art", name: "Art", subject: "art", teacherDisplayName: "Mr. Placeholder" },
  // Grade 4 homeroom
  { id: "cls-g4-math", name: "Math", subject: "math", teacherDisplayName: "Mx. Example" },
  { id: "cls-g4-reading", name: "Reading", subject: "reading", teacherDisplayName: "Mx. Example" },
  { id: "cls-g4-social", name: "Social Studies", subject: "social-studies", teacherDisplayName: "Mx. Fixture" },
  { id: "cls-g4-music", name: "Music", subject: "music", teacherDisplayName: "Mr. Placeholder" },
]);
