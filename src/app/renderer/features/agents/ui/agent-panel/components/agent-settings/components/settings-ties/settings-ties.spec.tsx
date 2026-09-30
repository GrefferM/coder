import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SettingsTies } from "./settings-ties";
import { AGENT_SETTINGS_COLOR_LABEL, AGENT_SETTINGS_MODEL_LABEL, AGENT_SETTINGS_PROMPT_LABEL } from "../../constants";
import { LOST_MODEL_NOTE } from "../lost-model/constants";
import { LOST_PROMPT_NOTE } from "../lost-prompt/constants";
import { FIELD_SLOT_WAS_PREFIX } from "../../../../../../../../components/field-slot/constants";
import type { AgentDraft, WasAgent } from "../../../../../../interfaces";
import type { SettingsTiesProps } from "./interfaces";
import { aDraft, aModel, aPrompt } from "../../../../../../../../testing";

const draft: AgentDraft = aDraft({
  promptId: "prompt-1",
  temperature: 0.3,
});

const nothingMoved: WasAgent = {
  name: null,
  purpose: null,
  model: null,
  prompt: null,
  commandTools: null,
  serverTools: null,
  agentTools: null,
  color: null,
  maxCalls: null,
  temperature: null,
  isActive: null,
  waitsForAll: null,
};

function props(patch: Partial<SettingsTiesProps> = {}): SettingsTiesProps {
  return {
    draft,
    was: nothingMoved,
    models: [aModel()],
    prompts: [
      aPrompt({
        name: "Пошуковий",
        file: "prompts/seeker.md",
        text: "Ти шукаєш файли.",
      }),
    ],
    agents: [],
    isModelGone: false,
    isPromptGone: false,
    goneProviderId: null,
    mendedField: undefined,
    onDraftChange: () => {},
    ...patch,
  };
}

describe("SettingsTies", () => {
  it("stands the three things an agent is tied to, each named", () => {
    render(<SettingsTies {...props()} />);

    expect(screen.getByText(AGENT_SETTINGS_MODEL_LABEL)).toBeInTheDocument();
    expect(screen.getByText(AGENT_SETTINGS_PROMPT_LABEL)).toBeInTheDocument();
    expect(screen.getByText(AGENT_SETTINGS_COLOR_LABEL)).toBeInTheDocument();
  });

  it("shows a broken tie under the field it belongs to, and only where it is broken", () => {
    // The tie shows on the field where it is mended, not in a separate note.
    const { rerender } = render(<SettingsTies {...props()} />);

    expect(screen.queryByText(LOST_MODEL_NOTE)).not.toBeInTheDocument();
    expect(screen.queryByText(LOST_PROMPT_NOTE)).not.toBeInTheDocument();

    rerender(
      <SettingsTies
        {...props({
          isModelGone: true,
        })}
      />,
    );

    expect(screen.getByText(LOST_MODEL_NOTE)).toBeInTheDocument();
    expect(screen.queryByText(LOST_PROMPT_NOTE)).not.toBeInTheDocument();

    rerender(
      <SettingsTies
        {...props({
          isPromptGone: true,
        })}
      />,
    );

    expect(screen.getByText(LOST_PROMPT_NOTE)).toBeInTheDocument();
    expect(screen.queryByText(LOST_MODEL_NOTE)).not.toBeInTheDocument();
  });

  it("says under each field what it was, where the draft has moved it", () => {
    // Each of the three shows its own «було»; an untouched one shows none.
    render(
      <SettingsTies
        {...props({
          was: {
            ...nothingMoved,
            prompt: "Загальний",
          },
        })}
      />,
    );

    expect(screen.getByText(`${FIELD_SLOT_WAS_PREFIX}Загальний`)).toBeInTheDocument();
    expect(
      screen.getAllByText(FIELD_SLOT_WAS_PREFIX, {
        exact: false,
      }),
    ).toHaveLength(1);
  });
});
