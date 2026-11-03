import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ModelsPanel } from "./models-panel";
import { modelFormValues } from "../../logic";
import type { ModelFormValues } from "../../interfaces";
import type { ProviderState, Agent, ProjectModel } from "../../../../interfaces";
import {
  MODELS_PANEL_CREATE_LABEL,
  MODELS_PANEL_ANSWER_CEILING_FIELD_LABEL,
  MODELS_PANEL_CEILING_FIELD_LABEL,
  MODELS_PANEL_EMPTY_LABEL,
  MODELS_PANEL_INPUT_PRICE_FIELD_LABEL,
  MODELS_PANEL_NEW_LABEL,
  MODELS_PANEL_OUTPUT_PRICE_FIELD_LABEL,
  MODELS_PANEL_SAVE_LABEL,
  MODELS_PANEL_SEARCH_EMPTY_LABEL,
  MODELS_PANEL_SEARCH_PLACEHOLDER,
  MODELS_PANEL_TITLE_FIELD_LABEL,
} from "./constants";
import {
  MODEL_ROW_DELETE_LABEL,
  MODEL_ROW_EDIT_LABEL,
  MODEL_ROW_PROVIDER_LABEL,
} from "./components/model-row/constants";
import { PROVIDER_PICKER_PLACEHOLDER } from "./components/model-form/components/provider-picker/constants";
import { FIELD_SLOT_WAS_PREFIX } from "../../../../components/field-slot/constants";
import { aModel, anAgent } from "../../../../testing";

const MODELS: ProjectModel[] = [
  aModel({
    title: "claude-sonnet-4.5",
    provider: "anthropic",
    contextCeiling: 200000,
  }),
  aModel({
    id: "model-2",
    title: "gpt-5.1-codex",
    provider: "openai",
    inputPrice: 1,
    outputPrice: 5,
    contextCeiling: 200000,
  }),
];

const UNFILLED: ProjectModel = aModel({
  id: "model-3",
  title: "qwen2.5-coder",
  provider: "ollama",
  inputPrice: 0,
  outputPrice: 0,
  contextCeiling: 4096,
  answerCeiling: null,
});

const AGENTS: Agent[] = [
  anAgent({
    name: "EDITOR",
    color: "#38a3ff",
    x: 0,
    y: 0,
    maxCalls: 10,
    temperature: 0.3,
  }),
];

/** The known providers, as the machine hands them to the section. */
const PROVIDERS: ProviderState[] = [
  {
    id: "anthropic",
    name: "Anthropic",
    kind: "remote",
    needs: ["key"],
    takesTools: true,
    customaryAddress: null,
    keyHint: null,
    address: null,
    isOff: false,
  },
  {
    id: "ollama",
    name: "Ollama",
    kind: "local",
    needs: ["address"],
    takesTools: true,
    customaryAddress: "http://localhost:11434",
    keyHint: null,
    address: null,
    isOff: false,
  },
];

/** Stands in for the section that holds the panel's form draft. */
function PanelHarness({
  openModelId = null,
  isMending = false,
  onSaveForm = async () => {},
  onCancelForm = () => {},
  ...overrides
}: Partial<Omit<Parameters<typeof ModelsPanel>[0], "onSaveForm">> & {
  onSaveForm?: (values: ModelFormValues) => Promise<void>;
}) {
  const [openId, setOpenId] = useState<string | "new" | null>(openModelId);
  const [values, setValues] = useState(
    modelFormValues([...MODELS, UNFILLED].find((model) => model.id === openId) ?? null),
  );

  return (
    <ModelsPanel
      providers={PROVIDERS}
      providerAnswers={{}}
      saved={modelFormValues([...MODELS, UNFILLED].find((model) => model.id === openId) ?? null)}
      isMending={isMending}
      models={[...MODELS, UNFILLED]}
      agents={AGENTS}
      openModelId={openId}
      form={openId === null ? null : values}
      onOpenForm={(modelId) => {
        setOpenId(modelId);
        setValues(modelFormValues([...MODELS, UNFILLED].find((model) => model.id === modelId) ?? null));
      }}
      onFormChange={(patch) =>
        setValues((current) => ({
          ...current,
          ...patch,
        }))
      }
      onSaveForm={() => onSaveForm(values)}
      onCancelForm={() => {
        setOpenId(null);
        onCancelForm();
      }}
      onArmedModelIdChange={() => {}}
      {...overrides}
    />
  );
}

function renderPanel(overrides: Partial<Parameters<typeof PanelHarness>[0]> = {}) {
  return render(<PanelHarness {...overrides} />);
}

describe("ModelsPanel", () => {
  it("opens the form on the first empty number when a card sent the person to mend it", () => {
    renderPanel({
      openModelId: "model-3",
      isMending: true,
    });

    // The card named the answer ceiling, and the cursor is in that row.
    expect(screen.getByLabelText(MODELS_PANEL_ANSWER_CEILING_FIELD_LABEL)).toHaveFocus();
  });

  it("takes no row on its own when the form was opened by hand", () => {
    renderPanel({
      openModelId: "model-3",
    });

    expect(screen.getByLabelText(MODELS_PANEL_ANSWER_CEILING_FIELD_LABEL)).not.toHaveFocus();
  });

  it("lists each model with its prices and how many agents run on it", () => {
    renderPanel();

    expect(screen.getByText(MODELS[0].title)).toBeInTheDocument();
    expect(screen.getByText("$3.00 · $15.00 / 1M · 1 АГЕНТ")).toBeInTheDocument();
    expect(screen.getByText("$1.00 · $5.00 / 1M · БЕЗ АГЕНТІВ")).toBeInTheDocument();
  });

  it("narrows the list to what the search matches", async () => {
    renderPanel();

    await userEvent.type(screen.getByPlaceholderText(MODELS_PANEL_SEARCH_PLACEHOLDER), "codex");

    expect(screen.getByText(MODELS[1].title)).toBeInTheDocument();
    expect(screen.queryByText(MODELS[0].title)).not.toBeInTheDocument();

    await userEvent.type(screen.getByPlaceholderText(MODELS_PANEL_SEARCH_PLACEHOLDER), "zzz");

    expect(screen.getByText(MODELS_PANEL_SEARCH_EMPTY_LABEL)).toBeInTheDocument();
  });

  it("opens the row that was clicked, and only that row carries what can be done to it", async () => {
    const onOpenForm = vi.fn();

    renderPanel({
      onOpenForm,
    });

    expect(screen.queryByText(MODEL_ROW_EDIT_LABEL)).not.toBeInTheDocument();

    await userEvent.click(screen.getByText(MODELS[1].title));

    expect(screen.getAllByText(MODEL_ROW_EDIT_LABEL)).toHaveLength(1);

    await userEvent.click(screen.getByText(MODEL_ROW_EDIT_LABEL));

    expect(onOpenForm).toHaveBeenCalledWith("model-2");
  });

  it("says the open row in full — the provider, the prices in words, and who runs on it", async () => {
    renderPanel();
    await userEvent.click(screen.getByText(MODELS[0].title));

    expect(screen.getByText(`${MODEL_ROW_PROVIDER_LABEL} · anthropic`)).toBeInTheDocument();
    expect(screen.getByText("$3.00 вхід · $15.00 вихід / 1M")).toBeInTheDocument();
    expect(screen.getByText(AGENTS[0].name)).toBeInTheDocument();
    expect(screen.queryByText("$3.00 · $15.00 / 1M · 1 АГЕНТ")).not.toBeInTheDocument();
  });

  it("writes a new model from the footer's own step, with the list out of the way", async () => {
    const onSaveForm = vi.fn().mockResolvedValue(undefined);

    renderPanel({
      onSaveForm,
    });
    await userEvent.click(screen.getByText(MODELS_PANEL_NEW_LABEL));

    expect(screen.queryByText(MODELS[0].title)).not.toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(MODELS_PANEL_TITLE_FIELD_LABEL), "claude-opus-4.1");
    // The provider is chosen from the known list, not typed.
    await userEvent.click(screen.getByText(PROVIDER_PICKER_PLACEHOLDER));
    await userEvent.click(screen.getByText("Anthropic"));
    // Both ceilings are the person's own; nothing is written until both are set.
    await userEvent.type(screen.getByLabelText(MODELS_PANEL_CEILING_FIELD_LABEL), "200000");
    await userEvent.type(screen.getByLabelText(MODELS_PANEL_ANSWER_CEILING_FIELD_LABEL), "4096");
    await userEvent.type(screen.getByLabelText(MODELS_PANEL_INPUT_PRICE_FIELD_LABEL), "15");
    await userEvent.type(screen.getByLabelText(MODELS_PANEL_OUTPUT_PRICE_FIELD_LABEL), "75");
    await userEvent.click(screen.getByText(MODELS_PANEL_CREATE_LABEL));

    expect(onSaveForm).toHaveBeenCalledWith({
      title: "claude-opus-4.1",
      provider: "anthropic",
      contextCeiling: "200000",
      answerCeiling: "4096",
      inputPrice: "15",
      outputPrice: "75",
    });
  });

  it("opens a new model with both ceilings empty, since neither number is anybody's but the person's", async () => {
    renderPanel();
    await userEvent.click(screen.getByText(MODELS_PANEL_NEW_LABEL));

    // No provider is asked and nothing is guessed, so no number to open on.
    expect(screen.getByLabelText(MODELS_PANEL_CEILING_FIELD_LABEL)).toHaveValue(null);
    expect(screen.getByLabelText(MODELS_PANEL_ANSWER_CEILING_FIELD_LABEL)).toHaveValue(null);
  });

  it("marks the fields the draft moved, and leaves the still ones bare", async () => {
    renderPanel({
      openModelId: "model-1",
    });

    // Nothing has moved yet, so the form wears none of the marks.
    expect(screen.queryByText(new RegExp(FIELD_SLOT_WAS_PREFIX, "i"))).not.toBeInTheDocument();

    await userEvent.clear(screen.getByLabelText(MODELS_PANEL_TITLE_FIELD_LABEL));
    await userEvent.type(screen.getByLabelText(MODELS_PANEL_TITLE_FIELD_LABEL), "claude-opus-4.1");

    expect(screen.getByText(`${FIELD_SLOT_WAS_PREFIX}${MODELS[0].title}`)).toBeInTheDocument();
  });

  it("says what the provider was in the words the field itself uses", async () => {
    renderPanel({
      openModelId: "model-1",
    });

    await userEvent.click(screen.getByText("Anthropic"));
    await userEvent.click(screen.getByText("Ollama"));

    // The file carries «anthropic»; the person reads «Anthropic», and so does the line under it.
    expect(screen.getByText(`${FIELD_SLOT_WAS_PREFIX}Anthropic`)).toBeInTheDocument();
  });

  it("opens a model on its own values and writes them back", async () => {
    const onSaveForm = vi.fn().mockResolvedValue(undefined);

    renderPanel({
      openModelId: "model-1",
      onSaveForm,
    });

    expect(screen.getByLabelText(MODELS_PANEL_TITLE_FIELD_LABEL)).toHaveValue(MODELS[0].title);
    expect(screen.getByLabelText(MODELS_PANEL_INPUT_PRICE_FIELD_LABEL)).toHaveValue(3);

    await userEvent.clear(screen.getByLabelText(MODELS_PANEL_OUTPUT_PRICE_FIELD_LABEL));
    await userEvent.type(screen.getByLabelText(MODELS_PANEL_OUTPUT_PRICE_FIELD_LABEL), "18");
    await userEvent.click(screen.getByText(MODELS_PANEL_SAVE_LABEL));

    expect(onSaveForm).toHaveBeenCalledWith({
      title: MODELS[0].title,
      provider: MODELS[0].provider,
      contextCeiling: "200000",
      answerCeiling: "4096",
      inputPrice: "3",
      outputPrice: "18",
    });
  });

  it("puts the open model's deletion up for the page to ask about", async () => {
    const onArmedModelIdChange = vi.fn();

    renderPanel({
      onArmedModelIdChange,
    });
    await userEvent.click(screen.getByText(MODELS[0].title));
    await userEvent.click(screen.getByText(MODEL_ROW_DELETE_LABEL));

    expect(onArmedModelIdChange).toHaveBeenCalledWith("model-1");
  });

  it("lifts the one action into the middle when the catalogue is empty", async () => {
    renderPanel({
      models: [],
    });

    expect(screen.getByText(MODELS_PANEL_EMPTY_LABEL)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(MODELS_PANEL_SEARCH_PLACEHOLDER)).not.toBeInTheDocument();
    expect(screen.getAllByText(MODELS_PANEL_NEW_LABEL)).toHaveLength(1);

    await userEvent.click(screen.getByText(MODELS_PANEL_NEW_LABEL));

    expect(screen.getByLabelText(MODELS_PANEL_TITLE_FIELD_LABEL)).toBeInTheDocument();
  });

  it("marks a model whose provider this build does not know, in the row and not only in the form", async () => {
    renderPanel({
      models: [
        {
          ...MODELS[0],
          provider: "ollama-old",
        },
      ],
    });
    await userEvent.click(screen.getByText(MODELS[0].title));

    expect(screen.getByText(/ollama-old · провайдера немає/)).toBeInTheDocument();
  });

  it("marks a model the machine no longer holds, though the project still declares it", async () => {
    renderPanel({
      models: [
        {
          ...MODELS[0],
          title: "qwen2.5-coder:0.5b",
          provider: "ollama",
        },
      ],
      providerAnswers: {
        ollama: {
          isAnswering: true,
          models: [
            {
              name: "qwen2.5-coder:1.5b",
              sizeBytes: null,
            },
          ],
          askedAt: new Date(2026, 7, 19, 14, 26),
        },
      },
    });

    // The closed row says it.
    expect(screen.getByText(/немає на машині/)).toBeInTheDocument();

    await userEvent.click(screen.getByText("qwen2.5-coder:0.5b"));

    expect(screen.getByText(/ollama · немає на машині/)).toBeInTheDocument();
  });

  it("says under the name how the chosen provider writes one, since the name goes out as it stands", async () => {
    renderPanel({
      openModelId: "model-1",
    });

    expect(screen.getByText(/claude-sonnet-4-5/)).toBeInTheDocument();
  });
});
