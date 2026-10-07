import { describe, expect, test } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { BookOpen } from "lucide-react";
import { Card } from "./Card";
import { expectNoAxeViolations } from "./test-utils/axe";

describe("Card", () => {
  test("is a region labelled by its level-2 heading", () => {
    render(<Card heading="Right now">Math</Card>);

    const region = screen.getByRole("region", { name: "Right now" });
    expect(within(region).getByRole("heading", { level: 2, name: "Right now" })).toBeInTheDocument();
    expect(region).toHaveTextContent("Math");
  });

  test("an icon is decorative and does not change the accessible name", () => {
    render(
      <Card heading="Right now" icon={BookOpen}>
        Reading
      </Card>,
    );

    expect(screen.getByRole("region", { name: "Right now" })).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  test("the primary card is marked for emphasis", () => {
    render(
      <Card heading="Your next step" emphasis="primary">
        Count to 20
      </Card>,
    );

    expect(screen.getByRole("region", { name: "Your next step" })).toHaveClass("lf-card--primary");
  });

  test("shows an optional action beside the heading, outside the heading itself", () => {
    render(
      <Card heading="Your next step" action={<button type="button">Read to me</button>}>
        Count to 20
      </Card>,
    );

    const heading = screen.getByRole("heading", { level: 2, name: "Your next step" });
    expect(within(heading).queryByRole("button")).not.toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "Your next step" })).getByRole("button")).toBeInTheDocument();
  });

  test("has no axe violations", async () => {
    const { container } = render(
      <Card heading="Your next step" icon={BookOpen} emphasis="primary">
        <p>Count to 20</p>
      </Card>,
    );

    await expectNoAxeViolations(container);
  });
});
