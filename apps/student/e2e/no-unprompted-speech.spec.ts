/**
 * Regression guard for an unexplained "Stop reading" seen during a manual check in step 6:
 * the app must never start speaking unless the student activates a read-aloud button.
 * Everything else a student can do (load, wait, voices arriving late, moving between screens,
 * every other button and link, the break prompt, keyboard navigation) must speak nothing.
 */
import { expect, test } from "@playwright/test";
import { installSpeechStandIn, spokenSoFar } from "./helpers/speech-stand-in";

test("nothing is spoken through a whole session that never touches a read-aloud button", async ({ page }) => {
  await installSpeechStandIn(page, "on-device-voice-later");
  await page.goto("/");
  await expect(page.getByRole("region", { name: "Your next step" })).toBeVisible();

  // Voices finish loading late: buttons appear, but must not speak.
  await page.evaluate(() => window.__addOnDeviceVoiceLater?.());
  await expect(page.getByRole("button", { name: /^Read to me/ })).toHaveCount(3);
  await page.waitForTimeout(1500);

  // Dev toolbar: pretend time 08:31 brings up the break prompt (it has its own read button).
  await page.getByText("Dev tools (not in student builds)").click();
  await page.getByLabel("Pretend time").fill("08:31");
  await expect(page.getByRole("region", { name: "Time for a stretch break!" })).toBeVisible();
  await page.getByRole("checkbox", { name: "Dyslexia-friendly font" }).check();
  await page.getByRole("radio", { name: "3–5" }).check();
  await page.getByRole("radio", { name: "Auto (student's grade)" }).check();

  // Keyboard around the whole page, then use every other control.
  for (let i = 0; i < 25; i++) await page.keyboard.press("Tab");
  await page.getByRole("button", { name: "Got it" }).click();
  await page.getByRole("link", { name: /^Start/ }).click();
  await page.getByRole("button", { name: "I'm done!" }).click();
  await page.getByRole("button", { name: "Oops, I'm not done yet" }).click();
  await page.getByRole("button", { name: "I'm done!" }).press("Enter");
  await page.getByRole("link", { name: "See what's next" }).click();
  await page.goBack();
  await page.goForward();
  await expect(page.getByRole("region", { name: "Your next step" })).toBeVisible();
  await page.waitForTimeout(1500);

  expect(await spokenSoFar(page)).toEqual([]);

  // Control: the read-aloud button itself does speak.
  await page.getByRole("button", { name: "Read to me: Your next step" }).click();
  expect((await spokenSoFar(page)).length).toBeGreaterThan(0);
});
