import { useEffect, useState } from "react";
import { useDataSource } from "./data/DataSourceProvider";
import type { Student } from "./data/types";
import { en as strings } from "./strings/en";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; student: Student }
  | { status: "error"; error: unknown };

export function App() {
  const source = useDataSource();
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let active = true;
    source.getMe().then(
      (student) => active && setState({ status: "ready", student }),
      (error: unknown) => active && setState({ status: "error", error }),
    );
    return () => {
      active = false;
    };
  }, [source]);

  return (
    <main>
      <h1>{strings.today.heading}</h1>
      {state.status === "loading" && <p role="status">{strings.common.loading}</p>}
      {state.status === "ready" && <p>{strings.today.greeting(state.student.firstName)}</p>}
      {/* Fail closed: children see a friendly message, never raw error details. */}
      {state.status === "error" && <p role="alert">{strings.common.loadError}</p>}
    </main>
  );
}
