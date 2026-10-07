import { describe, expect, test } from "vitest";
import { screen, within } from "@testing-library/react";
import { TodayScreen } from "./TodayScreen";
import { en } from "../../strings/en";
import type { StudentDataSource } from "../../data/student-data-source";
import { mockSource, renderWithProviders, TEST_TODAY } from "../../test-utils/render-with-providers";

const K2_TODAY_TITLES = [
  "Story time: The Lost Mitten",
  "Count to 20",
  "Look closely at a leaf",
  "Make a picture with shapes",
];

const region = (name: string) => screen.findByRole("region", { name });

async function sourceWithDone(count: number): Promise<StudentDataSource> {
  const source = mockSource();
  const assignments = await source.getAssignmentsDueOn(TEST_TODAY);
  for (const a of assignments.slice(0, count)) {
    await source.markDone(a.id);
  }
  return source;
}

describe("TodayScreen", () => {
  test("greets the student and shows the Today heading", async () => {
    renderWithProviders(<TodayScreen />);

    expect(screen.getByRole("heading", { level: 1, name: en.today.heading })).toBeInTheDocument();
    expect(await screen.findByText(en.today.greeting("Testy"))).toBeInTheDocument();
  });

  test("during Math, shows the current class with its teacher and that class's work as the next step", async () => {
    renderWithProviders(<TodayScreen />, { time: "09:30" });

    const rightNow = await region(en.today.rightNowHeading);
    expect(within(rightNow).getByText("Math")).toBeInTheDocument();
    expect(within(rightNow).getByText(en.today.withTeacher("Ms. Sample"))).toBeInTheDocument();

    const nextStep = await region(en.today.nextStepHeading);
    expect(within(nextStep).getByText("Count to 20")).toBeInTheDocument();
  });

  test("shows exactly one next step, never a list of all the work", async () => {
    renderWithProviders(<TodayScreen />, { time: "09:30" });

    const nextStep = await region(en.today.nextStepHeading);
    const shown = K2_TODAY_TITLES.filter((title) => within(nextStep).queryByText(title));
    expect(shown).toEqual(["Count to 20"]);
    expect(within(nextStep).queryByRole("list")).not.toBeInTheDocument();
  });

  test("during recess, recess is both what is happening and the next step", async () => {
    renderWithProviders(<TodayScreen />, { time: "10:20" });

    expect(within(await region(en.today.rightNowHeading)).getByText("Recess")).toBeInTheDocument();
    expect(within(await region(en.today.nextStepHeading)).getByText("Recess")).toBeInTheDocument();
  });

  test("before school, says there is no class and points to the first work of the day", async () => {
    renderWithProviders(<TodayScreen />, { time: "07:30" });

    expect(within(await region(en.today.rightNowHeading)).getByText(en.today.noClassNow)).toBeInTheDocument();
    expect(within(await region(en.today.nextStepHeading)).getByText(K2_TODAY_TITLES[0]!)).toBeInTheDocument();
  });

  test("starts the day with an encouraging progress message", async () => {
    renderWithProviders(<TodayScreen />);

    expect(within(await region(en.today.progressHeading)).getByText(en.today.progressSummary(0, 4))).toBeInTheDocument();
  });

  test("counts finished work in the progress section", async () => {
    renderWithProviders(<TodayScreen />, { source: await sourceWithDone(1) });

    expect(within(await region(en.today.progressHeading)).getByText(en.today.progressSummary(1, 4))).toBeInTheDocument();
  });

  test("when the current class's work is finished, tells the student to ask their teacher", async () => {
    const source = mockSource();
    await source.markDone("asg-g1-math-count");

    renderWithProviders(<TodayScreen />, { source, time: "09:30" });

    const nextStep = await region(en.today.nextStepHeading);
    expect(within(nextStep).getByText(en.today.classFinished("Math"))).toBeInTheDocument();
    for (const title of K2_TODAY_TITLES) {
      expect(within(nextStep).queryByText(title)).not.toBeInTheDocument();
    }
  });

  test("the finished message uses the class name, not the schedule block title", async () => {
    const source = mockSource();
    await source.markDone("asg-g1-math-count");

    renderWithProviders(<TodayScreen />, { source, time: "13:45" }); // "Math centers" block

    expect(within(await region(en.today.nextStepHeading)).getByText(en.today.classFinished("Math"))).toBeInTheDocument();
  });

  test("when everything is finished, shows all done after school", async () => {
    renderWithProviders(<TodayScreen />, { source: await sourceWithDone(4), time: "16:00" });

    expect(within(await region(en.today.nextStepHeading)).getByText(en.today.allDone)).toBeInTheDocument();
    expect(within(await region(en.today.progressHeading)).getByText(en.today.progressSummary(4, 4))).toBeInTheDocument();
  });

  test("announces loading politely while data is on its way", () => {
    const source = { ...mockSource(), getSchedule: () => new Promise<never>(() => {}) };

    renderWithProviders(<TodayScreen />, { source });

    expect(screen.getByRole("status")).toHaveTextContent(en.common.loading);
  });

  test("shows the friendly ask-your-teacher message if any data fails to load", async () => {
    const source = { ...mockSource(), getMyProgress: () => Promise.reject(new Error("offline")) };

    renderWithProviders(<TodayScreen />, { source });

    expect(await screen.findByRole("alert")).toHaveTextContent(en.common.loadError);
    expect(screen.queryByText(/offline/)).not.toBeInTheDocument();
  });
});

describe("progress wording", () => {
  test("is positive at every point in the day and never mentions being behind", () => {
    const messages = [0, 1, 2, 3, 4].map((done) => en.today.progressSummary(done, 4));

    expect(new Set(messages).size).toBe(5);
    for (const message of messages) {
      expect(message).not.toMatch(/behind|late|only|fail|bad/i);
    }
    expect(en.today.progressSummary(0, 0)).not.toBe(en.today.progressSummary(0, 4));
  });
});
