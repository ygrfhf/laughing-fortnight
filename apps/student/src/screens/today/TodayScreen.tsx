import { useNow } from "../../clock/ClockProvider";
import { toIsoDate, toTimeOfDay } from "../../data/dates";
import { findCurrentItem, selectNextStep } from "../../domain/next-step";
import { summarizeProgress } from "../../domain/progress";
import { en as strings } from "../../strings/en";
import { PageHeading } from "../PageHeading";
import { CurrentClassCard } from "./CurrentClassCard";
import { NextStepCard } from "./NextStepCard";
import { ProgressCard } from "./ProgressCard";
import { useTodayData, type TodayData } from "./use-today-data";

/** CLAUDE.md Section 5: current class, the ONE next thing to do, and progress made today. */
export function TodayScreen() {
  const now = useNow();
  const state = useTodayData(toIsoDate(now));

  return (
    <>
      <PageHeading text={strings.today.heading} />
      {state.status === "loading" && <p role="status">{strings.common.loading}</p>}
      {/* Fail closed: children see a friendly message, never raw error details. */}
      {state.status === "error" && <p role="alert">{strings.common.loadError}</p>}
      {state.status === "ready" && <TodayContent data={state.data} time={toTimeOfDay(now)} />}
    </>
  );
}

interface TodayContentProps {
  data: TodayData;
  /** Local time, "HH:MM". */
  time: string;
}

function TodayContent({ data, time }: TodayContentProps) {
  const { student, classes, schedule, assignments, progress } = data;

  return (
    <>
      <p className="lf-page__greeting">{strings.today.greeting(student.firstName)}</p>
      <CurrentClassCard item={findCurrentItem(schedule, time)} classes={classes} time={time} />
      <NextStepCard step={selectNextStep({ schedule, assignments, progress, time })} classes={classes} />
      <ProgressCard summary={summarizeProgress(assignments, progress)} />
    </>
  );
}
