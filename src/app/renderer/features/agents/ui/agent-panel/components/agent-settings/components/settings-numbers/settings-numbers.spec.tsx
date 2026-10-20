import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SettingsNumbers } from "./settings-numbers";
import {
  AGENT_SETTINGS_MAX_CALLS_LABEL,
  AGENT_SETTINGS_SWITCH_LABEL,
  AGENT_SETTINGS_TEMPERATURE_HINT,
  AGENT_SETTINGS_TEMPERATURE_LABEL,
} from "../../constants";
import { STEPPER_MORE_LABEL } from "../../../../../../../../components/stepper/constants";
import { FIELD_SLOT_WAS_PREFIX } from "../../../../../../../../components/field-slot/constants";
import type { AgentDraft, WasAgent } from "../../../../../../interfaces";
import { aDraft } from "../../../../../../../../testing";

const draft: AgentDraft = aDraft({
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
  compressAt: null,
  compressTo: null,
  maxCalls: null,
  temperature: null,
  isActive: null,
  waitsForAll: null,
  memory: null,
};

describe("SettingsNumbers", () => {
  it("stands the agent's three own settings, each named", () => {
    render(
      <SettingsNumbers
        draft={draft}
        was={nothingMoved}
        mendedStepper={createRef<HTMLButtonElement>()}
        mendedRow={null}
        isConverging
        onDraftChange={() => {}}
      />,
    );

    expect(screen.getByText(AGENT_SETTINGS_MAX_CALLS_LABEL)).toBeInTheDocument();
    expect(screen.getByText(AGENT_SETTINGS_TEMPERATURE_LABEL)).toBeInTheDocument();
    expect(screen.getByText(AGENT_SETTINGS_SWITCH_LABEL)).toBeInTheDocument();
    // The temperature is the one that needs saying in words.
    expect(screen.getByText(AGENT_SETTINGS_TEMPERATURE_HINT)).toBeInTheDocument();
  });

  it("steps the temperature by a tenth and the calls by one", async () => {
    const onDraftChange = vi.fn();

    render(
      <SettingsNumbers
        draft={draft}
        was={nothingMoved}
        mendedStepper={createRef<HTMLButtonElement>()}
        mendedRow={null}
        isConverging
        onDraftChange={onDraftChange}
      />,
    );
    await userEvent.click(
      screen.getByRole("button", {
        name: `${AGENT_SETTINGS_MAX_CALLS_LABEL}: ${STEPPER_MORE_LABEL}`,
      }),
    );

    expect(onDraftChange).toHaveBeenCalledWith({
      maxCalls: 9,
    });

    await userEvent.click(
      screen.getByRole("button", {
        name: `${AGENT_SETTINGS_TEMPERATURE_LABEL}: ${STEPPER_MORE_LABEL}`,
      }),
    );

    expect(onDraftChange).toHaveBeenCalledWith({
      temperature: 0.4,
    });
  });

  it("turns the agent off by its own switch", async () => {
    const onDraftChange = vi.fn();

    render(
      <SettingsNumbers
        draft={draft}
        was={nothingMoved}
        mendedStepper={createRef<HTMLButtonElement>()}
        mendedRow={null}
        isConverging
        onDraftChange={onDraftChange}
      />,
    );
    await userEvent.click(
      screen.getByRole("switch", {
        name: AGENT_SETTINGS_SWITCH_LABEL,
      }),
    );

    expect(onDraftChange).toHaveBeenCalledWith({
      isActive: false,
    });
  });

  it("says under a row what it was, where the draft has moved it", () => {
    // Each changed row shows its own «було»; an unchanged row shows none.
    render(
      <SettingsNumbers
        draft={draft}
        was={{
          ...nothingMoved,
          temperature: "0",
        }}
        mendedStepper={createRef<HTMLButtonElement>()}
        mendedRow={null}
        isConverging
        onDraftChange={() => {}}
      />,
    );

    expect(screen.getByText(`${FIELD_SLOT_WAS_PREFIX}0`)).toBeInTheDocument();
    expect(
      screen.getAllByText(FIELD_SLOT_WAS_PREFIX, {
        exact: false,
      }),
    ).toHaveLength(1);
  });
});
