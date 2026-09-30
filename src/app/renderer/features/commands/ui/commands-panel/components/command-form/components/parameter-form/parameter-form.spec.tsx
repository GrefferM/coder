import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ParameterForm } from "./parameter-form";
import {
  PARAMETER_FORM_CONFIRM_LABEL,
  PARAMETER_FORM_DESCRIPTION_LABEL,
  PARAMETER_FORM_ENUM_TYPE,
  PARAMETER_FORM_NAME_LABEL,
  PARAMETER_FORM_NAME_NOTE,
  PARAMETER_FORM_NAME_REFUSAL,
  PARAMETER_FORM_NEW_TITLE,
  PARAMETER_FORM_QUOTED_NOTE,
  PARAMETER_FORM_REQUIRED_LABEL,
  PARAMETER_FORM_TITLE_PREFIX,
} from "../../constants";
import { VALUES_FIELD_LABEL } from "../values-field/constants";
import type { CommandParameter } from "../../../../../../../../interfaces";

const branch: CommandParameter = {
  id: "parameter-1",
  name: "branch",
  type: "text",
  description: "Гілка, на яку відкривати PR",
  isRequired: true,
  values: [],
};

function acts() {
  return {
    onSubmit: vi.fn(),
    onDraft: vi.fn(),
    onCancel: vi.fn(),
  };
}

describe("ParameterForm", () => {
  it("names itself by what it is doing — declaring one, or opening the one that stands", () => {
    const { rerender } = render(<ParameterForm parameter={null} run="" {...acts()} />);

    expect(screen.getByText(PARAMETER_FORM_NEW_TITLE)).toBeInTheDocument();

    rerender(<ParameterForm parameter={branch} run="" {...acts()} />);

    expect(screen.getByText(`${PARAMETER_FORM_TITLE_PREFIX}branch`)).toBeInTheDocument();
  });

  it("stands the rule under the name from the first moment, and not after it is broken", () => {
    // The limit is visible before the person reaches it.
    render(<ParameterForm parameter={null} run="" {...acts()} />);

    expect(screen.getByText(PARAMETER_FORM_NAME_NOTE)).toBeInTheDocument();
  });

  it("answers a name the braces would not take with the refusal, and not with the rule said again", async () => {
    // The refusal names what failed, not the rule, which is already on screen.
    render(<ParameterForm parameter={null} run="" {...acts()} />);
    await userEvent.type(screen.getByLabelText(PARAMETER_FORM_NAME_LABEL), "2fast");

    expect(screen.getByText(PARAMETER_FORM_NAME_REFUSAL)).toBeInTheDocument();
    expect(screen.queryByText(PARAMETER_FORM_NAME_NOTE)).not.toBeInTheDocument();
  });

  it("takes a name in any alphabet, since this one never leaves the project", async () => {
    // «{шлях}» is a valid slot; a provider never sees it, unlike a function name.
    render(<ParameterForm parameter={null} run="" {...acts()} />);
    await userEvent.type(screen.getByLabelText(PARAMETER_FORM_NAME_LABEL), "шлях");

    expect(screen.queryByText(PARAMETER_FORM_NAME_REFUSAL)).not.toBeInTheDocument();
    expect(screen.getByText(PARAMETER_FORM_NAME_NOTE)).toBeInTheDocument();
  });

  it("holds «готово» closed until the name and the description are both written and the name will stand", async () => {
    const said = acts();

    render(<ParameterForm parameter={null} run="" {...said} />);

    const done = screen.getByText(PARAMETER_FORM_CONFIRM_LABEL);

    expect(done.closest("button")).toBeDisabled();

    await userEvent.type(screen.getByLabelText(PARAMETER_FORM_NAME_LABEL), "branch");

    expect(done.closest("button")).toBeDisabled();

    await userEvent.type(screen.getByLabelText(PARAMETER_FORM_DESCRIPTION_LABEL), "Гілка");

    expect(done.closest("button")).toBeEnabled();
  });

  it("grows the values row for an enum and for no other type", async () => {
    render(<ParameterForm parameter={null} run="" {...acts()} />);

    expect(screen.queryByText(VALUES_FIELD_LABEL)).not.toBeInTheDocument();

    await userEvent.click(screen.getByText(PARAMETER_FORM_ENUM_TYPE));

    expect(screen.getByText(VALUES_FIELD_LABEL)).toBeInTheDocument();
  });

  it("says the draft up on every keystroke, so the model's preview is never behind the card", async () => {
    const said = acts();

    render(<ParameterForm parameter={null} run="" {...said} />);
    await userEvent.type(screen.getByLabelText(PARAMETER_FORM_NAME_LABEL), "b");

    expect(said.onDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "b",
      }),
    );
  });

  it("keeps the id of the parameter it was opened on, so the row is written over and not doubled", async () => {
    const said = acts();

    render(<ParameterForm parameter={branch} run="" {...said} />);
    await userEvent.click(screen.getByText(PARAMETER_FORM_CONFIRM_LABEL));

    expect(said.onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "parameter-1",
        name: "branch",
      }),
    );
  });

  it("carries no values where the type is not an enum, whatever was typed into them before", async () => {
    const said = acts();

    render(
      <ParameterForm
        run=""
        parameter={{
          ...branch,
          type: "enum",
          values: ["dot", "tree"],
        }}
        {...said}
      />,
    );
    await userEvent.click(screen.getByText("text"));
    await userEvent.click(screen.getByText(PARAMETER_FORM_CONFIRM_LABEL));

    expect(said.onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "text",
        values: [],
      }),
    );
  });

  it("turns the required switch", async () => {
    const said = acts();

    render(<ParameterForm parameter={branch} run="" {...said} />);
    await userEvent.click(
      screen.getByRole("switch", {
        name: PARAMETER_FORM_REQUIRED_LABEL,
      }),
    );

    expect(said.onDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        isRequired: false,
      }),
    );
  });

  it("names the quotes an optional slot would leave behind, where the line really has them", () => {
    // «npm test -- '{mask}'» with nothing to put in leaves «''», which the shell counts as an argument.
    render(
      <ParameterForm
        parameter={{
          ...branch,
          name: "mask",
          isRequired: false,
        }}
        run="npm test -- '{mask}'"
        {...acts()}
      />,
    );

    expect(screen.getByText(PARAMETER_FORM_QUOTED_NOTE)).toBeInTheDocument();
  });

  it("says nothing where the slot stands bare: it goes and takes its place with it", () => {
    render(
      <ParameterForm
        parameter={{
          ...branch,
          name: "mask",
          isRequired: false,
        }}
        run="npm test -- {mask}"
        {...acts()}
      />,
    );

    expect(screen.queryByText(PARAMETER_FORM_QUOTED_NOTE)).not.toBeInTheDocument();
  });

  it("says nothing about a required slot, which never goes empty", () => {
    render(
      <ParameterForm
        parameter={{
          ...branch,
          name: "mask",
          isRequired: true,
        }}
        run="npm test -- '{mask}'"
        {...acts()}
      />,
    );

    expect(screen.queryByText(PARAMETER_FORM_QUOTED_NOTE)).not.toBeInTheDocument();
  });

  it("takes the warning back the moment the parameter is made required", async () => {
    render(
      <ParameterForm
        parameter={{
          ...branch,
          name: "mask",
          isRequired: false,
        }}
        run="npm test -- '{mask}'"
        {...acts()}
      />,
    );

    expect(screen.getByText(PARAMETER_FORM_QUOTED_NOTE)).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText(PARAMETER_FORM_REQUIRED_LABEL));

    expect(screen.queryByText(PARAMETER_FORM_QUOTED_NOTE)).not.toBeInTheDocument();
  });
});
