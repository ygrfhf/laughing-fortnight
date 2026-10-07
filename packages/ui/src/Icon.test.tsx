import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { Calculator } from "lucide-react";
import { Icon } from "./Icon";
import { expectNoAxeViolations } from "./test-utils/axe";

describe("Icon", () => {
  test("is hidden from assistive technology by default (decorative next to text)", () => {
    const { container } = render(<Icon icon={Calculator} />);

    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("focusable", "false");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  test("with a label, is an image with that accessible name (icon-only use)", () => {
    render(<Icon icon={Calculator} label="Math" />);

    expect(screen.getByRole("img", { name: "Math" })).toBeInTheDocument();
  });

  test("has no axe violations in either mode", async () => {
    const { container } = render(
      <p>
        <Icon icon={Calculator} /> Math <Icon icon={Calculator} label="Math" />
      </p>,
    );

    await expectNoAxeViolations(container);
  });
});
