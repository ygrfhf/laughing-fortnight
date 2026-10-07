import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useDataSource } from "../data/DataSourceProvider";
import { DEFAULT_GRADE_BAND, gradeBandFor, type GradeBand } from "../domain/grade-band";

const GradeBandContext = createContext<GradeBand>(DEFAULT_GRADE_BAND);

interface GradeBandProviderProps {
  /** Dev toolbar override; null means "follow the student's grade". */
  override: GradeBand | null;
  children: ReactNode;
}

/** Picks the K–2 or 3–5 experience from the signed-in student's grade. */
export function GradeBandProvider({ override, children }: GradeBandProviderProps) {
  const source = useDataSource();
  const [studentBand, setStudentBand] = useState<GradeBand | null>(null);

  useEffect(() => {
    let active = true;
    source.getMe().then(
      (student) => active && setStudentBand(gradeBandFor(student.gradeLevel)),
      // Screens show their own friendly load error; here we just keep the default band.
      () => active && setStudentBand(null),
    );
    return () => {
      active = false;
    };
  }, [source]);

  const band = override ?? studentBand ?? DEFAULT_GRADE_BAND;
  return <GradeBandContext.Provider value={band}>{children}</GradeBandContext.Provider>;
}

export function useGradeBand(): GradeBand {
  return useContext(GradeBandContext);
}
