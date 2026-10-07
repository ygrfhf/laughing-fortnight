import { joinForSpeech, ReadAloudButton } from "@laughing-fortnight/ui";
import { useReadAloudEnabled } from "../settings/ReadAloudSetting";
import { en as strings } from "../strings/en";

interface ReadAloudProps {
  /** Short name of what is read, for the button's accessible name ("Read to me: Your next step"). */
  what: string;
  /** Pieces read in order, joined into sentences. */
  parts: readonly string[];
}

/**
 * Read-aloud for one card: always in K–2 (CLAUDE.md Section 5), in 3–5 only when the
 * read-aloud setting is on. Tap-only; on-device voices only.
 */
export function ReadAloud({ what, parts }: ReadAloudProps) {
  if (!useReadAloudEnabled()) {
    return null;
  }
  return (
    <ReadAloudButton
      text={joinForSpeech(parts)}
      label={strings.readAloud.label}
      stopLabel={strings.readAloud.stop}
      accessibleName={strings.readAloud.labelFor(what)}
    />
  );
}
