/**
 * Read-aloud in a real browser (decision 3: tap-only, on-device voices only, hide the button
 * when none are available).
 */
import { expect, test, type Page } from "@playwright/test";
import { installSpeechStandIn, spokenSoFar, type SpeechSetup } from "./helpers/speech-stand-in";

async function openTodayWith(page: Page, setup: SpeechSetup): Promise<void> {
  await installSpeechStandIn(page, setup);
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
  expect(await spokenSoFar(page)).toEqual([]);
});

test("with an on-device voice, the buttons appear and nothing is read until a tap", async ({ page }) => {
  await openTodayWith(page, "on-device-voice");

  await expect(readAloudButtons(page)).toHaveCount(3);
  expect(await spokenSoFar(page)).toEqual([]);
});

test("a tap reads with the on-device voice, never the cloud default", async ({ page }) => {
  await openTodayWith(page, "on-device-voice");

  await page.getByRole("button", { name: "Read to me: Your next step" }).click();

  const spoken = await spokenSoFar(page);
  expect(spoken.length).toBeGreaterThan(0);
  expect(spoken[0]?.text).toBe("Your next step.");
  expect(spoken.every((s) => s.voice === "Device English")).toBe(true);
});
