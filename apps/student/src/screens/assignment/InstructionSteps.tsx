import { Card, Icon } from "@laughing-fortnight/ui";
import { BookOpen, CircleCheck, Ear, Hash, Lightbulb, ListOrdered, Paintbrush, PencilLine, type LucideIcon } from "lucide-react";
import type { InstructionStep, StepIcon } from "../../data/types";
import { en as strings } from "../../strings/en";
import { ReadAloud } from "../ReadAloud";

const STEP_ICONS: Readonly<Record<StepIcon, LucideIcon>> = {
  read: BookOpen,
  write: PencilLine,
  draw: Paintbrush,
  count: Hash,
  listen: Ear,
  think: Lightbulb,
  check: CircleCheck,
};

interface InstructionStepsProps {
  /** Assignment title, read first by the read-aloud button. */
  title: string;
  steps: readonly InstructionStep[];
}

/** Numbered steps, each with an optional picture cue (decorative; the text says it all). */
export function InstructionSteps({ title, steps }: InstructionStepsProps) {
  const spoken = [
    title,
    strings.assignment.stepsHeading,
    ...steps.map((step, index) => `${strings.readAloud.stepNumber(index + 1)} ${step.text}`),
  ];

  return (
    <Card
      heading={strings.assignment.stepsHeading}
      icon={ListOrdered}
      action={<ReadAloud what={strings.assignment.stepsHeading} parts={spoken} />}
    >
      <ol className="lf-steps">
        {steps.map((step) => (
          <li key={step.id}>
            <span className="lf-row">
              {step.icon && <Icon icon={STEP_ICONS[step.icon]} size="1.5em" />}
              {step.text}
            </span>
          </li>
        ))}
      </ol>
    </Card>
  );
}
