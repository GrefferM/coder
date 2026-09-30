import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ModelForm } from "./model-form";
import {
  MODELS_PANEL_CREATE_LABEL,
  MODELS_PANEL_CANCEL_LABEL,
  MODELS_PANEL_TITLE_FIELD_LABEL,
  MODEL_NAME_NOTE_LOCAL,
  MODEL_NAME_NOTE_PREFIX,
  MODEL_NAME_NOTE_UNCHOSEN,
} from "../../constants";
import { FIELD_SLOT_WAS_PREFIX } from "../../../../../../components/field-slot/constants";
import type { ModelFormValues } from "../../../../interfaces";
import type { ProviderState } from "../../../../../../interfaces";

const remote: ProviderState = {
  id: "openrouter",
  name: "OpenRouter",
  kind: "remote",
  needs: ["key"],
  takesTools: true,
  customaryAddress: null,
  keyHint: "sk-…4f2",
  address: null,
};

const local: ProviderState = {
  id: "ollama",
  name: "Ollama",
  kind: "local",
  needs: ["address"],
  takesTools: true,
  customaryAddress: "http://localhost:11434",
  keyHint: null,
  address: null,
};

function values(patch: Partial<ModelFormValues> = {}): ModelFormValues {
  return {
    title: "deepseek-v4-flash",
    provider: "openrouter",
    contextCeiling: "700000",
    answerCeiling: "4096",
    inputPrice: "3",
    outputPrice: "15",
    ...patch,
  };
}

function acts() {
  return {
    onChange: vi.fn(),
    onSave: vi.fn(async () => {}),
    onCancel: vi.fn(),
  };
}

describe("ModelForm", () => {
  it("says how to write the name, and says it differently for each kind of provider", () => {
    // A name is the provider's word for the model, so the note follows the provider.
    const { rerender } = render(
      <ModelForm
        providers={[remote, local]}
        values={values({
          provider: "",
        })}
        saved={null}
        isNew
        isMending={false}
        {...acts()}
      />,
    );

    expect(screen.getByText(MODEL_NAME_NOTE_UNCHOSEN)).toBeInTheDocument();

    rerender(
      <ModelForm
        providers={[remote, local]}
        values={values({
          provider: "ollama",
        })}
        saved={null}
        isNew
        isMending={false}
        {...acts()}
      />,
    );

    expect(screen.getByText(MODEL_NAME_NOTE_LOCAL)).toBeInTheDocument();

    rerender(
      <ModelForm providers={[remote, local]} values={values()} saved={null} isNew isMending={false} {...acts()} />,
    );

    expect(
      screen.getByText(MODEL_NAME_NOTE_PREFIX, {
        exact: false,
      }),
    ).toBeInTheDocument();
  });

  it("does not save with a field still empty, and marks it instead", async () => {
    const said = acts();

    render(
      <ModelForm
        providers={[remote]}
        values={values({
          title: "",
        })}
        saved={null}
        isNew
        isMending={false}
        {...said}
      />,
    );
    await userEvent.click(screen.getByText(MODELS_PANEL_CREATE_LABEL));

    expect(said.onSave).not.toHaveBeenCalled();
  });

  it("saves once every field is written", async () => {
    const said = acts();

    render(<ModelForm providers={[remote]} values={values()} saved={null} isNew isMending={false} {...said} />);
    await userEvent.click(screen.getByText(MODELS_PANEL_CREATE_LABEL));

    expect(said.onSave).toHaveBeenCalledOnce();
  });

  it("says under a field what it was, and only where the draft has moved it", () => {
    // The form holds a draft; each moved field says what a save would replace.
    render(
      <ModelForm
        providers={[remote]}
        values={values({
          inputPrice: "4",
        })}
        saved={values()}
        isNew={false}
        isMending={false}
        {...acts()}
      />,
    );

    expect(screen.getByText(`${FIELD_SLOT_WAS_PREFIX}3`)).toBeInTheDocument();
    expect(
      screen.getAllByText(FIELD_SLOT_WAS_PREFIX, {
        exact: false,
      }),
    ).toHaveLength(1);
  });

  it("gives every keystroke up as it is typed, the draft living outside the form", async () => {
    const said = acts();

    render(<ModelForm providers={[remote]} values={values()} saved={null} isNew isMending={false} {...said} />);
    await userEvent.type(screen.getByLabelText(MODELS_PANEL_TITLE_FIELD_LABEL), "x");

    expect(said.onChange).toHaveBeenCalledWith({
      title: "deepseek-v4-flashx",
    });
  });

  it("goes back without saving", async () => {
    const said = acts();

    render(<ModelForm providers={[remote]} values={values()} saved={null} isNew isMending={false} {...said} />);
    await userEvent.click(screen.getByText(MODELS_PANEL_CANCEL_LABEL));

    expect(said.onCancel).toHaveBeenCalledOnce();
    expect(said.onSave).not.toHaveBeenCalled();
  });
});
