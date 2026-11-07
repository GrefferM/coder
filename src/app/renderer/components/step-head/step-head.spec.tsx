import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { StepHead } from "./step-head";
import { STEP_HEAD_SEPARATOR } from "./constants";

describe("StepHead", () => {
  it("says whose the step is and what it is about", () => {
    render(<StepHead whose="Шукач" name="open_pr" backLabel="Назад" onBack={() => {}} />);

    expect(screen.getByText(`Шукач${STEP_HEAD_SEPARATOR}open_pr`)).toBeInTheDocument();
  });

  it("says whose the step is alone where the thing has no name to say", () => {
    render(<StepHead whose="Розклад" name="" backLabel="Назад" onBack={() => {}} />);

    expect(screen.getByText("Розклад")).toBeInTheDocument();
    expect(screen.queryByText(new RegExp(STEP_HEAD_SEPARATOR))).toBeNull();
  });

  it("is itself the way back", async () => {
    // The whole head is one button; chevron and name both go back.
    const onBack = vi.fn();

    render(<StepHead whose="Шукач" name="open_pr" backLabel="Назад до налаштувань" onBack={onBack} />);
    await userEvent.click(
      screen.getByRole("button", {
        name: "Назад до налаштувань",
      }),
    );

    expect(onBack).toHaveBeenCalledOnce();
  });

  it("names the way back where it leads, since two steps go back to two different places", () => {
    // The label is what a screen reader says, so it names the destination.
    render(<StepHead whose="MCP" name="brave_search" backLabel="Назад до MCP" onBack={() => {}} />);

    expect(
      screen.getByRole("button", {
        name: "Назад до MCP",
      }),
    ).toBeInTheDocument();
  });
});
