import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { App } from "./App";
import { en } from "./strings/en";

describe("App shell", () => {
  test("renders a single main landmark with the Today heading", () => {
    render(<App />);

    const main = screen.getByRole("main");
    expect(main).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: en.today.heading })).toBeInTheDocument();
  });
});
