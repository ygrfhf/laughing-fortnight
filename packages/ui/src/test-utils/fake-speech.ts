/**
 * Test-only stand-in for the browser's speechSynthesis (jsdom has none). Records what would be
 * spoken and with which voice, and lets tests change the available voices or end utterances.
 */

export interface FakeVoice {
  name: string;
  lang: string;
  localService: boolean;
  default: boolean;
  voiceURI: string;
}

export const onDeviceVoice = (lang = "en-US", name = "Device voice"): FakeVoice => ({
  name,
  lang,
  localService: true,
  default: false,
  voiceURI: name,
});

export const cloudVoice = (lang = "en-US", name = "Cloud voice"): FakeVoice => ({
  name,
  lang,
  localService: false,
  default: true,
  voiceURI: name,
});

type Handler = ((event: { error?: string }) => void) | null;

export class FakeUtterance {
  text: string;
  voice: FakeVoice | null = null;
  lang = "";
  rate = 1;
  onend: Handler = null;
  onerror: Handler = null;

  constructor(text: string) {
    this.text = text;
  }
}

export interface FakeSpeech {
  /** Every utterance passed to speak(), in order. */
  readonly spoken: FakeUtterance[];
  readonly cancelCount: () => number;
  setVoices(voices: FakeVoice[]): void;
  /** Ends every queued utterance normally, in order. */
  finishAll(): void;
}

const globals = window as unknown as Record<string, unknown>;

export function installFakeSpeech(initialVoices: FakeVoice[] = []): FakeSpeech {
  let voices = initialVoices;
  let queue: FakeUtterance[] = [];
  let cancels = 0;
  const spoken: FakeUtterance[] = [];
  const listeners = new Set<() => void>();

  const synth = {
    getVoices: () => voices,
    speak: (utterance: FakeUtterance) => {
      spoken.push(utterance);
      queue.push(utterance);
    },
    cancel: () => {
      cancels += 1;
      const interrupted = queue;
      queue = [];
      for (const u of interrupted) u.onerror?.({ error: "canceled" });
    },
    addEventListener: (type: string, listener: () => void) => {
      if (type === "voiceschanged") listeners.add(listener);
    },
    removeEventListener: (type: string, listener: () => void) => {
      if (type === "voiceschanged") listeners.delete(listener);
    },
  };

  Object.defineProperty(window, "speechSynthesis", { configurable: true, value: synth });
  globals.SpeechSynthesisUtterance = FakeUtterance;

  return {
    spoken,
    cancelCount: () => cancels,
    setVoices(next) {
      voices = next;
      for (const listener of listeners) listener();
    },
    finishAll() {
      const finished = queue;
      queue = [];
      for (const u of finished) u.onend?.({});
    },
  };
}

/** Simulates a browser with no speech synthesis at all. */
export function removeSpeech(): void {
  Reflect.deleteProperty(window, "speechSynthesis");
  Reflect.deleteProperty(globals, "SpeechSynthesisUtterance");
}
