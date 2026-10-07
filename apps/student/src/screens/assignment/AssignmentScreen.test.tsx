import { afterEach, describe, expect, test, vi } from "vitest";
import { installFakeSpeech, onDeviceVoice, removeSpeech } from "@laughing-fortnight/ui/test-utils/fake-speech";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expectNoAxeViolations } from "@laughing-fortnight/ui/test-utils/axe";
import { AssignmentScreen } from "./AssignmentScreen";
import { en } from "../../strings/en";
import type { AssignmentProgress } from "../../data/types";
import type { GradeBand } from "../../domain/grade-band";
import { mockSource, renderWithProviders, TEST_TODAY } from "../../test-utils/render-with-providers";
import { MOCK_STUDENT_IDS } from "../../mock-data/mock-data-source";

const COUNT_ID = "asg-g1-math-count";

function renderAssignment(assignmentId = COUNT_ID, source = mockSource(), band?: GradeBand) {
  const user = userEvent.setup();
  const view = renderWithProviders(
    <main>
      <AssignmentScreen assignmentId={assignmentId} />
    </main>,
    { source, band },
  );
  return { user, source, ...view };
}

describe("AssignmentScreen", () => {
  test("in 3–5 mode, shows the title, class, time estimate, and the steps in order", async () => {
    renderAssignment(COUNT_ID, mockSource(), "3-5");

    expect(await screen.findByRole("heading", { level: 1, name: "Count to 20" })).toBeInTheDocument();
    expect(screen.getByText("Math")).toBeInTheDocument();
    expect(screen.getByText(en.assignment.aboutMinutes(10))).toBeInTheDocument();

    const steps = within(screen.getByRole("region", { name: en.assignment.stepsHeading })).getAllByRole("listitem");
    expect(steps.map((li) => li.textContent)).toEqual([
      "Get your counting blocks.",
      "Count them one by one.",
      "Write the number you got.",
    ]);
  });

  test("in K–2 mode, leaves out the time estimate but keeps the class and steps", async () => {
    renderAssignment(COUNT_ID, mockSource(), "K-2");

    await screen.findByRole("heading", { level: 1, name: "Count to 20" });
    expect(screen.getByText("Math")).toBeInTheDocument();
    expect(screen.queryByText(en.assignment.aboutMinutes(10))).not.toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: en.assignment.stepsHeading })).getAllByRole("listitem")).toHaveLength(3);
  });

  test("step picture cues are decorative; the text carries the meaning", async () => {
    const { container } = renderAssignment();

    await screen.findByRole("heading", { level: 1, name: "Count to 20" });
    expect(container.querySelectorAll("li svg")).toHaveLength(3);
    expect(screen.queryAllByRole("img")).toHaveLength(0);
  });

  test("always offers a way back to Today", async () => {
    renderAssignment();

    await screen.findByRole("heading", { level: 1, name: "Count to 20" });
    expect(screen.getByRole("link", { name: en.nav.backToToday })).toHaveAttribute("href", "#/");
  });

  test("marking done saves it, confirms it, and moves focus to the confirmation", async () => {
    const { user, source } = renderAssignment();

    await user.click(await screen.findByRole("button", { name: en.assignment.markDone }));

    const confirmation = await screen.findByRole("heading", { name: en.assignment.doneHeading });
    expect(confirmation).toHaveFocus();
    expect(screen.queryByRole("button", { name: en.assignment.markDone })).not.toBeInTheDocument();
    const progress = await source.getMyProgress(TEST_TODAY);
    expect(progress.find((p) => p.assignmentId === COUNT_ID)?.status).toBe("done");
  });

  test("can be marked done with the keyboard alone", async () => {
    const { user } = renderAssignment();
    await screen.findByRole("button", { name: en.assignment.markDone });

    await user.tab(); // Back to Today
    await user.tab(); // I'm done!
    expect(screen.getByRole("button", { name: en.assignment.markDone })).toHaveFocus();
    await user.keyboard("{Enter}");

    expect(await screen.findByRole("heading", { name: en.assignment.doneHeading })).toHaveFocus();
  });

  test("saves only once even if the button is pressed twice quickly", async () => {
    let finish: (p: AssignmentProgress) => void = () => {};
    const source = mockSource();
    const markDone = vi.fn(
      () => new Promise<AssignmentProgress>((resolve) => (finish = resolve)),
    );
    const { user } = renderAssignment(COUNT_ID, { ...source, markDone });
    const button = await screen.findByRole("button", { name: en.assignment.markDone });

    await user.click(button);
    await user.dblClick(button);
    finish({ assignmentId: COUNT_ID, status: "done", completedAt: "2026-10-06T12:00:00.000Z" });

    await screen.findByRole("heading", { name: en.assignment.doneHeading });
    expect(markDone).toHaveBeenCalledTimes(1);
  });

  test("'Oops, I'm not done yet' undoes it and puts focus back on 'I'm done!'", async () => {
    const { user, source, container } = renderAssignment();
    await user.click(await screen.findByRole("button", { name: en.assignment.markDone }));

    await user.click(await screen.findByRole("button", { name: en.assignment.notDoneYet }));

    const markDone = await screen.findByRole("button", { name: en.assignment.markDone });
    expect(markDone).toHaveFocus();
    expect(screen.queryByRole("heading", { name: en.assignment.doneHeading })).not.toBeInTheDocument();
    const progress = await source.getMyProgress(TEST_TODAY);
    expect(progress.find((p) => p.assignmentId === COUNT_ID)?.status).toBe("not_started");
    await expectNoAxeViolations(container, { includeBestPractices: true });
  });

  test("undo is offered for work finished earlier too, and works with the keyboard", async () => {
    const source = mockSource();
    await source.markDone(COUNT_ID);
    const { user } = renderAssignment(COUNT_ID, source);

    const undo = await screen.findByRole("button", { name: en.assignment.notDoneYet });
    undo.focus();
    await user.keyboard("{Enter}");

    expect(await screen.findByRole("button", { name: en.assignment.markDone })).toHaveFocus();
  });

  test("if undo fails, says so kindly and keeps the work marked done", async () => {
    const base = mockSource();
    await base.markDone(COUNT_ID);
    const source = { ...base, markNotDone: () => Promise.reject(new Error("offline")) };
    const { user } = renderAssignment(COUNT_ID, source);

    await user.click(await screen.findByRole("button", { name: en.assignment.notDoneYet }));

    expect(await screen.findByRole("alert")).toHaveTextContent(en.assignment.saveError);
    expect(screen.getByRole("heading", { name: en.assignment.doneHeading })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: en.assignment.notDoneYet })).toBeEnabled();
  });

  test("already-finished work shows the confirmation instead of the button", async () => {
    const source = mockSource();
    await source.markDone(COUNT_ID);

    renderAssignment(COUNT_ID, source);

    expect(await screen.findByRole("heading", { name: en.assignment.doneHeading })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: en.assignment.markDone })).not.toBeInTheDocument();
  });

  test("another class's assignment is not shown (same message as a missing one)", async () => {
    renderAssignment("asg-g4-math-fractions", mockSource(MOCK_STUDENT_IDS.k2));

    expect(await screen.findByRole("heading", { level: 1, name: en.assignment.notFound })).toBeInTheDocument();
    expect(screen.queryByText(/Fractions/)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: en.assignment.markDone })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: en.nav.backToToday })).toBeInTheDocument();
  });

  test("if saving fails, says so kindly and lets the student try again", async () => {
    const source = { ...mockSource(), markDone: () => Promise.reject(new Error("offline")) };
    const { user } = renderAssignment(COUNT_ID, source);

    await user.click(await screen.findByRole("button", { name: en.assignment.markDone }));

    expect(await screen.findByRole("alert")).toHaveTextContent(en.assignment.saveError);
    expect(screen.getByRole("button", { name: en.assignment.markDone })).toBeEnabled();
    expect(screen.queryByText(/offline/)).not.toBeInTheDocument();
  });

  test("announces loading and fails closed if the assignment cannot load", async () => {
    const loading = renderAssignment(COUNT_ID, { ...mockSource(), getAssignment: () => new Promise(() => {}) });
    expect(screen.getByRole("status")).toHaveTextContent(en.common.loading);
    loading.unmount();

    renderAssignment(COUNT_ID, { ...mockSource(), getAssignment: () => Promise.reject(new Error("offline")) });
    expect(await screen.findByRole("alert")).toHaveTextContent(en.common.loadError);
    expect(screen.getByRole("link", { name: en.nav.backToToday })).toBeInTheDocument();
  });
});

describe("AssignmentScreen read-aloud", () => {
  afterEach(() => removeSpeech());

  test("in K–2, the steps card reads the title and every numbered step", async () => {
    const speech = installFakeSpeech([onDeviceVoice()]);
    const { user } = renderAssignment(COUNT_ID, mockSource(), "K-2");
    const steps = await screen.findByRole("region", { name: en.assignment.stepsHeading });

    await user.click(within(steps).getByRole("button", { name: en.readAloud.labelFor(en.assignment.stepsHeading) }));

    expect(speech.spoken.map((u) => u.text).join(" ")).toBe(
      [
        "Count to 20.",
        `${en.assignment.stepsHeading}.`,
        `${en.readAloud.stepNumber(1)} Get your counting blocks.`,
        `${en.readAloud.stepNumber(2)} Count them one by one.`,
        `${en.readAloud.stepNumber(3)} Write the number you got.`,
      ].join(" "),
    );
  });

  test("in 3–5, there is no read-aloud button by default", async () => {
    installFakeSpeech([onDeviceVoice()]);
    renderAssignment(COUNT_ID, mockSource(), "3-5");
    await screen.findByRole("region", { name: en.assignment.stepsHeading });

    expect(screen.queryByRole("button", { name: new RegExp(`^${en.readAloud.label}`) })).not.toBeInTheDocument();
  });

  test("in 3–5 with the read-aloud setting on, the steps card can be read aloud", async () => {
    const speech = installFakeSpeech([onDeviceVoice()]);
    const user = userEvent.setup();
    renderWithProviders(
      <main>
        <AssignmentScreen assignmentId={COUNT_ID} />
      </main>,
      { band: "3-5", readAloudIn35: true },
    );
    const steps = await screen.findByRole("region", { name: en.assignment.stepsHeading });

    await user.click(within(steps).getByRole("button", { name: en.readAloud.labelFor(en.assignment.stepsHeading) }));

    expect(speech.spoken[0]?.text).toBe("Count to 20.");
  });

  test("reading stops when the student leaves the assignment", async () => {
    const speech = installFakeSpeech([onDeviceVoice()]);
    const { user, unmount } = renderAssignment(COUNT_ID, mockSource(), "K-2");
    const steps = await screen.findByRole("region", { name: en.assignment.stepsHeading });
    await user.click(within(steps).getByRole("button"));
    const before = speech.cancelCount();

    unmount();

    expect(speech.cancelCount()).toBe(before + 1);
  });
});

describe("AssignmentScreen accessibility (axe)", () => {
  test("has no violations before, after marking done, and when not found", async () => {
    const first = renderAssignment();
    await screen.findByRole("button", { name: en.assignment.markDone });
    await expectNoAxeViolations(first.container, { includeBestPractices: true });

    await first.user.click(screen.getByRole("button", { name: en.assignment.markDone }));
    await screen.findByRole("heading", { name: en.assignment.doneHeading });
    await expectNoAxeViolations(first.container, { includeBestPractices: true });
    first.unmount();

    const missing = renderAssignment("does-not-exist");
    await screen.findByRole("heading", { level: 1, name: en.assignment.notFound });
    await waitFor(() => expectNoAxeViolations(missing.container, { includeBestPractices: true }));
  });
});
