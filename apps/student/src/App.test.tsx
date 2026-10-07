import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { App } from "./App";
import { en } from "./strings/en";
import { renderWithProviders } from "./test-utils/render-with-providers";

describe("App shell", () => {
  test("renders a single main landmark containing the Today screen", async () => {
    renderWithProviders(<App />);

    expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(screen.getByRole("main")).toContainElement(
      screen.getByRole("heading", { level: 1, name: en.today.heading }),
    );
    expect(await screen.findByText(en.today.greeting("Testy"))).toBeInTheDocument();
  });

  test("fails loudly if rendered without a data source", () => {
    expect(() => render(<App />)).toThrow(/DataSourceProvider/);
  });
});
