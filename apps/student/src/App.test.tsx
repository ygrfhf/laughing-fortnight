import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { App } from "./App";
import { en } from "./strings/en";
import { DataSourceProvider } from "./data/DataSourceProvider";
import type { StudentDataSource } from "./data/student-data-source";
import { createMockDataSource, MOCK_STUDENT_IDS } from "./mock-data/mock-data-source";

const TODAY = "2026-10-06";

function renderWithSource(source: StudentDataSource) {
  return render(
    <DataSourceProvider source={source}>
      <App />
    </DataSourceProvider>,
  );
}

function sourceWith(overrides: Partial<StudentDataSource>): StudentDataSource {
  return { ...createMockDataSource({ studentId: MOCK_STUDENT_IDS.k2, today: TODAY }), ...overrides };
}

describe("App shell", () => {
  test("renders a single main landmark with the Today heading", () => {
    renderWithSource(createMockDataSource({ studentId: MOCK_STUDENT_IDS.k2, today: TODAY }));

    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: en.today.heading })).toBeInTheDocument();
  });

  test("greets the signed-in student by first name from the data source", async () => {
    renderWithSource(createMockDataSource({ studentId: MOCK_STUDENT_IDS.k2, today: TODAY }));

    expect(await screen.findByText(en.today.greeting("Testy"))).toBeInTheDocument();
  });

  test("announces loading politely while data is on its way", () => {
    renderWithSource(sourceWith({ getMe: () => new Promise(() => {}) }));

    expect(screen.getByRole("status")).toHaveTextContent(en.common.loading);
  });

  test("shows the friendly ask-your-teacher message if loading fails", async () => {
    renderWithSource(sourceWith({ getMe: () => Promise.reject(new Error("offline")) }));

    expect(await screen.findByRole("alert")).toHaveTextContent(en.common.loadError);
    expect(screen.queryByText(/offline/)).not.toBeInTheDocument();
  });

  test("fails loudly if rendered without a data source", () => {
    expect(() => render(<App />)).toThrow(/DataSourceProvider/);
  });
});
