import { Card, ProgressMeter } from "@laughing-fortnight/ui";
import { Star } from "lucide-react";
import type { ProgressSummary } from "../../domain/progress";
import { en as strings } from "../../strings/en";
import { ReadAloud } from "../ReadAloud";

interface ProgressCardProps {
  summary: ProgressSummary;
}

/** Progress made today: an encouraging sentence plus one dot per task (visual only). */
export function ProgressCard({ summary }: ProgressCardProps) {
  const sentence = strings.today.progressSummary(summary.done, summary.total);

  return (
    <Card
      heading={strings.today.progressHeading}
      icon={Star}
      action={<ReadAloud what={strings.today.progressHeading} parts={[strings.today.progressHeading, sentence]} />}
    >
      <p>{sentence}</p>
      <ProgressMeter done={summary.done} total={summary.total} />
    </Card>
  );
}
