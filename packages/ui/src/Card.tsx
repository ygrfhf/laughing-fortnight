import { useId, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Icon } from "./Icon";

interface CardProps {
  heading: string;
  /** Decorative icon shown before the heading text. */
  icon?: LucideIcon;
  /** "primary" is for the one thing the student should look at first. */
  emphasis?: "normal" | "primary";
  /** Optional control shown beside the heading (e.g. a read-aloud button). */
  action?: ReactNode;
  /** Extra class for screen-specific styling (e.g. the break prompt). */
  className?: string;
  children: ReactNode;
}

/** A labelled region, so screen reader users can jump between cards by landmark. */
export function Card({ heading, icon, emphasis = "normal", action, className: extraClass, children }: CardProps) {
  const headingId = useId();
  const className = ["lf-card", emphasis === "primary" && "lf-card--primary", extraClass].filter(Boolean).join(" ");

  return (
    <section aria-labelledby={headingId} className={className}>
      <div className="lf-card__header">
        <h2 id={headingId} className="lf-card__heading">
          {icon && <Icon icon={icon} />}
          <span>{heading}</span>
        </h2>
        {action}
      </div>
      <div className="lf-card__body">{children}</div>
    </section>
  );
}
