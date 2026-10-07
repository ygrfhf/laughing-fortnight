import { afterEach, describe, expect, test } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expectNoAxeViolations } from "@laughing-fortnight/ui/test-utils/axe";
import { installFakeSpeech, onDeviceVoice, removeSpeech } from "@laughing-fortnight/ui/test-utils/fake-speech";
import { App } from "../App";
import { en } from "../strings/en";
import { renderWithProviders } from "../test-utils/render-with-providers";

afterEach(() => {
  window.location.hash = "";
  removeSpeech();
});

const greeting = () => screen.findByText(en.today.greeting("Testy"));
const prompt = () => screen.queryByRole("region", { name: en.breaks.heading });

// Grade 1 day: Reading starts 08:15. K–2 interval is 15 minutes; 3–5 is 25.
describe("Break prompt timing", () => {
  test("does not appear before the K–2 interval of class time has passed", async () => {
    renderWithProviders(<App />, { time: "08:29" });
    await greeting();

    expect(prompt()).not.toBeInTheDocument();
  });

  test("appears after 15 minutes of class time in K–2", async () => {
    renderWithProviders(<App />, { time: "08:31" });

    expect(await screen.findByRole("region", { name: en.breaks.heading })).toBeInTheDocument();
    expect(screen.getByText(en.breaks.body)).toBeInTheDocument();
  });

  test("waits for 25 minutes in 3–5", async () => {
    const early = renderWithProviders(<App />, { time: "08:31", band: "3-5" });
    await greeting();
    expect(prompt()).not.toBeInTheDocument();
    early.unmount();

    renderWithProviders(<App />, { time: "08:41", band: "3-5" });
    expect(await screen.findByRole("region", { name: en.breaks.heading })).toBeInTheDocument();
  });

  test("never appears during recess", async () => {
    renderWithProviders(<App />, { time: "10:20" });
    await greeting();

    expect(prompt()).not.toBeInTheDocument();
  });
});

describe("Break prompt is gentle and non-modal", () => {
  test("does not take focus, is not a dialog, and leaves the page usable", async () => {
    renderWithProviders(<App />, { time: "08:31" });
    await screen.findByRole("region", { name: en.breaks.heading });

    expect(document.activeElement).toBe(document.body);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.querySelector("[aria-modal]")).toBeNull();
    expect(screen.getByRole("link", { name: /^Start/ })).toBeVisible();
  });

  test("is announced politely by screen readers", async () => {
    renderWithProviders(<App />, { time: "08:31" });
    const region = await screen.findByRole("region", { name: en.breaks.heading });

    expect(region.closest("[aria-live]")).toHaveAttribute("aria-live", "polite");
  });

  test("can always be dismissed, and stays dismissed when moving between screens", async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />, { time: "08:31" });
    const region = await screen.findByRole("region", { name: en.breaks.heading });

    await user.click(within(region).getByRole("button", { name: en.breaks.dismiss }));
    expect(prompt()).not.toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: /^Start/ }));
    await screen.findByRole("button", { name: en.assignment.markDone });
    expect(prompt()).not.toBeInTheDocument();
  });

  test("also appears on the assignment screen", async () => {
    window.location.hash = "#/assignment/asg-g1-reading-mitten";
    renderWithProviders(<App />, { time: "08:31" });

    expect(await screen.findByRole("region", { name: en.breaks.heading })).toBeInTheDocument();
  });

  test("in K–2 it can be read aloud", async () => {
    const user = userEvent.setup();
    const speech = installFakeSpeech([onDeviceVoice()]);
    renderWithProviders(<App />, { time: "08:31" });
    const region = await screen.findByRole("region", { name: en.breaks.heading });

    await user.click(within(region).getByRole("button", { name: en.readAloud.labelFor(en.breaks.heading) }));

    expect(speech.spoken.map((u) => u.text).join(" ")).toBe(`${en.breaks.heading} ${en.breaks.body}`);
  });

  test("has no axe violations while showing", async () => {
    const { container } = renderWithProviders(<App />, { time: "08:31" });
    await screen.findByRole("region", { name: en.breaks.heading });

    await expectNoAxeViolations(container, { includeBestPractices: true });
  });
});
