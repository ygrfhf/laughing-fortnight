import { createRef } from "react";
import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button, ButtonLink } from "./Button";
import { expectNoAxeViolations } from "./test-utils/axe";

describe("Button", () => {
  test("is a native button that never submits a form by accident", () => {
    render(<Button onClick={() => {}}>I'm done!</Button>);

    const button = screen.getByRole("button", { name: "I'm done!" });
    expect(button.tagName).toBe("BUTTON");
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass("lf-button", "lf-button--primary");
  });

  test("works with mouse, Enter, and Space", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>I'm done!</Button>);

    await user.click(screen.getByRole("button"));
    screen.getByRole("button").focus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");

    expect(onClick).toHaveBeenCalledTimes(3);
  });

  test("forwards a ref so screens can move focus to it", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Button onClick={() => {}} ref={ref}>
        I'm done!
      </Button>,
    );

    ref.current?.focus();

    expect(screen.getByRole("button", { name: "I'm done!" })).toHaveFocus();
  });

  test("does nothing while disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Saving
      </Button>,
    );

    await user.click(screen.getByRole("button"));

    expect(screen.getByRole("button")).toBeDisabled();
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe("ButtonLink", () => {
  test("is a real link (it navigates), styled like a button", () => {
    render(
      <ButtonLink href="#/" variant="secondary">
        Back to Today
      </ButtonLink>,
    );

    const link = screen.getByRole("link", { name: "Back to Today" });
    expect(link).toHaveAttribute("href", "#/");
    expect(link).toHaveClass("lf-button", "lf-button--secondary");
  });
});

describe("ButtonLink accessible name", () => {
  test("can add context for screen readers while keeping the visible text first", () => {
    render(
      <ButtonLink href="#/assignment/a" accessibleName="Start Count to 20">
        Start
      </ButtonLink>,
    );

    const link = screen.getByRole("link", { name: "Start Count to 20" });
    expect(link).toHaveTextContent(/^Start$/);
  });
});

describe("Button and ButtonLink accessibility", () => {
  test("have no axe violations", async () => {
    const { container } = render(
      <div>
        <Button onClick={() => {}}>I'm done!</Button>
        <Button onClick={() => {}} variant="secondary" disabled>
          Saving
        </Button>
        <ButtonLink href="#/">Back to Today</ButtonLink>
      </div>,
    );

    await expectNoAxeViolations(container);
  });
});
