import { Card, Icon } from "@laughing-fortnight/ui";
import { Clock } from "lucide-react";
import type { ClassInfo, ScheduleItem } from "../../data/types";
import { en as strings } from "../../strings/en";
import { scheduleItemIcon } from "../icons";

interface CurrentClassCardProps {
  /** What is happening now, or null before school, between items, or after school. */
  item: ScheduleItem | null;
  classes: readonly ClassInfo[];
}

export function CurrentClassCard({ item, classes }: CurrentClassCardProps) {
  // Both bands show the teacher: young kids see different specialist teachers during the day.
  const classInfo = item?.kind === "class" ? classes.find((c) => c.id === item.classId) : undefined;

  return (
    <Card heading={strings.today.rightNowHeading} icon={Clock}>
      {item ? (
        <p className="lf-row">
          <Icon icon={scheduleItemIcon(item, classes)} size="1.5em" />
          {item.title}
        </p>
      ) : (
        <p>{strings.today.noClassNow}</p>
      )}
      {classInfo && <p className="lf-text-muted">{strings.today.withTeacher(classInfo.teacherDisplayName)}</p>}
    </Card>
  );
}
