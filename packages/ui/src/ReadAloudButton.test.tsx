import { afterEach, describe, expect, test } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReadAloudButton } from "./ReadAloudButton";
import { expectNoAxeViolations } from "./test-utils/axe";
import { cloudVoice, installFakeSpeech, onDeviceVoice, removeSpeech } from "./test-utils/fake-speech";

const LABELS = { label: "Read to me", stopLabel: "Stop reading" };

function renderButton(text = "Your next step. Count to 20.") {
  return render(<ReadAloudButton text={text} {...LABELS} accessibleName="Read to me: Your next step" />);
}

afterEach(() => {
  removeSpeech();
});

describe("ReadAloudButton availability", () => {
  test("is not shown when the browser has no speech synthesis", () => {
    removeSpeech();

    renderButton();

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  test("is not shown when only cloud voices exist (text must never leave the device)", () => {
    installFakeSpeech([cloudVoice()]);

    renderButton();

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  test("appears once an on-device voice finishes loading", () => {
    const speech = installFakeSpeech([]);
    renderButton();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();

    act(() => speech.setVoices([cloudVoice(), onDeviceVoice()]));

    expect(screen.getByRole("button", { name: "Read to me: Your next step" })).toBeInTheDocument();
  });

  test("disappears again if the on-device voice goes away", () => {
    const speech = installFakeSpeech([onDeviceVoice()]);
    renderButton();

    act(() => speech.setVoices([cloudVoice()]));

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("ReadAloudButton speaking", () => {
  test("never speaks by itself: only after a tap", () => {
    const speech = installFakeSpeech([onDeviceVoice()]);

    renderButton();

    expect(speech.spoken).toHaveLength(0);
  });

  test("a tap reads the text sentence by sentence with the on-device voice, never the default", async () => {
    const user = userEvent.setup();
    const device = onDeviceVoice("en-US", "Device English");
    const speech = installFakeSpeech([cloudVoice(), device]);
    renderButton("Your next step. Count to 20.");

    await user.click(screen.getByRole("button"));

    expect(speech.spoken.map((u) => u.text)).toEqual(["Your next step.", "Count to 20."]);
    expect(speech.spoken.every((u) => u.voice === device && u.lang === "en-US")).toBe(true);
  });

  test("while reading, the same button becomes Stop; tapping it stops the speech", async () => {
    const user = userEvent.setup();
    const speech = installFakeSpeech([onDeviceVoice()]);
    renderButton();

    await user.click(screen.getByRole("button"));
    const stop = screen.getByRole("button", { name: LABELS.stopLabel });
    await user.click(stop);

    expect(speech.cancelCount()).toBeGreaterThanOrEqual(2); // once before speaking, once to stop
    expect(screen.getByRole("button", { name: "Read to me: Your next step" })).toBeInTheDocument();
  });

  test("goes back to 'Read to me' when the reading finishes", async () => {
    const user = userEvent.setup();
    const speech = installFakeSpeech([onDeviceVoice()]);
    renderButton();

    await user.click(screen.getByRole("button"));
    act(() => speech.finishAll());

    expect(screen.getByRole("button", { name: "Read to me: Your next step" })).toBeInTheDocument();
  });

  test("stops reading when the student leaves the screen", async () => {
    const user = userEvent.setup();
    const speech = installFakeSpeech([onDeviceVoice()]);
    const view = renderButton();
    await user.click(screen.getByRole("button"));
    const cancelsWhileReading = speech.cancelCount();

    view.unmount();

    expect(speech.cancelCount()).toBe(cancelsWhileReading + 1);
  });

  test("leaving a screen it was not reading on does not cut off other speech", () => {
    const speech = installFakeSpeech([onDeviceVoice()]);
    const view = renderButton();

    view.unmount();

    expect(speech.cancelCount()).toBe(0);
  });
});

describe("ReadAloudButton accessibility", () => {
  test("is an icon-only button with the full accessible name, sized by the touch-target token", async () => {
    installFakeSpeech([onDeviceVoice()]);
    const { container } = renderButton();

    const button = screen.getByRole("button", { name: "Read to me: Your next step" });
    expect(button).toHaveTextContent(/^$/);
    expect(button).toHaveClass("lf-button", "lf-button--icon");
    expect(button.querySelector("svg.lucide-volume-2")).not.toBeNull();
    await expectNoAxeViolations(container);
  });

  test("while reading, the name becomes 'Stop reading' and the icon visibly changes", async () => {
    const user = userEvent.setup();
    installFakeSpeech([onDeviceVoice()]);
    const { container } = renderButton();

    await user.click(screen.getByRole("button"));

    const stop = screen.getByRole("button", { name: LABELS.stopLabel });
    expect(stop.querySelector("svg.lucide-volume-2")).toBeNull();
    expect(stop.querySelector("svg.lucide-square")).not.toBeNull();
    await expectNoAxeViolations(container);
  });

  test("uses the plain label as the name when no fuller name is given", () => {
    installFakeSpeech([onDeviceVoice()]);
    render(<ReadAloudButton text="Hi." {...LABELS} />);

    expect(screen.getByRole("button", { name: LABELS.label })).toBeInTheDocument();
  });

  test("keeps keyboard focus on the same button when it toggles to Stop", async () => {
    const user = userEvent.setup();
    installFakeSpeech([onDeviceVoice()]);
    renderButton();
    const button = screen.getByRole("button");
    button.focus();

    await user.keyboard("{Enter}");

    expect(screen.getByRole("button", { name: LABELS.stopLabel })).toHaveFocus();
  });
});
