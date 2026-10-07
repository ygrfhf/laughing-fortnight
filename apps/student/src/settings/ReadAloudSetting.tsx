import { createContext, useContext, type ReactNode } from "react";
import { useGradeBand } from "./GradeBandProvider";

/**
 * Read-aloud in 3–5. Off by default. Planned to become a teacher-set, per-student
 * accommodation (IEP/504 support; CLAUDE.md Section 11). For now only the dev toolbar sets it.
 */
const ReadAloudIn35Context = createContext(false);

interface ReadAloudSettingProviderProps {
  enabledIn35: boolean;
  children: ReactNode;
}

export function ReadAloudSettingProvider({ enabledIn35, children }: ReadAloudSettingProviderProps) {
  return <ReadAloudIn35Context.Provider value={enabledIn35}>{children}</ReadAloudIn35Context.Provider>;
}

/** Always on in K–2 (CLAUDE.md Section 5); in 3–5 only when the setting is on. */
export function useReadAloudEnabled(): boolean {
  const band = useGradeBand();
  const enabledIn35 = useContext(ReadAloudIn35Context);
  return band === "K-2" || enabledIn35;
}
