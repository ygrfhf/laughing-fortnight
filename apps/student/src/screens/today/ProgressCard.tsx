import type { ProgressSummary } from "../../domain/progress";
import { en as strings } from "../../strings/en";
import { TodaySection } from "./TodaySection";

interface ProgressCardProps {
  summary: ProgressSummary;
}

/** Progress made today, in encouraging words. A visual meter arrives in build step 3. */
export function ProgressCard({ summary }: ProgressCardProps) {
  return (
    <TodaySection heading={strings.today.progressHeading}>
      <p>{strings.today.progressSummary(summary.done, summary.total)}</p>
    </TodaySection>
  );
}
