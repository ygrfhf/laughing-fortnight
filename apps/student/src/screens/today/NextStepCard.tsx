import { Card, Icon } from "@laughing-fortnight/ui";
import { Footprints, Hand, PartyPopper, type LucideIcon } from "lucide-react";
import type { ClassInfo } from "../../data/types";
import type { NextStep } from "../../domain/next-step";
import { en as strings } from "../../strings/en";
import { scheduleItemIcon, SUBJECT_ICONS } from "./icons";

interface NextStepCardProps {
  step: NextStep;
  classes: readonly ClassInfo[];
}

/** Shows ONE next step. The Start button arrives with the assignment view (build step 4). */
export function NextStepCard({ step, classes }: NextStepCardProps) {
  return (
    <Card heading={strings.today.nextStepHeading} icon={Footprints} emphasis="primary">
      <p className="lf-row">
        <Icon icon={nextStepIcon(step, classes)} size="1.5em" />
        {nextStepText(step, classes)}
      </p>
    </Card>
  );
}

function nextStepText(step: NextStep, classes: readonly ClassInfo[]): string {
  switch (step.kind) {
    case "assignment":
      return step.assignment.title;
    case "activity":
    case "class-time":
      return step.item.title;
    case "class-finished": {
      const className = classes.find((c) => c.id === step.classId)?.name ?? step.item.title;
      return strings.today.classFinished(className);
    }
    case "all-done":
      return strings.today.allDone;
  }
}

function nextStepIcon(step: NextStep, classes: readonly ClassInfo[]): LucideIcon {
  switch (step.kind) {
    case "assignment": {
      const subject = classes.find((c) => c.id === step.assignment.classId)?.subject;
      return subject ? SUBJECT_ICONS[subject] : Footprints;
    }
    case "activity":
    case "class-time":
      return scheduleItemIcon(step.item, classes);
    case "class-finished":
      return Hand;
    case "all-done":
      return PartyPopper;
  }
}
