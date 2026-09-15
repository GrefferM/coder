import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ParametersList } from "./parameters-list";
import {
  COMMAND_FORM_ADD_PARAMETER_LABEL,
  COMMAND_FORM_NEW_PARAMETER_ID,
  COMMAND_FORM_PARAMETERS_LABEL,
  PARAMETER_ROW_OPEN_LABEL,
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

function acts() {
  return {
    onOpen: vi.fn(),
    onSubmit: vi.fn(),
    onDraft: vi.fn(),
    onRemove: vi.fn(),
    onCancel: vi.fn(),
  };
}

describe("ParametersList", () => {
  it("stands a row for every parameter, under their own heading", () => {
    render(
      <ParametersList
        run=""
        parameters={[
          parameter(),
          parameter({
            id: "parameter-2",
            name: "draft",
          }),
        ]}
        usedNames={["branch", "draft"]}
        openParameterId={null}
        {...acts()}
      />,
    );

    expect(screen.getByText(COMMAND_FORM_PARAMETERS_LABEL)).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: `${PARAMETER_ROW_OPEN_LABEL} branch`,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: `${PARAMETER_ROW_OPEN_LABEL} draft`,
      }),
    ).toBeInTheDocument();
  });

  it("says of a parameter that it is written nowhere in the run line", () => {
    // A parameter the line never spells out is one the command cannot actually take.
    render(<ParametersList run="" parameters={[parameter()]} usedNames={[]} openParameterId={null} {...acts()} />);

    expect(screen.getByText(PARAMETER_ROW_UNUSED_LABEL)).toBeInTheDocument();
  });

  it("turns the one being written into a card, the rest staying rows", () => {
    render(
      <ParametersList
        run=""
        parameters={[
          parameter(),
          parameter({
            id: "parameter-2",
            name: "draft",
          }),
        ]}
        usedNames={["branch", "draft"]}
        openParameterId="parameter-1"
        {...acts()}
      />,
    );

    expect(
      screen.queryByRole("button", {
        name: `${PARAMETER_ROW_OPEN_LABEL} branch`,
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: `${PARAMETER_ROW_OPEN_LABEL} draft`,
      }),
    ).toBeInTheDocument();
  });

  it("offers to add one, and gives that offer up to the new card while it stands", async () => {
    const said = acts();
    const { rerender } = render(
      <ParametersList run="" parameters={[]} usedNames={[]} openParameterId={null} {...said} />,
    );

    await userEvent.click(screen.getByText(COMMAND_FORM_ADD_PARAMETER_LABEL));

    expect(said.onOpen).toHaveBeenCalledWith(COMMAND_FORM_NEW_PARAMETER_ID);

    rerender(
      <ParametersList
        run=""
        parameters={[]}
        usedNames={[]}
        openParameterId={COMMAND_FORM_NEW_PARAMETER_ID}
        {...said}
      />,
    );

    expect(screen.queryByText(COMMAND_FORM_ADD_PARAMETER_LABEL)).not.toBeInTheDocument();
  });

  it("opens the row that was pressed", async () => {
    const said = acts();

    render(
      <ParametersList run="" parameters={[parameter()]} usedNames={["branch"]} openParameterId={null} {...said} />,
    );
    await userEvent.click(
      screen.getByRole("button", {
        name: `${PARAMETER_ROW_OPEN_LABEL} branch`,
      }),
    );

    expect(said.onOpen).toHaveBeenCalledWith("parameter-1");
  });
});
