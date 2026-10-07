import type { ReactNode, Ref } from "react";

type Variant = "primary" | "secondary";

const classFor = (variant: Variant): string => `lf-button lf-button--${variant}`;

interface ButtonProps {
  onClick: () => void;
  variant?: Variant;
  disabled?: boolean;
  /** Lets a screen move focus to this button (e.g. back to "I'm done!" after an undo). */
  ref?: Ref<HTMLButtonElement>;
  /** Fuller accessible name; must begin with the visible text (WCAG 2.5.3 Label in Name). */
  accessibleName?: string;
  children: ReactNode;
}

/** For actions (it does something). Always type="button" so it never submits a form by accident. */
export function Button({ onClick, variant = "primary", disabled = false, ref, accessibleName, children }: ButtonProps) {
  return (
    <button
      ref={ref}
      type="button"
      className={classFor(variant)}
      onClick={onClick}
      disabled={disabled}
      aria-label={accessibleName}
    >
      {children}
    </button>
  );
}

interface ButtonLinkProps {
  href: string;
  variant?: Variant;
  /**
   * Fuller accessible name when the visible text needs context ("Start" -> "Start Count to 20").
   * Must begin with the visible text (WCAG 2.5.3 Label in Name).
   */
  accessibleName?: string;
  children: ReactNode;
}

/** For navigation (it goes somewhere): a real link, styled like a button. */
export function ButtonLink({ href, variant = "primary", accessibleName, children }: ButtonLinkProps) {
  return (
    <a href={href} className={classFor(variant)} aria-label={accessibleName}>
      {children}
    </a>
  );
}
