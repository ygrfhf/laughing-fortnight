/**
 * Read-aloud in a real browser (decision 3: tap-only, on-device voices only, hide the button
 * when none are available). Each test installs a stand-in speech engine before the app loads,
 * so results do not depend on the voices installed on the test machine.
 */
import { expect, test, type Page } from "@playwright/test";

type SpeechSetup = "no-speech-engine" | "cloud-voices-only" | "on-device-voice";

interface SpokenRecord {
  text: string;
  voice: string | null;
}

declare global {
  interface Window {
    __spoken?: SpokenRecord[];
  }
}

async function openTodayWith(page: Page, setup: SpeechSetup): Promise<void> {
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
    const voices = mode === "on-device-voice" ? [cloud, device] : [cloud];
    window.__spoken = [];

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
      addEventListener: () => {},
      removeEventListener: () => {},
    });
  }, setup);

  await page.goto("/");
  await expect(page.getByRole("region", { name: "Your next step" })).toBeVisible();
}

const readAloudButtons = (page: Page) => page.getByRole("button", { name: /^Read to me/ });

test("no read-aloud button when the browser has no speech engine", async ({ page }) => {
  await openTodayWith(page, "no-speech-engine");

  await expect(readAloudButtons(page)).toHaveCount(0);
});

test("no read-aloud button when only cloud voices exist", async ({ page }) => {
  await openTodayWith(page, "cloud-voices-only");

  await expect(readAloudButtons(page)).toHaveCount(0);
  expect(await page.evaluate(() => window.__spoken)).toEqual([]);
});

test("with an on-device voice, the buttons appear and nothing is read until a tap", async ({ page }) => {
  await openTodayWith(page, "on-device-voice");

  await expect(readAloudButtons(page)).toHaveCount(3);
  expect(await page.evaluate(() => window.__spoken)).toEqual([]);
});

test("a tap reads with the on-device voice, never the cloud default", async ({ page }) => {
  await openTodayWith(page, "on-device-voice");

  await page.getByRole("button", { name: "Read to me: Your next step" }).click();

  const spoken = (await page.evaluate(() => window.__spoken)) ?? [];
  expect(spoken.length).toBeGreaterThan(0);
  expect(spoken[0]?.text).toBe("Your next step.");
  expect(spoken.every((s) => s.voice === "Device English")).toBe(true);
});
