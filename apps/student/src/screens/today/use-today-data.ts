import { useEffect, useState } from "react";
import { useDataSource } from "../../data/DataSourceProvider";
import type { Assignment, AssignmentProgress, ClassInfo, ScheduleItem, Student } from "../../data/types";

export interface TodayData {
  readonly student: Student;
  readonly classes: readonly ClassInfo[];
  readonly schedule: readonly ScheduleItem[];
  readonly assignments: readonly Assignment[];
  readonly progress: readonly AssignmentProgress[];
}

export type TodayDataState =
  | { readonly status: "loading" }
  | { readonly status: "ready"; readonly data: TodayData }
  | { readonly status: "error"; readonly error: unknown };

/** Loads everything the Today screen needs for `date` ("YYYY-MM-DD"). Any failure is an error. */
export function useTodayData(date: string): TodayDataState {
  const source = useDataSource();
  const [state, setState] = useState<TodayDataState>({ status: "loading" });

  useEffect(() => {
    let active = true;
    setState({ status: "loading" });
    Promise.all([
      source.getMe(),
      source.getClasses(),
      source.getSchedule(date),
      source.getAssignmentsDueOn(date),
      source.getMyProgress(date),
    ]).then(
      ([student, classes, schedule, assignments, progress]) => {
        if (active) setState({ status: "ready", data: { student, classes, schedule, assignments, progress } });
      },
      (error: unknown) => {
        if (active) setState({ status: "error", error });
      },
    );
    return () => {
      active = false;
    };
  }, [source, date]);

  return state;
}
