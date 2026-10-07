import { describe, expect, test } from "vitest";
import { render } from "@testing-library/react";
import { VisualTimer, timerWedgePath } from "./VisualTimer";
import { expectNoAxeViolations } from "./test-utils/axe";

const svgOf = (container: HTMLElement) => container.querySelector("svg.lf-timer");

describe("VisualTimer", () => {
  test("is visual only; the text next to it says how much time is left", () => {
    const { container } = render(<VisualTimer fractionLeft={0.75} />);

    expect(svgOf(container)).toHaveAttribute("aria-hidden", "true");
  });

  test("clamps the fraction to 0..1", () => {
    expect(svgOf(render(<VisualTimer fractionLeft={1.7} />).container)).toHaveAttribute("data-fraction-left", "1");
    expect(svgOf(render(<VisualTimer fractionLeft={-0.2} />).container)).toHaveAttribute("data-fraction-left", "0");
  });

  test("draws a full disc when no time has passed and nothing when time is up", () => {
    const full = render(<VisualTimer fractionLeft={1} />).container;
    expect(full.querySelector(".lf-timer__left")?.tagName.toLowerCase()).toBe("circle");

    const empty = render(<VisualTimer fractionLeft={0} />).container;
    expect(empty.querySelector(".lf-timer__left")).toBeNull();
  });

  test("has no axe violations", async () => {
    const { container } = render(
      <p>
        <VisualTimer fractionLeft={0.4} /> 24 minutes left
      </p>,
    );

    await expectNoAxeViolations(container);
  });
});

describe("timerWedgePath", () => {
  test("uses the large arc only when more than half the time is left", () => {
    const largeArcFlag = (path: string) => path.split(/[ ,]+/)[10];

    expect(largeArcFlag(timerWedgePath(0.75))).toBe("1");
    expect(largeArcFlag(timerWedgePath(0.25))).toBe("0");
  });

  test("starts at 12 o'clock from the center", () => {
    expect(timerWedgePath(0.5).startsWith("M 50 50 L 50 2")).toBe(true);
  });
});
