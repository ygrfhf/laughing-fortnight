import { useMemo, useState, type ReactNode } from "react";
import { ClockProvider } from "../clock/ClockProvider";
import type { GradeBand } from "../domain/grade-band";
import { DevToolbar } from "./DevToolbar";
import { GradeBandProvider } from "./GradeBandProvider";
import { ReadAloudSettingProvider } from "./ReadAloudSetting";

const systemNow = (): Date => new Date();

/** Today's date (from `base`) at a pretend "HH:MM" time. */
function atTime(base: Date, time: string): Date {
  return new Date(base.getFullYear(), base.getMonth(), base.getDate(), Number(time.slice(0, 2)), Number(time.slice(3, 5)));
}

interface DevShellProps {
  /** Real clock; tests pass a fixed one. */
  now?: () => Date;
  children: ReactNode;
}

/**
 * Dev builds only (see main.tsx): the developer toolbar plus the providers it controls.
 * Production builds render the same providers without overrides.
 */
export function DevShell({ now = systemNow, children }: DevShellProps) {
  const [bandOverride, setBandOverride] = useState<GradeBand | null>(null);
  const [readAloudIn35, setReadAloudIn35] = useState(false);
  const [timeOverride, setTimeOverride] = useState<string | null>(null);
  const clock = useMemo(() => (timeOverride ? () => atTime(now(), timeOverride) : now), [now, timeOverride]);

  return (
    <>
      <DevToolbar
        band={bandOverride}
        onBandChange={setBandOverride}
        readAloudIn35={readAloudIn35}
        onReadAloudIn35Change={setReadAloudIn35}
        time={timeOverride}
        onTimeChange={setTimeOverride}
      />
      <ClockProvider now={clock}>
        <GradeBandProvider override={bandOverride}>
          <ReadAloudSettingProvider enabledIn35={readAloudIn35}>{children}</ReadAloudSettingProvider>
        </GradeBandProvider>
      </ClockProvider>
    </>
  );
}
