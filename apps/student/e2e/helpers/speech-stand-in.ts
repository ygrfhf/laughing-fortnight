/**
 * Installs a stand-in speech engine before the app loads, so end-to-end results do not depend
 * on the voices installed on the test machine. Every speak() call is recorded on
 * window.__spoken; window.__addOnDeviceVoiceLater() simulates voices that finish loading late.
 */
import type { Page } from "@playwright/test";

export type SpeechSetup = "no-speech-engine" | "cloud-voices-only" | "on-device-voice" | "on-device-voice-later";

export interface SpokenRecord {
  text: string;
  voice: string | null;
}

declare global {
  interface Window {
    __spoken?: SpokenRecord[];
    __addOnDeviceVoiceLater?: () => void;
  }
}

export async function installSpeechStandIn(page: Page, setup: SpeechSetup): Promise<void> {
  await page.addInitScript((mode: SpeechSetup) => {
    const define = (name: string, value: unknown) =>
      Object.defineProperty(window, name, { configurable: true, writable: true, value });

    if (mode === "no-speech-engine") {
      define("speechSynthesis", undefined);
      define("SpeechSynthesisUtterance", undefined);
      return;
    }

    const cloud = { name: "Cloud English", lang: "en-US", localService: false, default: true, voiceURI: "cloud" };
    const device = { name: "Device English", lang: "en-US", localService: true, default: false, voiceURI: "device" };
    let voices = mode === "on-device-voice" ? [cloud, device] : [cloud];
    const listeners = new Set<() => void>();
    window.__spoken = [];
    window.__addOnDeviceVoiceLater = () => {
      voices = [cloud, device];
      listeners.forEach((listener) => listener());
    };

    class StandInUtterance {
      text: string;
      voice: { name: string } | null = null;
      lang = "";
      rate = 1;
      onend: (() => void) | null = null;
      onerror: (() => void) | null = null;
      constructor(text: string) {
        this.text = text;
      }
    }

    define("SpeechSynthesisUtterance", StandInUtterance);
    define("speechSynthesis", {
      getVoices: () => voices,
      speak: (u: StandInUtterance) => window.__spoken?.push({ text: u.text, voice: u.voice?.name ?? null }),
      cancel: () => {},
      addEventListener: (type: string, listener: () => void) => {
        if (type === "voiceschanged") listeners.add(listener);
      },
      removeEventListener: (type: string, listener: () => void) => {
        if (type === "voiceschanged") listeners.delete(listener);
      },
    });
  }, setup);
}

export const spokenSoFar = (page: Page): Promise<SpokenRecord[]> =>
  page.evaluate(() => window.__spoken ?? []);
