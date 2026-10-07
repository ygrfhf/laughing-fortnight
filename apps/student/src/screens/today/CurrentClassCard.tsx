import { Card, Icon } from "@laughing-fortnight/ui";
import { Clock } from "lucide-react";
import type { ClassInfo, ScheduleItem } from "../../data/types";
import { en as strings } from "../../strings/en";
import { scheduleItemIcon } from "../icons";
import { ReadAloud } from "../ReadAloud";

interface CurrentClassCardProps {
  /** What is happening now, or null before school, between items, or after school. */
  item: ScheduleItem | null;
  classes: readonly ClassInfo[];
}

export function CurrentClassCard({ item, classes }: CurrentClassCardProps) {
  // Both bands show the teacher: young kids see different specialist teachers during the day.
  const classInfo = item?.kind === "class" ? classes.find((c) => c.id === item.classId) : undefined;
  const title = item ? item.title : strings.today.noClassNow;
  const teacher = classInfo ? strings.today.withTeacher(classInfo.teacherDisplayName) : "";

  return (
    <Card
      heading={strings.today.rightNowHeading}
      icon={Clock}
      action={<ReadAloud what={strings.today.rightNowHeading} parts={[strings.today.rightNowHeading, title, teacher]} />}
    >
      {item ? (
        <p className="lf-row">
          <Icon icon={scheduleItemIcon(item, classes)} size="1.5em" />
          {title}
        </p>
      ) : (
        <p>{title}</p>
      )}
      {teacher && <p className="lf-text-muted">{teacher}</p>}
    </Card>
  );
}
