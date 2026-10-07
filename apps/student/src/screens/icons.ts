import {
  Armchair,
  Backpack,
  BookOpen,
  Calculator,
  FlaskConical,
  Globe,
  Music,
  Palette,
  PencilLine,
  Sun,
  Trees,
  Utensils,
  Volleyball,
  type LucideIcon,
} from "lucide-react";
import type { ClassInfo, ScheduleItem, ScheduleItemKind, Subject } from "../data/types";

export const SUBJECT_ICONS: Readonly<Record<Subject, LucideIcon>> = {
  math: Calculator,
  reading: BookOpen,
  writing: PencilLine,
  science: FlaskConical,
  "social-studies": Globe,
  art: Palette,
  music: Music,
  pe: Volleyball,
};

export const ACTIVITY_ICONS: Readonly<Record<Exclude<ScheduleItemKind, "class">, LucideIcon>> = {
  arrival: Sun,
  break: Armchair,
  recess: Trees,
  lunch: Utensils,
  dismissal: Backpack,
};

/** Picture cue for a schedule item: its subject for classes, its kind otherwise. */
export function scheduleItemIcon(item: ScheduleItem, classes: readonly ClassInfo[]): LucideIcon {
  if (item.kind === "class") {
    const subject = classes.find((c) => c.id === item.classId)?.subject;
    return subject ? SUBJECT_ICONS[subject] : BookOpen;
  }
  return ACTIVITY_ICONS[item.kind];
}
