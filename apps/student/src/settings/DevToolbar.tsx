import { Button } from "@laughing-fortnight/ui";
import type { GradeBand } from "../domain/grade-band";
import { devStrings } from "../strings/dev-en";

interface DevToolbarProps {
  band: GradeBand | null;
  onBandChange: (band: GradeBand | null) => void;
  readAloudIn35: boolean;
  onReadAloudIn35Change: (enabled: boolean) => void;
  /** "HH:MM", or null for the real time. */
  time: string | null;
  onTimeChange: (time: string | null) => void;
}

/** Developer-only controls. Rendered by DevShell, which only exists in dev builds. */
export function DevToolbar({
  band,
  onBandChange,
  readAloudIn35,
  onReadAloudIn35Change,
  time,
  onTimeChange,
}: DevToolbarProps) {
  // Built inside the component (not at module level) so production builds can drop this module.
  const bandOptions: ReadonlyArray<{ value: GradeBand | null; label: string }> = [
    { value: null, label: devStrings.auto },
    { value: "K-2", label: devStrings.bandK2 },
    { value: "3-5", label: devStrings.bandG35 },
  ];

  return (
    <aside aria-label={devStrings.toolsLabel} className="lf-dev">
      <details>
        <summary>{devStrings.summary}</summary>
        <fieldset>
          <legend>{devStrings.gradeMode}</legend>
          {bandOptions.map((option) => (
            <label key={option.label}>
              <input
                type="radio"
                name="dev-grade-band"
                checked={band === option.value}
                onChange={() => onBandChange(option.value)}
              />
              {option.label}
            </label>
          ))}
        </fieldset>
        <label>
          <input
            type="checkbox"
            checked={readAloudIn35}
            onChange={(event) => onReadAloudIn35Change(event.target.checked)}
          />
          {devStrings.readAloudIn35}
        </label>
        <div className="lf-actions">
          <label>
            {devStrings.time}
            <input type="time" value={time ?? ""} onChange={(event) => onTimeChange(event.target.value || null)} />
          </label>
          <Button variant="secondary" onClick={() => onTimeChange(null)}>
            {devStrings.useRealTime}
          </Button>
        </div>
      </details>
    </aside>
  );
}
