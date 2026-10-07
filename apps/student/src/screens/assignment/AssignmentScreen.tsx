import { useLayoutEffect, useRef, useState } from "react";
import { Button, ButtonLink, Icon } from "@laughing-fortnight/ui";
import { ArrowLeft, Clock } from "lucide-react";
import { useDataSource } from "../../data/DataSourceProvider";
import type { Assignment, ClassInfo } from "../../data/types";
import { routeToHash } from "../../router";
import { en as strings } from "../../strings/en";
import { SUBJECT_ICONS } from "../icons";
import { PageHeading } from "../PageHeading";
import { DoneMessage } from "./DoneMessage";
import { InstructionSteps } from "./InstructionSteps";
import { useAssignmentData } from "./use-assignment-data";

interface AssignmentScreenProps {
  assignmentId: string;
}

/** One assignment: what to do, step by step, and a way to say "I'm done!". */
export function AssignmentScreen({ assignmentId }: AssignmentScreenProps) {
  const state = useAssignmentData(assignmentId);

  return (
    <>
      <div className="lf-actions">
        <ButtonLink href={routeToHash({ name: "today" })} variant="secondary">
          <Icon icon={ArrowLeft} />
          {strings.nav.backToToday}
        </ButtonLink>
      </div>
      {state.status === "loading" && <p role="status">{strings.common.loading}</p>}
      {/* Fail closed: a friendly message, never raw error details. */}
      {state.status === "error" && (
        <div role="alert">
          <PageHeading text={strings.common.loadError} />
        </div>
      )}
      {state.status === "not-found" && <PageHeading text={strings.assignment.notFound} />}
      {state.status === "ready" && (
        <AssignmentDetails assignment={state.assignment} classInfo={state.classInfo} alreadyDone={state.alreadyDone} />
      )}
    </>
  );
}

/** Where focus goes after a save: the confirmation (after done) or "I'm done!" (after undo). */
type FocusAfterSave = "confirmation" | "mark-done" | null;

interface AssignmentDetailsProps {
  assignment: Assignment;
  classInfo: ClassInfo | undefined;
  alreadyDone: boolean;
}

function AssignmentDetails({ assignment, classInfo, alreadyDone }: AssignmentDetailsProps) {
  const source = useDataSource();
  const [done, setDone] = useState(alreadyDone);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const [focusAfterSave, setFocusAfterSave] = useState<FocusAfterSave>(null);
  // Blocks a second press before React re-renders the disabled button.
  const savingRef = useRef(false);
  const markDoneRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    if (focusAfterSave === "mark-done") markDoneRef.current?.focus();
  }, [focusAfterSave, done]);

  async function save(nextDone: boolean): Promise<void> {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setFailed(false);
    try {
      await (nextDone ? source.markDone(assignment.id) : source.markNotDone(assignment.id));
      setDone(nextDone);
      setFocusAfterSave(nextDone ? "confirmation" : "mark-done");
    } catch {
      // Shown to the student as a friendly message; they can try again or ask their teacher.
      setFailed(true);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeading text={assignment.title} />
      {classInfo && (
        <p className="lf-row lf-text-muted">
          <Icon icon={SUBJECT_ICONS[classInfo.subject]} />
          {classInfo.name}
        </p>
      )}
      <p className="lf-row lf-text-muted">
        <Icon icon={Clock} />
        {strings.assignment.aboutMinutes(assignment.estimatedMinutes)}
      </p>
      <InstructionSteps steps={assignment.steps} />
      {done ? (
        <DoneMessage moveFocus={focusAfterSave === "confirmation"} onUndo={() => save(false)} saving={saving} />
      ) : (
        <div className="lf-actions">
          <Button onClick={() => save(true)} disabled={saving} ref={markDoneRef}>
            {saving ? strings.assignment.saving : strings.assignment.markDone}
          </Button>
        </div>
      )}
      {failed && <p role="alert">{strings.assignment.saveError}</p>}
    </>
  );
}
