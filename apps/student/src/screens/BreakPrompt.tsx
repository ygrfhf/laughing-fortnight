import { useEffect, useState } from "react";
import { Button, Card } from "@laughing-fortnight/ui";
import { PersonStanding } from "lucide-react";
import { useNow } from "../clock/ClockProvider";
import { BREAK_INTERVAL_MINUTES } from "../config/breaks";
import { useDataSource } from "../data/DataSourceProvider";
import { toIsoDate, toTimeOfDay } from "../data/dates";
import type { ScheduleItem } from "../data/types";
import { isBreakDue } from "../domain/break-timer";
import { useGradeBand } from "../settings/GradeBandProvider";
import { en as strings } from "../strings/en";
import { ReadAloud } from "./ReadAloud";

interface BreakPromptProps {
  /** When the student last dismissed the prompt ("HH:MM"), kept in memory by App. */
  lastBreakTime: string | null;
  onDismiss: (time: string) => void;
}

/**
 * A gentle, non-modal stretch-break suggestion after a stretch of class time (interval from
 * BREAK_INTERVAL_MINUTES). Lives in a polite live region, never takes focus, never blocks
 * the page, and can always be dismissed.
 */
export function BreakPrompt({ lastBreakTime, onDismiss }: BreakPromptProps) {
  const now = useNow();
  const time = toTimeOfDay(now);
  const band = useGradeBand();
  const schedule = useSchedule(toIsoDate(now));
  const due =
    schedule !== null && isBreakDue({ schedule, time, intervalMinutes: BREAK_INTERVAL_MINUTES[band], lastBreakTime });

  return (
    <div aria-live="polite">
      {due && (
        <Card
          heading={strings.breaks.heading}
          icon={PersonStanding}
          className="lf-break"
          action={<ReadAloud what={strings.breaks.heading} parts={[strings.breaks.heading, strings.breaks.body]} />}
        >
          <p>{strings.breaks.body}</p>
          <div className="lf-actions">
            <Button variant="secondary" onClick={() => onDismiss(time)}>
              {strings.breaks.dismiss}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

/** Today's schedule, or null while loading or if it cannot load (then no prompt is shown). */
function useSchedule(date: string): readonly ScheduleItem[] | null {
  const source = useDataSource();
  const [schedule, setSchedule] = useState<readonly ScheduleItem[] | null>(null);

  useEffect(() => {
    let active = true;
    source.getSchedule(date).then(
      (items) => active && setSchedule(items),
      // The screen below shows its own friendly load error; the prompt just stays hidden.
      () => active && setSchedule(null),
    );
    return () => {
      active = false;
    };
  }, [source, date]);

  return schedule;
}
