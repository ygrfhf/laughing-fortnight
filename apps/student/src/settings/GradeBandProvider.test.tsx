import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { DataSourceProvider } from "../data/DataSourceProvider";
import type { StudentDataSource } from "../data/student-data-source";
import { MOCK_STUDENT_IDS } from "../mock-data/mock-data-source";
import { mockSource } from "../test-utils/render-with-providers";
import { GradeBandProvider, useGradeBand } from "./GradeBandProvider";

function BandProbe() {
  return <p data-testid="band">{useGradeBand()}</p>;
}

function renderBand(source: StudentDataSource, override: "K-2" | "3-5" | null = null) {
  return render(
    <DataSourceProvider source={source}>
      <GradeBandProvider override={override}>
        <BandProbe />
      </GradeBandProvider>
    </DataSourceProvider>,
  );
}

describe("GradeBandProvider", () => {
  test("uses K–2 for a grade 1 student", async () => {
    renderBand(mockSource(MOCK_STUDENT_IDS.k2));

    expect(await screen.findByText("K-2")).toBeInTheDocument();
  });

  test("uses 3–5 for a grade 4 student", async () => {
    renderBand(mockSource(MOCK_STUDENT_IDS.g35));

    expect(await screen.findByText("3-5")).toBeInTheDocument();
  });

  test("a dev override wins over the student's grade", async () => {
    renderBand(mockSource(MOCK_STUDENT_IDS.k2), "3-5");

    expect(await screen.findByText("3-5")).toBeInTheDocument();
  });

  test("uses the demo default (K–2) until the student has loaded", () => {
    renderBand({ ...mockSource(MOCK_STUDENT_IDS.g35), getMe: () => new Promise(() => {}) });

    expect(screen.getByTestId("band")).toHaveTextContent("K-2");
  });

  test("falls back to the demo default if the student cannot load", async () => {
    renderBand({ ...mockSource(MOCK_STUDENT_IDS.g35), getMe: () => Promise.reject(new Error("offline")) });

    await Promise.resolve();
    expect(screen.getByTestId("band")).toHaveTextContent("K-2");
  });

  test("screens outside a provider get the demo default", () => {
    render(<BandProbe />);

    expect(screen.getByTestId("band")).toHaveTextContent("K-2");
  });
});
