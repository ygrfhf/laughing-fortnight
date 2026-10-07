import type { ClassInfo } from "../../data/types";
import type { NextStep } from "../../domain/next-step";
import { en as strings } from "../../strings/en";
import { TodaySection } from "./TodaySection";

interface NextStepCardProps {
  step: NextStep;
  classes: readonly ClassInfo[];
}

/** Shows ONE next step. The Start button arrives with the assignment view (build step 4). */
export function NextStepCard({ step, classes }: NextStepCardProps) {
  return (
    <TodaySection heading={strings.today.nextStepHeading}>
      <p>{nextStepText(step, classes)}</p>
    </TodaySection>
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
