import { useId, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Icon } from "./Icon";

interface CardProps {
  heading: string;
  /** Decorative icon shown before the heading text. */
  icon?: LucideIcon;
  /** "primary" is for the one thing the student should look at first. */
  emphasis?: "normal" | "primary";
  children: ReactNode;
}

/** A labelled region, so screen reader users can jump between cards by landmark. */
export function Card({ heading, icon, emphasis = "normal", children }: CardProps) {
  const headingId = useId();
  const className = emphasis === "primary" ? "lf-card lf-card--primary" : "lf-card";

  return (
    <section aria-labelledby={headingId} className={className}>
      <h2 id={headingId} className="lf-card__heading">
        {icon && <Icon icon={icon} />}
        <span>{heading}</span>
      </h2>
      <div className="lf-card__body">{children}</div>
    </section>
  );
}
