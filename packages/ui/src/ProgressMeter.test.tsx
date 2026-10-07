import { describe, expect, test } from "vitest";
import { render } from "@testing-library/react";
import { ProgressMeter } from "./ProgressMeter";
import { expectNoAxeViolations } from "./test-utils/axe";

const dots = (container: HTMLElement) => [...container.querySelectorAll(".lf-meter__dot")];
const doneDots = (container: HTMLElement) => [...container.querySelectorAll(".lf-meter__dot--done")];

describe("ProgressMeter", () => {
  test("shows one dot per task, filled for each finished task", () => {
    const { container } = render(<ProgressMeter done={1} total={4} />);

    expect(dots(container)).toHaveLength(4);
    expect(doneDots(container)).toHaveLength(1);
  });

  test("is visual only, because the progress sentence next to it says the same thing", () => {
    const { container } = render(<ProgressMeter done={2} total={3} />);

    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  test("renders nothing when nothing is due", () => {
    const { container } = render(<ProgressMeter done={0} total={0} />);

    expect(container).toBeEmptyDOMElement();
  });

  test("never shows more filled dots than tasks, or negative counts", () => {
    const over = render(<ProgressMeter done={7} total={3} />);
    expect(doneDots(over.container)).toHaveLength(3);
    over.unmount();

    const under = render(<ProgressMeter done={-1} total={3} />);
    expect(doneDots(under.container)).toHaveLength(0);
  });

  test("has no axe violations", async () => {
    const { container } = render(<ProgressMeter done={2} total={4} />);

    await expectNoAxeViolations(container);
  });
});
