import { Card, Icon, VisualTimer } from "@laughing-fortnight/ui";
import { Clock } from "lucide-react";
import type { ClassInfo, ScheduleItem } from "../../data/types";
import { timeLeftInBlock } from "../../domain/class-timer";
import { useGradeBand } from "../../settings/GradeBandProvider";
import { en as strings } from "../../strings/en";
import { scheduleItemIcon } from "../icons";
import { ReadAloud } from "../ReadAloud";

interface CurrentClassCardProps {
  /** What is happening now, or null before school, between items, or after school. */
  item: ScheduleItem | null;
  classes: readonly ClassInfo[];
  /** Local time, "HH:MM". */
  time: string;
}

export function CurrentClassCard({ item, classes, time }: CurrentClassCardProps) {
  const band = useGradeBand();
  // Both bands show the teacher: young kids see different specialist teachers during the day.
  const classInfo = item?.kind === "class" ? classes.find((c) => c.id === item.classId) : undefined;
  const title = item ? item.title : strings.today.noClassNow;
  const teacher = classInfo ? strings.today.withTeacher(classInfo.teacherDisplayName) : "";
  // Decision 1: the timer shows the time left in the current class block (classes only).
  const timeLeft = item?.kind === "class" ? timeLeftInBlock(item, time) : null;
  const minutesLeft = timeLeft ? strings.today.minutesLeft(timeLeft.minutesLeft) : "";

  return (
    <Card
      heading={strings.today.rightNowHeading}
      icon={Clock}
      action={
        <ReadAloud
          what={strings.today.rightNowHeading}
          parts={[strings.today.rightNowHeading, title, teacher, minutesLeft]}
        />
      }
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
      {timeLeft && (
        <p className="lf-row">
          <VisualTimer fractionLeft={timeLeft.fractionLeft} />
          {/* K–2 sees only the disc (like hidden time estimates); screen readers get the sentence. */}
          <span className={band === "K-2" ? "lf-visually-hidden" : undefined}>{minutesLeft}</span>
        </p>
      )}
    </Card>
  );
}
