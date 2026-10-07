import { afterEach, describe, expect, test } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expectNoAxeViolations } from "@laughing-fortnight/ui/test-utils/axe";
import { installFakeSpeech, onDeviceVoice, removeSpeech } from "@laughing-fortnight/ui/test-utils/fake-speech";
import { App } from "../App";
import { DataSourceProvider } from "../data/DataSourceProvider";
import { devStrings } from "../strings/dev-en";
import { en } from "../strings/en";
import { at, mockSource } from "../test-utils/render-with-providers";
import { DevShell } from "./DevShell";

afterEach(() => {
  window.location.hash = "";
  removeSpeech();
});

function renderDevApp() {
  const user = userEvent.setup();
  const view = render(
    <DataSourceProvider source={mockSource()}>
      <DevShell now={() => at("09:30")}>
        <App />
      </DevShell>
    </DataSourceProvider>,
  );
  return { user, ...view };
}

const toolbar = () => screen.getByRole("complementary", { name: devStrings.toolsLabel });
const band = (container: HTMLElement) => container.querySelector("[data-grade-band]")?.getAttribute("data-grade-band");

describe("DevShell toolbar", () => {
  test("is a labelled, collapsed panel that does not get in the way", () => {
    renderDevApp();

    const details = toolbar().querySelector("details");
    expect(details).not.toHaveAttribute("open");
    expect(within(toolbar()).getByText(devStrings.summary)).toBeInTheDocument();
  });

  test("starts on Auto, which follows the student's grade", async () => {
    const { container } = renderDevApp();

    expect(within(toolbar()).getByRole("radio", { name: devStrings.auto })).toBeChecked();
    await screen.findByText(en.today.greeting("Testy"));
    expect(band(container)).toBe("K-2");
  });

  test("switching to 3–5 and back changes the whole app", async () => {
    const { user, container } = renderDevApp();
    await screen.findByText(en.today.greeting("Testy"));

    await user.click(within(toolbar()).getByRole("radio", { name: devStrings.bandG35 }));
    expect(band(container)).toBe("3-5");
    expect(await screen.findByText(en.today.stepDetails("Math", 10))).toBeInTheDocument();

    await user.click(within(toolbar()).getByRole("radio", { name: devStrings.bandK2 }));
    expect(band(container)).toBe("K-2");
    expect(screen.queryByText(en.today.stepDetails("Math", 10))).not.toBeInTheDocument();
  });

  test("a pretend time moves the day along, and 'Use real time' undoes it", async () => {
    const { user } = renderDevApp();
    const rightNow = await screen.findByRole("region", { name: en.today.rightNowHeading });
    expect(within(rightNow).getByText("Math")).toBeInTheDocument();

    fireEvent.change(within(toolbar()).getByLabelText(devStrings.time), { target: { value: "10:20" } });
    expect(await within(rightNow).findByText("Recess")).toBeInTheDocument();

    await user.click(within(toolbar()).getByRole("button", { name: devStrings.useRealTime }));
    expect(await within(rightNow).findByText("Math")).toBeInTheDocument();
  });

  test("read-aloud in 3–5 is off by default and the toolbar switch turns it on and off", async () => {
    installFakeSpeech([onDeviceVoice()]);
    const { user } = renderDevApp();
    await screen.findByText(en.today.greeting("Testy"));
    const readButtons = () => screen.queryAllByRole("button", { name: new RegExp(`^${en.readAloud.label}`) });
    await user.click(within(toolbar()).getByRole("radio", { name: devStrings.bandG35 }));

    const toggle = within(toolbar()).getByRole("checkbox", { name: devStrings.readAloudIn35 });
    expect(toggle).not.toBeChecked();
    expect(readButtons()).toHaveLength(0);

    await user.click(toggle);
    expect(readButtons()).toHaveLength(3);

    await user.click(toggle);
    expect(readButtons()).toHaveLength(0);
  });

  test("has no axe violations, open or closed", async () => {
    const { container, user } = renderDevApp();
    await screen.findByText(en.today.greeting("Testy"));
    await expectNoAxeViolations(container, { includeBestPractices: true });

    await user.click(within(toolbar()).getByText(devStrings.summary));
    await expectNoAxeViolations(container, { includeBestPractices: true });
  });
});
