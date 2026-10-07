import { useEffect, useState } from "react";
import { useDataSource } from "../../data/DataSourceProvider";
import type { Assignment, ClassInfo } from "../../data/types";

export type AssignmentDataState =
  | { readonly status: "loading" }
  /** Missing, or in a class this student is not in: the data source returns null for both. */
  | { readonly status: "not-found" }
  | {
      readonly status: "ready";
      readonly assignment: Assignment;
      readonly classInfo: ClassInfo | undefined;
      readonly alreadyDone: boolean;
    }
  | { readonly status: "error"; readonly error: unknown };

export function useAssignmentData(assignmentId: string): AssignmentDataState {
  const source = useDataSource();
  const [state, setState] = useState<AssignmentDataState>({ status: "loading" });

  useEffect(() => {
    let active = true;
    setState({ status: "loading" });

    async function load(): Promise<AssignmentDataState> {
      const assignment = await source.getAssignment(assignmentId);
      if (!assignment) {
        return { status: "not-found" };
      }
      const [classes, progress] = await Promise.all([
        source.getClasses(),
        source.getMyProgress(assignment.dueDate),
      ]);
      return {
        status: "ready",
        assignment,
        classInfo: classes.find((c) => c.id === assignment.classId),
        alreadyDone: progress.some((p) => p.assignmentId === assignment.id && p.status === "done"),
      };
    }

    load().then(
      (next) => active && setState(next),
      (error: unknown) => active && setState({ status: "error", error }),
    );
    return () => {
      active = false;
    };
  }, [source, assignmentId]);

  return state;
}
