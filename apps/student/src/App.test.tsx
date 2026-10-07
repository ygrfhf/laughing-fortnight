import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expectNoAxeViolations } from "@laughing-fortnight/ui/test-utils/axe";
import { App } from "./App";
import { en } from "./strings/en";
import { mockSource, renderWithProviders } from "./test-utils/render-with-providers";

beforeEach(() => {
  window.location.hash = "";
});

afterEach(() => {
  window.location.hash = "";
});

const nextStepRegion = () => screen.findByRole("region", { name: en.today.nextStepHeading });

describe("App shell", () => {
  test("renders a single main landmark containing the Today screen", async () => {
    renderWithProviders(<App />);

    expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(screen.getByRole("main")).toContainElement(
      screen.getByRole("heading", { level: 1, name: en.today.heading }),
    );
    expect(await screen.findByText(en.today.greeting("Testy"))).toBeInTheDocument();
  });

  test.each(["K-2", "3-5"] as const)("marks the app with the %s grade band so styles can adapt", async (band) => {
    const { container } = renderWithProviders(<App />, { band });

    await screen.findByText(en.today.greeting("Testy"));
    expect(container.querySelector("[data-grade-band]")).toHaveAttribute("data-grade-band", band);
  });

  test("uses the default font unless the dyslexia-friendly font is turned on", async () => {
    const plain = renderWithProviders(<App />);
    await screen.findByText(en.today.greeting("Testy"));
    expect(plain.container.querySelector("[data-font]")).toHaveAttribute("data-font", "default");
    plain.unmount();

    const dyslexic = renderWithProviders(<App />, { dyslexiaFont: true });
    await screen.findByText(en.today.greeting("Testy"));
    expect(dyslexic.container.querySelector("[data-font]")).toHaveAttribute("data-font", "dyslexic");
  });

  test("has no axe violations with the dyslexia-friendly font", async () => {
    const { container } = renderWithProviders(<App />, { dyslexiaFont: true });
    await screen.findByText(en.today.greeting("Testy"));

    await expectNoAxeViolations(container, { includeBestPractices: true });
  });

  test("fails loudly if rendered without a data source", () => {
    expect(() => render(<App />)).toThrow(/DataSourceProvider/);
  });

  test("titles the page after the current screen", async () => {
    renderWithProviders(<App />);
    expect(document.title).toBe(en.app.pageTitle(en.today.heading));

    window.location.hash = "#/assignment/asg-g1-math-count";
    window.dispatchEvent(new HashChangeEvent("hashchange"));

    await screen.findByRole("heading", { level: 1, name: "Count to 20" });
    expect(document.title).toBe(en.app.pageTitle("Count to 20"));
  });
});

describe("Today → assignment → done → Today", () => {
  test("the Start link names the work it opens", async () => {
    renderWithProviders(<App />, { time: "09:30" });

    const start = within(await nextStepRegion()).getByRole("link", { name: `${en.today.start} Count to 20` });
    expect(start).toHaveAttribute("href", "#/assignment/asg-g1-math-count");
  });

  test("there is no Start link when the next step is not an assignment", async () => {
    renderWithProviders(<App />, { time: "10:20" }); // recess

    expect(within(await nextStepRegion()).queryByRole("link")).not.toBeInTheDocument();
  });

  test("a student can finish their next step and come back to an updated Today", async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />, { source: mockSource(), time: "07:30" });

    await user.click(within(await nextStepRegion()).getByRole("link", { name: /^Start/ }));

    const title = await screen.findByRole("heading", { level: 1, name: "Story time: The Lost Mitten" });
    expect(title).toHaveFocus();

    await user.click(screen.getByRole("button", { name: en.assignment.markDone }));
    await user.click(await screen.findByRole("link", { name: en.nav.backToToday }));

    expect(await screen.findByRole("heading", { level: 1, name: en.today.heading })).toHaveFocus();
    const progress = await screen.findByRole("region", { name: en.today.progressHeading });
    expect(await within(progress).findByText(en.today.progressSummary(1, 4))).toBeInTheDocument();
    expect(within(await nextStepRegion()).getByText("Count to 20")).toBeInTheDocument();
  });

  test("an undo is reflected on Today", async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />, { source: mockSource(), time: "07:30" });

    await user.click(within(await nextStepRegion()).getByRole("link", { name: /^Start/ }));
    await user.click(await screen.findByRole("button", { name: en.assignment.markDone }));
    await user.click(await screen.findByRole("button", { name: en.assignment.notDoneYet }));
    await user.click(screen.getByRole("link", { name: en.nav.backToToday }));

    const progress = await screen.findByRole("region", { name: en.today.progressHeading });
    expect(await within(progress).findByText(en.today.progressSummary(0, 4))).toBeInTheDocument();
    expect(within(await nextStepRegion()).getByText("Story time: The Lost Mitten")).toBeInTheDocument();
  });

  test("the whole loop works with the keyboard alone", async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />, { source: mockSource(), time: "07:30" });
    const start = within(await nextStepRegion()).getByRole("link", { name: /^Start/ });

    start.focus();
    await user.keyboard("{Enter}");
    await screen.findByRole("heading", { level: 1, name: "Story time: The Lost Mitten" });
    screen.getByRole("button", { name: en.assignment.markDone }).focus();
    await user.keyboard("{Enter}");
    (await screen.findByRole("link", { name: en.nav.backToToday })).focus();
    await user.keyboard("{Enter}");

    const progress = await screen.findByRole("region", { name: en.today.progressHeading });
    expect(await within(progress).findByText(en.today.progressSummary(1, 4))).toBeInTheDocument();
  });
});
