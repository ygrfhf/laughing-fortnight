import type { ClassInfo, ScheduleItem } from "../../data/types";
import { en as strings } from "../../strings/en";
import { TodaySection } from "./TodaySection";

interface CurrentClassCardProps {
  /** What is happening now, or null before school, between items, or after school. */
  item: ScheduleItem | null;
  classes: readonly ClassInfo[];
}

export function CurrentClassCard({ item, classes }: CurrentClassCardProps) {
  const classInfo = item?.kind === "class" ? classes.find((c) => c.id === item.classId) : undefined;

  return (
    <TodaySection heading={strings.today.rightNowHeading}>
      <p>{item ? item.title : strings.today.noClassNow}</p>
      {classInfo && <p>{strings.today.withTeacher(classInfo.teacherDisplayName)}</p>}
    </TodaySection>
  );
}
