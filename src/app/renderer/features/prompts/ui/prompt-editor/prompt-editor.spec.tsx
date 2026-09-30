import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PromptEditor } from "./prompt-editor";
import {
  PROMPT_EDITOR_CANCEL_LABEL,
  PROMPT_EDITOR_COLLAPSE_LABEL,
  PROMPT_EDITOR_NAME_LABEL,
  PROMPT_EDITOR_SAVE_LABEL,
  PROMPT_EDITOR_TEXT_PLACEHOLDER,
} from "./constants";
import { UNSAVED_MARK_LABEL } from "../../../../components/unsaved-mark/constants";
import type { PromptFormValues } from "../../interfaces";
import { NAME_TAKEN_PROMPT_NOTE } from "../../../../constants";
import { FIELD_SLOT_WAS_PREFIX } from "../../../../components/field-slot/constants";

const PROMPT: PromptFormValues = {
  name: "Правки коду",
  text: "Ти працюєш у наявному репозиторії.",
};

/** Stands in for the section that holds the editor's draft. */
function EditorHarness({
  values: initial = PROMPT,
  onSave = async () => {},
  ...overrides
}: Partial<Omit<Parameters<typeof PromptEditor>[0], "onSave">> & {
  onSave?: (values: PromptFormValues) => Promise<void>;
}) {
  const [values, setValues] = useState(initial);

  return (
    <PromptEditor
      values={values}
      wasName={null}
      isNameTaken={false}
      isNew={false}
      hasUnsaved={false}
      agentNames={["EDITOR", "REVIEWER"]}
      onChange={(patch) =>
        setValues((current) => ({
          ...current,
          ...patch,
        }))
      }
      onSave={() => onSave(values)}
      onClose={() => {}}
      onCancel={() => {}}
      {...overrides}
    />
  );
}

function renderEditor(overrides: Partial<Parameters<typeof EditorHarness>[0]> = {}) {
  return render(<EditorHarness {...overrides} />);
}

describe("PromptEditor", () => {
  it("says what the name stood at before the draft moved it", () => {
    render(<EditorHarness wasName="Правки коду" />);

    // The name is a field like any other.
    expect(screen.getByText(`${FIELD_SLOT_WAS_PREFIX}Правки коду`)).toBeInTheDocument();
  });

  it("wears nothing while the name stands where it was written", () => {
    render(<EditorHarness />);

    expect(screen.queryByText(new RegExp(FIELD_SLOT_WAS_PREFIX, "i"))).not.toBeInTheDocument();
  });

  it("opens on the draft it was given, and counts what is in it", () => {
    renderEditor();

    expect(screen.getByText(PROMPT.name)).toBeInTheDocument();
    expect(screen.getByLabelText(PROMPT_EDITOR_TEXT_PLACEHOLDER)).toHaveValue(PROMPT.text);
    expect(screen.getByText("5 слів")).toBeInTheDocument();
    expect(screen.getByText(/Зміни торкнуться 2 агентів: EDITOR · REVIEWER/)).toBeInTheDocument();
  });

  it("hands every keystroke up, and writes what stands there when the save is pressed", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);

    renderEditor({
      onSave,
    });
    await userEvent.type(screen.getByLabelText(PROMPT_EDITOR_TEXT_PLACEHOLDER), " Далі.");

    expect(screen.getByLabelText(PROMPT_EDITOR_TEXT_PLACEHOLDER)).toHaveValue(`${PROMPT.text} Далі.`);

    await userEvent.click(screen.getByText(PROMPT_EDITOR_SAVE_LABEL));

    expect(onSave).toHaveBeenCalledWith({
      name: PROMPT.name,
      text: `${PROMPT.text} Далі.`,
    });
  });

  it("opens the name on a click anywhere along its line, named or not", async () => {
    renderEditor();

    expect(screen.queryByLabelText(PROMPT_EDITOR_NAME_LABEL)).not.toBeInTheDocument();

    await userEvent.click(screen.getByText(PROMPT_EDITOR_NAME_LABEL));

    expect(screen.getByLabelText(PROMPT_EDITOR_NAME_LABEL)).toHaveValue(PROMPT.name);
  });

  it("takes a name that was clicked, and refuses to write a prompt without one", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);

    renderEditor({
      values: {
        name: "",
        text: "",
      },
      isNew: true,
      agentNames: [],
      onSave,
    });

    // A prompt that does not exist yet opens on its name.
    await userEvent.click(screen.getByText(PROMPT_EDITOR_SAVE_LABEL));

    expect(onSave).not.toHaveBeenCalled();

    await userEvent.type(screen.getByLabelText(PROMPT_EDITOR_NAME_LABEL), "Рев'ю");
    await userEvent.type(screen.getByLabelText(PROMPT_EDITOR_TEXT_PLACEHOLDER), "Ти рев'юер.");
    await userEvent.click(screen.getByText(PROMPT_EDITOR_SAVE_LABEL));

    expect(onSave).toHaveBeenCalledWith({
      name: "Рев'ю",
      text: "Ти рев'юер.",
    });
  });

  it("leaves by two different presses: the way out that asks, and the one that throws the draft away", async () => {
    const onClose = vi.fn();
    const onCancel = vi.fn();

    renderEditor({
      onClose,
      onCancel,
    });
    await userEvent.keyboard("{Escape}");
    await userEvent.click(screen.getByText(PROMPT_EDITOR_COLLAPSE_LABEL));

    expect(onClose).toHaveBeenCalledTimes(2);
    expect(onCancel).not.toHaveBeenCalled();

    await userEvent.click(screen.getByText(PROMPT_EDITOR_CANCEL_LABEL));

    expect(onCancel).toHaveBeenCalledOnce();
  });
  it("says in its own header when the text standing in it is not written", () => {
    const { rerender } = renderEditor();

    expect(screen.queryByText(UNSAVED_MARK_LABEL)).not.toBeInTheDocument();

    rerender(<EditorHarness hasUnsaved />);

    expect(screen.getByText(UNSAVED_MARK_LABEL)).toBeInTheDocument();
  });

  it("does not write a name the library already has, and opens the field on it", async () => {
    const onSave = vi.fn();

    renderEditor({
      isNameTaken: true,
      onSave,
    });

    await userEvent.click(screen.getByText(PROMPT_EDITOR_SAVE_LABEL));

    // A taken name: the name field opens and the line under it says whose it is.
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText(NAME_TAKEN_PROMPT_NOTE)).toBeInTheDocument();
  });

  it("writes when the name is nobody else's", async () => {
    const onSave = vi.fn();

    renderEditor({
      isNameTaken: false,
      onSave,
    });

    await userEvent.click(screen.getByText(PROMPT_EDITOR_SAVE_LABEL));

    expect(onSave).toHaveBeenCalled();
    expect(screen.queryByText(NAME_TAKEN_PROMPT_NOTE)).not.toBeInTheDocument();
  });
});
