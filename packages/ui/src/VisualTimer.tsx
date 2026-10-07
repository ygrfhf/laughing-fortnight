const CENTER = 50;
const RADIUS = 48;

const round = (n: number): number => Math.round(n * 100) / 100;

/** SVG path for the wedge of time left, drawn clockwise from 12 o'clock. 0 < fraction < 1. */
export function timerWedgePath(fraction: number): string {
  const angle = fraction * 2 * Math.PI;
  const x = round(CENTER + RADIUS * Math.sin(angle));
  const y = round(CENTER - RADIUS * Math.cos(angle));
  const largeArc = fraction > 0.5 ? 1 : 0;
  return `M ${CENTER} ${CENTER} L ${CENTER} ${CENTER - RADIUS} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${x} ${y} Z`;
}

interface VisualTimerProps {
  /** 1 = the whole block is left, 0 = time is up. */
  fractionLeft: number;
  size?: string;
}

/**
 * A "time timer" disc: the filled wedge shrinks as the block goes on. Visual only
 * (aria-hidden); always pair it with text such as "45 minutes left". No animation.
 */
export function VisualTimer({ fractionLeft, size = "2.5em" }: VisualTimerProps) {
  const fraction = Math.min(Math.max(fractionLeft, 0), 1);

  return (
    <svg
      className="lf-timer"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      data-fraction-left={String(fraction)}
    >
      <circle className="lf-timer__face" cx={CENTER} cy={CENTER} r={RADIUS} />
      {fraction >= 1 && <circle className="lf-timer__left" cx={CENTER} cy={CENTER} r={RADIUS} />}
      {fraction > 0 && fraction < 1 && <path className="lf-timer__left" d={timerWedgePath(fraction)} />}
    </svg>
  );
}
