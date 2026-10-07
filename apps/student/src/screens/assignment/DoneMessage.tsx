import { useId, useLayoutEffect, useRef } from "react";
import { Button, ButtonLink, Icon } from "@laughing-fortnight/ui";
import { CircleCheckBig } from "lucide-react";
import { routeToHash } from "../../router";
import { en as strings } from "../../strings/en";

interface DoneMessageProps {
  /** True right after the student marks the work done, so screen readers announce it. */
  moveFocus: boolean;
  /** "Oops, I'm not done yet". */
  onUndo: () => void;
  /** A save is in progress: the undo button is disabled and says "Saving…". */
  saving: boolean;
}

export function DoneMessage({ moveFocus, onUndo, saving }: DoneMessageProps) {
  const headingId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Mount only (empty deps on purpose): focus moves once, before paint, when it appears.
  useLayoutEffect(() => {
    if (moveFocus) headingRef.current?.focus();
  }, []);

  return (
    <section aria-labelledby={headingId} className="lf-card">
      <h2 id={headingId} ref={headingRef} tabIndex={-1} className="lf-row lf-done__heading">
        <Icon icon={CircleCheckBig} size="1.5em" />
        {strings.assignment.doneHeading}
      </h2>
      <div className="lf-actions">
        <ButtonLink href={routeToHash({ name: "today" })}>{strings.nav.seeWhatsNext}</ButtonLink>
        <Button onClick={onUndo} variant="secondary" disabled={saving}>
          {saving ? strings.assignment.saving : strings.assignment.notDoneYet}
        </Button>
      </div>
    </section>
  );
}
