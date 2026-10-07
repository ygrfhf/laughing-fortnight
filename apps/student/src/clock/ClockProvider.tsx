import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

/** How often screens re-read the clock. Schedule times are whole minutes. */
const DEFAULT_TICK_MS = 30_000;

const systemNow = (): Date => new Date();

const ClockContext = createContext<() => Date>(systemNow);

interface ClockProviderProps {
  /** Source of the current time. Tests pass a fixed time; the dev toolbar can override it. */
  now?: () => Date;
  children: ReactNode;
}

export function ClockProvider({ now = systemNow, children }: ClockProviderProps) {
  return <ClockContext.Provider value={now}>{children}</ClockContext.Provider>;
}

/** The current time, refreshed every `tickMs` so the Today screen follows the schedule. */
export function useNow(tickMs: number = DEFAULT_TICK_MS): Date {
  const now = useContext(ClockContext);
  const [current, setCurrent] = useState(() => now());

  useEffect(() => {
    setCurrent(now());
    const id = setInterval(() => setCurrent(now()), tickMs);
    return () => clearInterval(id);
  }, [now, tickMs]);

  return current;
}
