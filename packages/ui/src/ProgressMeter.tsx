interface ProgressMeterProps {
  done: number;
  total: number;
}

/**
 * One dot per task, filled when finished: concrete and countable for young children.
 * Visual only (aria-hidden): always pair it with a sentence that says the same thing.
 * Filled dots differ from empty ones by fill, not just color.
 */
export function ProgressMeter({ done, total }: ProgressMeterProps) {
  if (total <= 0) {
    return null;
  }
  const filled = Math.min(Math.max(done, 0), total);

  return (
    <div className="lf-meter" aria-hidden="true">
      {Array.from({ length: total }, (_, index) => (
        <span key={index} className={index < filled ? "lf-meter__dot lf-meter__dot--done" : "lf-meter__dot"} />
      ))}
    </div>
  );
}
