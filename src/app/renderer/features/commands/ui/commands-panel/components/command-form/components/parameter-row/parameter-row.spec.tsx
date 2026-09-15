import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ParameterRow } from "./parameter-row";
import {
  PARAMETER_ROW_OPEN_LABEL,
  PARAMETER_ROW_OPTIONAL_LABEL,
  PARAMETER_ROW_REMOVE_LABEL,
  PARAMETER_ROW_REQUIRED_LABEL,
  PARAMETER_ROW_UNUSED_LABEL,
} from "../../constants";
import type { CommandParameter } from "../../../../../../../../interfaces";

function parameter(patch: Partial<CommandParameter> = {}): CommandParameter {
  return {
    id: "parameter-1",
    name: "branch",
    type: "text",
    description: "Гілка, на яку відкривати PR",
    isRequired: true,
    values: [],
    ...patch,
  };
}

describe("ParameterRow", () => {
  it("names the parameter, what it may hold, and whether the model must fill it", () => {
    const { rerender } = render(<ParameterRow parameter={parameter()} isUsed onOpen={() => {}} onRemove={() => {}} />);

    expect(screen.getByText("branch")).toBeInTheDocument();
    expect(screen.getByText("text")).toBeInTheDocument();
    expect(screen.getByText(PARAMETER_ROW_REQUIRED_LABEL)).toBeInTheDocument();

    rerender(
      <ParameterRow
        parameter={parameter({
          isRequired: false,
        })}
        isUsed
        onOpen={() => {}}
        onRemove={() => {}}
      />,
    );

    expect(screen.getByText(PARAMETER_ROW_OPTIONAL_LABEL)).toBeInTheDocument();
  });

  it("says of a parameter the run line never names that it is not in the line at all", () => {
    // Declared and never substituted is neither required nor optional — it simply does nothing.
    render(<ParameterRow parameter={parameter()} isUsed={false} onOpen={() => {}} onRemove={() => {}} />);

    expect(screen.getByText(PARAMETER_ROW_UNUSED_LABEL)).toBeInTheDocument();
    expect(screen.queryByText(PARAMETER_ROW_REQUIRED_LABEL)).not.toBeInTheDocument();
  });

  it("wears a dashed edge while it stands outside the line, and a solid one once the line names it", () => {
    const { container, rerender } = render(
      <ParameterRow parameter={parameter()} isUsed={false} onOpen={() => {}} onRemove={() => {}} />,
    );

    expect(container.firstElementChild).toHaveProperty("style.borderStyle", "dashed");

    rerender(<ParameterRow parameter={parameter()} isUsed onOpen={() => {}} onRemove={() => {}} />);

    expect(container.firstElementChild).toHaveProperty("style.borderStyle", "solid");
  });

  it("opens by its own row and is taken away by its own cross", async () => {
    const onOpen = vi.fn();
    const onRemove = vi.fn();

    render(<ParameterRow parameter={parameter()} isUsed onOpen={onOpen} onRemove={onRemove} />);
    await userEvent.click(
      screen.getByRole("button", {
        name: `${PARAMETER_ROW_OPEN_LABEL} branch`,
      }),
    );

    expect(onOpen).toHaveBeenCalledOnce();

    await userEvent.click(
      screen.getByRole("button", {
        name: `${PARAMETER_ROW_REMOVE_LABEL} branch`,
      }),
    );

    expect(onRemove).toHaveBeenCalledOnce();
    expect(onOpen).toHaveBeenCalledOnce();
  });
});
