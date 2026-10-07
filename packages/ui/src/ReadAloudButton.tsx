import { Square, Volume2 } from "lucide-react";
import { Button } from "./Button";
import { Icon } from "./Icon";
import { useSpeech } from "./use-speech";

interface ReadAloudButtonProps {
  /** What to read, in full sentences (see joinForSpeech). */
  text: string;
  /** Visible label, e.g. "Read to me". */
  label: string;
  /** Visible label while reading, e.g. "Stop reading". */
  stopLabel: string;
  /** Fuller name for screen readers; must begin with `label`. */
  accessibleName?: string;
  lang?: string;
}

/**
 * Tap to hear `text` read aloud with an on-device voice. Renders nothing when no on-device
 * voice is available, so text is never sent to a cloud speech service. Never uses the mic.
 */
export function ReadAloudButton({ text, label, stopLabel, accessibleName, lang }: ReadAloudButtonProps) {
  const speech = useSpeech(lang);
  if (!speech.available) {
    return null;
  }

  // Same element in both states, so keyboard focus stays put when it toggles.
  return speech.speaking ? (
    <Button variant="secondary" onClick={speech.stop}>
      <Icon icon={Square} />
      {stopLabel}
    </Button>
  ) : (
    <Button variant="secondary" onClick={() => speech.speak(text)} accessibleName={accessibleName}>
      <Icon icon={Volume2} />
      {label}
    </Button>
  );
}
