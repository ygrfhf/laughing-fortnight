import { useId, type ReactNode } from "react";

interface TodaySectionProps {
  heading: string;
  children: ReactNode;
}

/** A labelled region, so screen reader users can jump between "Right now", "Your next step", ... */
export function TodaySection({ heading, children }: TodaySectionProps) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId}>{heading}</h2>
      {children}
    </section>
  );
}
