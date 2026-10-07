import { Card, ProgressMeter } from "@laughing-fortnight/ui";
import { Star } from "lucide-react";
import type { ProgressSummary } from "../../domain/progress";
import { en as strings } from "../../strings/en";

interface ProgressCardProps {
  summary: ProgressSummary;
}

/** Progress made today: an encouraging sentence plus one dot per task (visual only). */
export function ProgressCard({ summary }: ProgressCardProps) {
  return (
    <Card heading={strings.today.progressHeading} icon={Star}>
      <p>{strings.today.progressSummary(summary.done, summary.total)}</p>
      <ProgressMeter done={summary.done} total={summary.total} />
    </Card>
  );
}
