import { createContext, useContext, type ReactNode } from "react";
import type { StudentDataSource } from "./student-data-source";

const DataSourceContext = createContext<StudentDataSource | null>(null);

interface DataSourceProviderProps {
  source: StudentDataSource;
  children: ReactNode;
}

/** Supplies the StudentDataSource to every screen. Swap mock for real backend here only. */
export function DataSourceProvider({ source, children }: DataSourceProviderProps) {
  return <DataSourceContext.Provider value={source}>{children}</DataSourceContext.Provider>;
}

export function useDataSource(): StudentDataSource {
  const source = useContext(DataSourceContext);
  if (!source) {
    throw new Error("useDataSource must be used inside a DataSourceProvider");
  }
  return source;
}
