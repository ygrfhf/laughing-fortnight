import { Square, Volume2 } from "lucide-react";
import { Button } from "./Button";
import { Icon } from "./Icon";
import { useSpeech } from "./use-speech";

interface ReadAloudButtonProps {
  /** What to read, in full sentences (see joinForSpeech). */
  text: string;
  /** Accessible name when no fuller name is given, e.g. "Read to me". */
  label: string;
  /** Accessible name while reading, e.g. "Stop reading". */
  stopLabel: string;
  /** Fuller accessible name, e.g. "Read to me: Your next step". */
  accessibleName?: string;
  lang?: string;
}

/**
 * Icon-only, tap-to-hear button using an on-device voice: a speaker icon to start, a stop
 * square while reading. Renders nothing when no on-device voice is available, so text is never
 * sent to a cloud speech service. Never uses the microphone.
 */
export function ReadAloudButton({ text, label, stopLabel, accessibleName, lang }: ReadAloudButtonProps) {
  const speech = useSpeech(lang);
  if (!speech.available) {
    return null;
  }

  // Same element in both states, so keyboard focus stays put when it toggles.
  return speech.speaking ? (
    <Button variant="secondary" shape="icon" onClick={speech.stop} accessibleName={stopLabel}>
      <Icon icon={Square} size="1.5em" />
    </Button>
  ) : (
    <Button variant="secondary" shape="icon" onClick={() => speech.speak(text)} accessibleName={accessibleName ?? label}>
      <Icon icon={Volume2} size="1.5em" />
    </Button>
  );
}
