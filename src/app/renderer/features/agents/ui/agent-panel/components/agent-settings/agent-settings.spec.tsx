import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AgentSettings } from "./agent-settings";
import type { AgentSettingsProps } from "./interfaces";
import type { AgentCatalogue, AgentPanelActs, AgentPresses, AgentStanding, AgentWriting } from "../../../../interfaces";
import {
  AGENT_SETTINGS_COLOR_LABEL,
  AGENT_SETTINGS_DELETE_LABEL,
  AGENT_SETTINGS_NAME_LABEL,
  AGENT_SETTINGS_REVERT_LABEL,
  AGENT_SETTINGS_SAVE_LABEL,
  AGENT_SETTINGS_SWITCH_LABEL,
  AGENT_SETTINGS_TEMPERATURE_HINT,
  AGENT_SETTINGS_TEMPERATURE_LABEL,
} from "./constants";
import { SUPPLIERS_LABEL, SUPPLIER_OFF_LABEL } from "./components/suppliers-list/constants";
import { TOOLS_SECTION_CHOOSE_LABEL } from "./components/tools-section/constants";
import { AGENT_LOST_MODEL_NAME, AGENT_LOST_PROMPT_NAME } from "../../../../constants";
import { PROMPT_PICKER_NONE_LABEL } from "../prompt-picker/constants";
import { LOST_PROMPT_REMOVE_LABEL } from "./components/lost-prompt";
import { AGENT_COLORS } from "../../../../constants";
import { STEPPER_MORE_LABEL } from "../../../../../../components/stepper/constants";
import { MODEL_PICKER_PLACEHOLDER } from "../model-picker/constants";
import { LOST_PROVIDER_SUFFIX } from "../../../../../../constants";
import { FIELD_SLOT_WAS_PREFIX } from "../../../../../../components/field-slot/constants";
import type { Agent, ProjectCommand, ProjectModel, ProjectPrompt, ProviderState } from "../../../../../../interfaces";
import type { AgentDraft } from "../../../../interfaces";
import { aCommand, aDraft, aModel, aPrompt, anAgent } from "../../../../../../testing";

const MODELS: ProjectModel[] = [
  aModel({
    title: "claude-sonnet-4.5",
    provider: "anthropic",
    contextCeiling: 200000,
  }),
];

const PROMPTS: ProjectPrompt[] = [
  aPrompt({
    name: "Правки коду",
    file: "prompts/pravky-kodu.md",
    text: "Ти працюєш у наявному репозиторії.",
  }),
];

const PROVIDERS: ProviderState[] = [
  {
    id: "anthropic",
    name: "Anthropic",
    kind: "remote",
    address: "",
    customaryAddress: "",
    keyHint: "sk-…4f2a",
  },
];

const AGENTS: Agent[] = [
  anAgent({
    name: "EDITOR",
    color: AGENT_COLORS[0],
    x: 0,
    y: 0,
    maxCalls: 10,
    temperature: 0.3,
  }),
];

const SUPPLIERS: Agent[] = [
  {
    ...AGENTS[0],
    id: "agent-2",
    name: "TESTER",
  },
  {
    ...AGENTS[0],
    id: "agent-3",
    name: "LINTER",
  },
];

const COMMANDS: ProjectCommand[] = [
  aCommand({
    name: "run_tests",
    description: "Прогнати тести проєкту",
    run: "npm test",
  }),
];

const DRAFT: AgentDraft = aDraft({
  name: "EDITOR",
  color: AGENT_COLORS[0],
  maxCalls: 10,
  temperature: 0.3,
});

/** The same draft holding one grant, for what only happens once a grant can be opened. */
const GRANTED: AgentDraft = {
  ...DRAFT,
  tools: [
    {
      id: "grant-1",
      source: "command",
      commandId: "command-1",
      pinned: [],
    },
  ],
};

/** The spec stands in for the panel, which owns which grant is open. */
function Standing(props: Omit<AgentSettingsProps, "openGrantId" | "onOpenGrantChange">) {
  const [openGrantId, setOpenGrantId] = useState<string | null>(null);

  return <AgentSettings {...props} openGrantId={openGrantId} onOpenGrantChange={setOpenGrantId} />;
}

/** What one case changes, part by part; everything it leaves out stands as this fixture sets it. */
interface SettingsOverrides {
  draft?: AgentDraft;
  catalogue?: Partial<AgentCatalogue>;
  writing?: Partial<AgentWriting>;
  standing?: Partial<AgentStanding>;
  presses?: Partial<AgentPresses>;
  acts?: Partial<AgentPanelActs>;
}

function renderSettings(overrides: SettingsOverrides = {}) {
  return render(
    <Standing
      draft={overrides.draft ?? DRAFT}
      catalogue={{
        models: MODELS,
        providers: PROVIDERS,
        prompts: PROMPTS,
        commands: COMMANDS,
        servers: [],
        looks: {},
        agents: AGENTS,
        ...overrides.catalogue,
      }}
      writing={{
        draft: overrides.draft ?? DRAFT,
        saved: DRAFT,
        isCreating: false,
        isNaming: false,
        isDirty: false,
        isNameTaken: false,
        ...overrides.writing,
      }}
      standing={{
        state: {
          label: "",
          color: "",
          mark: "dot",
          at: null,
        },
        startedAt: null,
        suppliers: [],
        ...overrides.standing,
      }}
      presses={{
        mending: null,
        tools: null,
        agent: null,
        ...overrides.presses,
      }}
      acts={{
        onCreate: async () => {},
        onCancel: () => {},
        onDraftChange: () => {},
        onRevert: () => {},
        onSave: async () => {},
        onDelete: () => {},
        ...overrides.acts,
      }}
    />,
  );
}

describe("AgentSettings", () => {
  it("opens on «+» of the first empty number when a card sent the person to mend it", () => {
    renderSettings({
      draft: {
        ...DRAFT,
        temperature: null,
      },
      presses: {
        mending: "number",
      },
    });

    // The card named the temperature, and «+» — the way out of an empty row — already holds focus.
    expect(
      screen.getByRole("button", {
        name: "Температура: +",
      }),
    ).toHaveFocus();
  });

  it("opens on the prompt field when a card said the prompt is gone", () => {
    renderSettings({
      presses: {
        mending: "prompt",
      },
    });

    // The file is gone and is not restored; the cursor stands on the field that still names it.
    expect(
      screen.getByRole("button", {
        name: new RegExp(PROMPT_PICKER_NONE_LABEL),
      }),
    ).toHaveFocus();
  });

  it("opens on the grants when a card said a granted function is gone", () => {
    renderSettings({
      presses: {
        mending: "grants",
      },
    });

    expect(
      screen.getByRole("button", {
        name: new RegExp(TOOLS_SECTION_CHOOSE_LABEL),
      }),
    ).toHaveFocus();
  });

  it("takes no field on its own when the tab was opened by hand", () => {
    renderSettings({
      presses: {
        mending: null,
      },
    });

    expect(
      screen.getByRole("button", {
        name: new RegExp(TOOLS_SECTION_CHOOSE_LABEL),
      }),
    ).not.toHaveFocus();
  });

  it("takes no row on its own when the tab was opened by hand", () => {
    renderSettings({
      draft: {
        ...DRAFT,
        temperature: null,
      },
    });

    expect(
      screen.getByRole("button", {
        name: "Температура: +",
      }),
    ).not.toHaveFocus();
  });

  it("says the prompt is gone rather than reading as a promptless agent", () => {
    renderSettings({
      draft: {
        ...DRAFT,
        promptId: "prompt-gone",
      },
    });

    // «без промпта» is a person's choice, and a tie left without its file is not that.
    expect(screen.queryByText(PROMPT_PICKER_NONE_LABEL)).not.toBeInTheDocument();
    expect(screen.getAllByText(AGENT_LOST_PROMPT_NAME).length).toBeGreaterThan(0);
    expect(
      screen.getByRole("button", {
        name: LOST_PROMPT_REMOVE_LABEL,
      }),
    ).toBeInTheDocument();
  });

  it("takes the broken tie off the agent, and puts no prompt back in its place", async () => {
    const onDraftChange = vi.fn();
    const user = userEvent.setup();

    renderSettings({
      acts: {
        onDraftChange,
      },
      draft: {
        ...DRAFT,
        promptId: "prompt-gone",
      },
    });

    await user.click(
      screen.getByRole("button", {
        name: LOST_PROMPT_REMOVE_LABEL,
      }),
    );

    // What is gone is not restored: the tie simply goes.
    expect(onDraftChange).toHaveBeenCalledWith({
      promptId: null,
    });
  });

  it("leaves the prompt field itself empty: the word for a broken tie stands once, under it", () => {
    renderSettings({
      draft: {
        ...DRAFT,
        promptId: "prompt-gone",
      },
    });

    expect(screen.getAllByText(AGENT_LOST_PROMPT_NAME)).toHaveLength(1);
  });

  it("says the model is gone rather than reading as a model never chosen", () => {
    renderSettings({
      draft: {
        ...DRAFT,
        modelId: "model-gone",
      },
    });

    // The way out is choosing another model, so the group offers no act of its own.
    expect(screen.getAllByText(AGENT_LOST_MODEL_NAME)).toHaveLength(1);
    expect(screen.queryByText(MODEL_PICKER_PLACEHOLDER)).not.toBeInTheDocument();
  });

  it("names the provider under the model field where nobody declared it", () => {
    renderSettings({
      catalogue: {
        providers: [],
      },
    });

    // The model itself is whole, so its name stands; the trouble is the provider under it.
    expect(screen.getByText(`anthropic${LOST_PROVIDER_SUFFIX}`)).toBeInTheDocument();
    expect(screen.getByText(MODELS[0].title)).toBeInTheDocument();
  });

  it("says nothing under the field where the provider is declared", () => {
    renderSettings();

    expect(screen.queryByText(`anthropic${LOST_PROVIDER_SUFFIX}`)).not.toBeInTheDocument();
  });

  it("says nothing is broken where the model is held", () => {
    renderSettings();

    expect(screen.queryByText(AGENT_LOST_MODEL_NAME)).not.toBeInTheDocument();
  });

  it("says nothing is broken where the prompt is held", () => {
    renderSettings({
      draft: {
        ...DRAFT,
        promptId: "prompt-1",
      },
    });

    expect(screen.queryByText(AGENT_LOST_PROMPT_NAME)).not.toBeInTheDocument();
  });

  it("does not write a sphere with no name: the press marks the field instead", async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();

    renderSettings({
      acts: {
        onSave,
      },
      draft: {
        ...DRAFT,
        name: "",
      },
      writing: {
        isDirty: true,
      },
    });
    await user.click(screen.getByText(AGENT_SETTINGS_SAVE_LABEL));

    expect(onSave).not.toHaveBeenCalled();
  });

  it("names the agent in the one field that writes its name", () => {
    renderSettings();

    expect(screen.getAllByDisplayValue("EDITOR")).toHaveLength(1);
  });

  it("reports a rename keystroke by keystroke, writing nothing itself", async () => {
    const onDraftChange = vi.fn();
    const onSave = vi.fn();

    renderSettings({
      acts: {
        onDraftChange,
        onSave,
      },
    });
    await userEvent.type(screen.getByLabelText(AGENT_SETTINGS_NAME_LABEL), "!");

    expect(onDraftChange).toHaveBeenCalledWith({
      name: "EDITOR!",
    });
    expect(onSave).not.toHaveBeenCalled();
  });

  it("offers the five colours and puts the one picked into the draft, like every other field", async () => {
    const onDraftChange = vi.fn();
    const onSave = vi.fn();

    renderSettings({
      acts: {
        onDraftChange,
        onSave,
      },
    });

    expect(screen.getByText(AGENT_SETTINGS_COLOR_LABEL)).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", {
        name: AGENT_COLORS[2],
      }),
    );

    expect(onDraftChange).toHaveBeenCalledWith({
      color: AGENT_COLORS[2],
    });
    expect(onSave).not.toHaveBeenCalled();
  });

  it("marks the colour the agent already wears as the chosen one", () => {
    renderSettings();

    expect(
      screen.getByRole("button", {
        name: AGENT_COLORS[0],
      }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("puts the switch into the draft rather than writing it", async () => {
    const onDraftChange = vi.fn();

    renderSettings({
      acts: {
        onDraftChange,
      },
    });
    await userEvent.click(
      screen.getByRole("switch", {
        name: AGENT_SETTINGS_SWITCH_LABEL,
      }),
    );

    expect(onDraftChange).toHaveBeenCalledWith({
      isActive: false,
    });
  });

  it("puts «Скасувати» where «Видалити» stands once something has moved", async () => {
    const onRevert = vi.fn();
    const onDelete = vi.fn();

    renderSettings({
      acts: {
        onRevert,
        onDelete,
      },
      writing: {
        isDirty: true,
      },
    });

    expect(screen.queryByText(AGENT_SETTINGS_DELETE_LABEL)).not.toBeInTheDocument();

    await userEvent.click(screen.getByText(AGENT_SETTINGS_REVERT_LABEL));

    expect(onRevert).toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("carries the save and the deletion question as its two acts", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onDelete = vi.fn();

    renderSettings({
      acts: {
        onSave,
        onDelete,
      },
    });
    await userEvent.click(screen.getByText(AGENT_SETTINGS_SAVE_LABEL));
    await userEvent.click(screen.getByText(AGENT_SETTINGS_DELETE_LABEL));

    expect(onSave).toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalled();
  });
  it("marks a field the draft has moved with what stood in it, and leaves the still ones bare", () => {
    renderSettings({
      draft: {
        ...DRAFT,
        name: "EDITOR ROOM",
      },
      writing: {
        isDirty: true,
      },
    });

    expect(screen.getByText(`${FIELD_SLOT_WAS_PREFIX}EDITOR`)).toBeInTheDocument();
    // Only the name moved, so it is the only field carrying the line.
    expect(screen.getAllByText(new RegExp(FIELD_SLOT_WAS_PREFIX))).toHaveLength(1);
  });

  it("says nothing about what was while the draft stands where the save left it", () => {
    renderSettings();

    expect(screen.queryByText(new RegExp(FIELD_SLOT_WAS_PREFIX))).not.toBeInTheDocument();
  });
  it("names who this agent's work can come from, and how many of them there are", () => {
    renderSettings({
      standing: {
        suppliers: SUPPLIERS,
      },
    });

    expect(screen.getByText(`${SUPPLIERS_LABEL} · 2`)).toBeInTheDocument();
    expect(screen.getByText("TESTER")).toBeInTheDocument();
    expect(screen.getByText("LINTER")).toBeInTheDocument();
  });

  it("does not count a switched-off supplier, though it keeps its place in the list", () => {
    renderSettings({
      standing: {
        suppliers: [
          SUPPLIERS[0],
          {
            ...SUPPLIERS[1],
            isActive: false,
          },
        ],
      },
    });

    // The counter keeps both numbers.
    expect(screen.getByText(`${SUPPLIERS_LABEL} · 1 / 2`)).toBeInTheDocument();
    expect(screen.getByText(SUPPLIER_OFF_LABEL)).toBeInTheDocument();
  });

  it("says nothing about suppliers where no line comes in at all", () => {
    renderSettings();

    expect(screen.queryByText(new RegExp(SUPPLIERS_LABEL))).not.toBeInTheDocument();
  });

  it("puts the caret in the name of a copy just put down, with the text already chosen", () => {
    renderSettings({
      writing: {
        isNaming: true,
      },
    });

    const name = screen.getByLabelText(AGENT_SETTINGS_NAME_LABEL) as HTMLInputElement;

    // A copy arrives named «EDITOR 2», so the text is chosen and typing replaces it.
    expect(name).toHaveFocus();
    expect(name.selectionStart).toBe(0);
    expect(name.selectionEnd).toBe(name.value.length);
  });

  it("leaves the name alone while nothing was just pasted", () => {
    renderSettings();

    expect(screen.getByLabelText(AGENT_SETTINGS_NAME_LABEL)).not.toHaveFocus();
  });

  it("leaves a grant's own step on Escape, keeping what was changed in it", async () => {
    const user = userEvent.setup();

    renderSettings({
      draft: GRANTED,
      writing: {
        saved: GRANTED,
      },
    });
    await user.click(screen.getByLabelText(/Відкрити видачу run_tests/));

    // The step takes the whole panel: the fields below are not there while it stands.
    expect(screen.queryByLabelText(AGENT_SETTINGS_NAME_LABEL)).not.toBeInTheDocument();

    await user.keyboard("{Escape}");

    // The step is a floor above the panel, so the key belongs to it.
    expect(await screen.findByLabelText(AGENT_SETTINGS_NAME_LABEL)).toBeInTheDocument();
    expect(screen.getByLabelText(/Відкрити видачу run_tests/)).toBeInTheDocument();
  });

  it("puts the temperature into the draft by a tenth, and says in words what its ends mean", async () => {
    const onDraftChange = vi.fn();

    renderSettings({
      acts: {
        onDraftChange,
      },
    });

    expect(screen.getByText("0.3")).toBeInTheDocument();
    expect(screen.getByText(AGENT_SETTINGS_TEMPERATURE_HINT)).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", {
        name: `${AGENT_SETTINGS_TEMPERATURE_LABEL}: ${STEPPER_MORE_LABEL}`,
      }),
    );

    // A run of tenths is not exact: the stepper rounds, so the draft is given 0.4 and not 0.30000000000000004.
    expect(onDraftChange).toHaveBeenCalledWith({
      temperature: 0.4,
    });
  });

  it("says what temperature stood in the agent once the draft has moved it", () => {
    renderSettings({
      draft: {
        ...DRAFT,
        temperature: 0.7,
      },
    });

    // A moved field says what stood in it, written to the same one place.
    expect(screen.getByText(`${FIELD_SLOT_WAS_PREFIX}0.3`)).toBeInTheDocument();
  });
});
