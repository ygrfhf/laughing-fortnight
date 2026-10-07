import type { ScheduleItem } from "../data/types";
import { deepFreeze } from "./deep-freeze";
import type { HomeroomId } from "./students";

/** FAKE daily schedules, the same every day. Sorted by start time with no overlaps. */
export const SCHEDULES: Readonly<Record<HomeroomId, readonly ScheduleItem[]>> = deepFreeze({
  "homeroom-g1": [
    { id: "g1-arrival", kind: "arrival", title: "Good morning", start: "08:00", end: "08:15" },
    { id: "g1-reading", kind: "class", classId: "cls-g1-reading", title: "Reading", start: "08:15", end: "09:15" },
    { id: "g1-math", kind: "class", classId: "cls-g1-math", title: "Math", start: "09:15", end: "10:15" },
    { id: "g1-recess", kind: "recess", title: "Recess", start: "10:15", end: "10:35" },
    { id: "g1-science", kind: "class", classId: "cls-g1-science", title: "Science", start: "10:35", end: "11:30" },
    { id: "g1-lunch", kind: "lunch", title: "Lunch", start: "11:30", end: "12:15" },
    { id: "g1-quiet", kind: "break", title: "Quiet time", start: "12:15", end: "12:30" },
    { id: "g1-art", kind: "class", classId: "cls-g1-art", title: "Art", start: "12:30", end: "13:30" },
    { id: "g1-math-centers", kind: "class", classId: "cls-g1-math", title: "Math centers", start: "13:30", end: "14:20" },
    { id: "g1-dismissal", kind: "dismissal", title: "Pack up", start: "14:20", end: "14:30" },
  ],
  "homeroom-g4": [
    { id: "g4-arrival", kind: "arrival", title: "Morning meeting", start: "08:00", end: "08:10" },
    { id: "g4-math", kind: "class", classId: "cls-g4-math", title: "Math", start: "08:10", end: "09:10" },
    { id: "g4-reading", kind: "class", classId: "cls-g4-reading", title: "Reading", start: "09:10", end: "10:10" },
    { id: "g4-recess", kind: "recess", title: "Recess", start: "10:10", end: "10:30" },
    { id: "g4-social", kind: "class", classId: "cls-g4-social", title: "Social Studies", start: "10:30", end: "11:30" },
    { id: "g4-lunch", kind: "lunch", title: "Lunch", start: "11:30", end: "12:10" },
    { id: "g4-music", kind: "class", classId: "cls-g4-music", title: "Music", start: "12:10", end: "13:00" },
    { id: "g4-break", kind: "break", title: "Stretch break", start: "13:00", end: "13:15" },
    { id: "g4-writing", kind: "class", classId: "cls-g4-reading", title: "Writing workshop", start: "13:15", end: "14:20" },
    { id: "g4-dismissal", kind: "dismissal", title: "Pack up", start: "14:20", end: "14:30" },
  ],
});
