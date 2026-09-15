import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CommandForm } from "./command-form";
import {
  COMMAND_FORM_ADD_PARAMETER_LABEL,
  COMMAND_FORM_PARAMETERS_LABEL,
  COMMAND_RUN_FACTS,
  COMMAND_RUN_FACTS_LABEL,
  PARAMETER_FORM_CONFIRM_LABEL,
  PARAMETER_FORM_NAME_LABEL,
  PARAMETER_FORM_NAME_NOTE,
  PARAMETER_FORM_NAME_REFUSAL,
  PARAMETER_ROW_UNUSED_LABEL,
} from "./constants";
import { VALUES_FIELD_LABEL } from "./components/values-field/constants";
import { NAME_TAKEN_COMMAND_NOTE } from "../../../../../../constants";
import {
  COMMANDS_PANEL_DECLARE_LABEL,
  COMMANDS_PANEL_NAME_FIELD_LABEL,
  COMMANDS_PANEL_RUN_FIELD_NOTE,
} from "../../constants";
import { FIELD_INVALID_BORDER_COLOR } from "../../../../../../components/field/constants";
import type { CommandFormValues } from "../../../../interfaces";

const VALUES: CommandFormValues = {
  name: "run_tests",
  description: "Прогнати тести проєкту",
  run: "npm test -- {pattern}",
  parameters: [
    {
      id: "parameter-1",
      name: "pattern",
      type: "text",
      description: "Маска файлів тестів",
      isRequired: false,
      values: [],
    },
  ],
};

/** The form is controlled by the section above it. */
function HeldForm({ initial = VALUES, taken = [] }: { initial?: CommandFormValues; taken?: string[] }) {
  const [values, setValues] = useState(initial);

  return (
    <CommandForm
      values={values}
      isNew
      takenNames={taken}
      onChange={(patch) =>
        setValues((standing) => ({
          ...standing,
          ...patch,
        }))
      }
      onSave={async () => {}}
      onCancel={() => {}}
    />
  );
}

describe("CommandForm", () => {
  it("opens a declared parameter in the very card that declares one, keeping its id", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <CommandForm
        values={VALUES}
        isNew
        takenNames={[]}
        onChange={onChange}
        onSave={async () => {}}
        onCancel={() => {}}
      />,
    );
    await user.click(screen.getByLabelText(/Відкрити параметр pattern/));

    const card = screen.getByText("Параметр pattern").parentElement!.parentElement!;

    await user.clear(within(card).getByLabelText(PARAMETER_FORM_NAME_LABEL));
    await user.type(within(card).getByLabelText(PARAMETER_FORM_NAME_LABEL), "mask");
    await user.click(screen.getByText(PARAMETER_FORM_CONFIRM_LABEL));

    expect(onChange).toHaveBeenCalledWith({
      parameters: [
        expect.objectContaining({
          id: "parameter-1",
          name: "mask",
        }),
      ],
    });
  });

  it("says a parameter the run line never mentions, without refusing it", async () => {
    const user = userEvent.setup();

    render(<HeldForm />);

    expect(screen.queryByText(PARAMETER_ROW_UNUSED_LABEL)).not.toBeInTheDocument();

    await user.clear(screen.getByLabelText("КОМАНДА"));
    await user.type(screen.getByLabelText("КОМАНДА"), "npm test");

    expect(screen.getByText(PARAMETER_ROW_UNUSED_LABEL)).toBeInTheDocument();
  });

  it("takes a parameter off by the cross on its row, and by nothing else", async () => {
    const user = userEvent.setup();

    render(<HeldForm />);
    await user.click(screen.getByLabelText(/Прибрати параметр pattern/));

    expect(screen.queryByLabelText(/Відкрити параметр pattern/)).not.toBeInTheDocument();
  });

  it("shows what the model would be handed as the card is typed, before «ГОТОВО» is pressed", async () => {
    const user = userEvent.setup();

    render(<HeldForm />);
    await user.click(screen.getByLabelText(/Відкрити параметр pattern/));

    const card = screen.getByText("Параметр pattern").parentElement!;

    await user.clear(within(card).getByLabelText(PARAMETER_FORM_NAME_LABEL));
    await user.type(within(card).getByLabelText(PARAMETER_FORM_NAME_LABEL), "mask");

    // The block at the bottom follows the card.
    expect(screen.getByText("mask")).toBeInTheDocument();

    await user.click(screen.getByText("СКАСУВАТИ"));

    // The draft is dropped with the card.
    expect(screen.queryByText("mask")).not.toBeInTheDocument();
  });

  it("marks a name that could not stand in the line's braces, and keeps it as it was typed", async () => {
    const user = userEvent.setup();

    render(<HeldForm />);
    await user.click(screen.getByText(COMMAND_FORM_ADD_PARAMETER_LABEL));

    const card = screen.getByText(PARAMETER_FORM_NAME_LABEL).closest("div")!.parentElement!;

    await user.type(within(card).getByLabelText(PARAMETER_FORM_NAME_LABEL), "print $5");

    // The field says what is wrong; nothing is taken out of the name behind the person.
    expect(within(card).getByLabelText(PARAMETER_FORM_NAME_LABEL)).toHaveValue("print $5");
    // The refusal takes the rule's place — the rule is already on the screen, and saying it again
    // says nothing new.
    expect(screen.getByText(PARAMETER_FORM_NAME_REFUSAL)).toBeInTheDocument();
    expect(screen.queryByText(PARAMETER_FORM_NAME_NOTE)).not.toBeInTheDocument();
    expect(within(card).getByLabelText(PARAMETER_FORM_NAME_LABEL).parentElement).toHaveStyle({
      borderColor: FIELD_INVALID_BORDER_COLOR,
    });
    expect(screen.getByText(PARAMETER_FORM_CONFIRM_LABEL).closest("button")).toBeDisabled();
  });

  it("takes a name of letters, digits and «_», which is what a slot can be", async () => {
    const user = userEvent.setup();

    render(<HeldForm />);
    await user.click(screen.getByText(COMMAND_FORM_ADD_PARAMETER_LABEL));

    const card = screen.getByText(PARAMETER_FORM_NAME_LABEL).closest("div")!.parentElement!;

    await user.type(within(card).getByLabelText(PARAMETER_FORM_NAME_LABEL), "file_2");

    // The rule stands under the name always; what goes away is the refusal.
    expect(screen.queryByText(PARAMETER_FORM_NAME_REFUSAL)).not.toBeInTheDocument();
    expect(screen.getByText(PARAMETER_FORM_NAME_NOTE)).toBeInTheDocument();
  });

  it("asks an enum which values it allows, and asks nobody else", async () => {
    const user = userEvent.setup();

    render(<HeldForm />);
    await user.click(screen.getByText(COMMAND_FORM_ADD_PARAMETER_LABEL));

    expect(screen.queryByText(VALUES_FIELD_LABEL)).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("radio", {
        name: "enum",
      }),
    );

    expect(screen.getByText(VALUES_FIELD_LABEL)).toBeInTheDocument();

    await user.type(screen.getByLabelText(VALUES_FIELD_LABEL), "dot{Enter}spec{Enter}");

    expect(screen.getByText("dot")).toBeInTheDocument();
    expect(screen.getByText("spec")).toBeInTheDocument();
  });

  it("marks the name field and refuses to declare a command named as another one already is", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();

    render(
      <CommandForm
        values={{
          ...VALUES,
          name: "read_file",
        }}
        isNew
        takenNames={["read_file"]}
        onChange={() => {}}
        onSave={onSave}
        onCancel={() => {}}
      />,
    );

    expect(screen.getByText(NAME_TAKEN_COMMAND_NOTE)).toBeInTheDocument();
    // The box around the input is what carries the field's border, and the mark with it.
    expect(screen.getByLabelText(COMMANDS_PANEL_NAME_FIELD_LABEL).parentElement).toHaveStyle({
      borderColor: FIELD_INVALID_BORDER_COLOR,
    });

    await user.click(screen.getByText(COMMANDS_PANEL_DECLARE_LABEL));

    expect(onSave).not.toHaveBeenCalled();
  });

  it("says where and with what the command will run, before it ever runs", () => {
    render(
      <CommandForm
        values={VALUES}
        isNew
        takenNames={[]}
        onChange={() => {}}
        onSave={async () => {}}
        onCancel={() => {}}
      />,
    );

    expect(screen.getByText(COMMAND_RUN_FACTS_LABEL)).toBeInTheDocument();

    // The words get reworded; the spec asks that each of the three stands, not what they say.
    for (const fact of COMMAND_RUN_FACTS) {
      expect(screen.getByText(fact)).toBeInTheDocument();
    }
  });

  it("says under the run field that the quoting is the person's", () => {
    render(
      <CommandForm
        values={VALUES}
        isNew
        takenNames={[]}
        onChange={() => {}}
        onSave={async () => {}}
        onCancel={() => {}}
      />,
    );

    // The app joins the line and escapes nothing, so the border is said outright.
    expect(screen.getByText(COMMANDS_PANEL_RUN_FIELD_NOTE)).toBeInTheDocument();
  });

  it("stands the border of responsibility under the command line, above the parameters", () => {
    render(
      <CommandForm
        values={VALUES}
        isNew
        takenNames={[]}
        onChange={() => {}}
        onSave={async () => {}}
        onCancel={() => {}}
      />,
    );

    // The heaviest text in the app reads where the eye already is — right after the line it is about.
    const facts = screen.getByText(COMMAND_RUN_FACTS_LABEL);
    const parameters = screen.getByText(COMMAND_FORM_PARAMETERS_LABEL);

    expect(facts.compareDocumentPosition(parameters)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });
});
