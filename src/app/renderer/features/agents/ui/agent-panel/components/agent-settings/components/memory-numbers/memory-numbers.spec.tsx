import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MemoryNumbers } from "./memory-numbers";
import {
  AGENT_SETTINGS_COMPRESS_AT_HINT,
  AGENT_SETTINGS_COMPRESS_AT_LABEL,
  AGENT_SETTINGS_COMPRESS_TO_HINT,
  AGENT_SETTINGS_COMPRESS_TO_LABEL,
} from "../../constants";
import { STEPPER_LESS_LABEL, STEPPER_MORE_LABEL } from "../../../../../../../../components/stepper/constants";
import { FIELD_SLOT_WAS_PREFIX } from "../../../../../../../../components/field-slot/constants";
import type { AgentDraft, WasAgent } from "../../../../../../interfaces";
import { aDraft } from "../../../../../../../../testing";

const draft: AgentDraft = aDraft({
  compressAt: 80,
  compressTo: 20,
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
  choosesRoute: null,
  memory: null,
};

function renderNumbers(patch: Partial<AgentDraft> = {}, onDraftChange = vi.fn(), was: WasAgent = nothingMoved) {
  render(
    <MemoryNumbers
      draft={{
        ...draft,
        ...patch,
      }}
      was={was}
      mendedStepper={createRef<HTMLButtonElement>()}
      mendedRow={null}
      onDraftChange={onDraftChange}
    />,
  );
}

describe("MemoryNumbers", () => {
  it("stands the threshold and the target, each named and each told in words", () => {
    renderNumbers();

    expect(screen.getByText(AGENT_SETTINGS_COMPRESS_AT_LABEL)).toBeInTheDocument();
    expect(screen.getByText(AGENT_SETTINGS_COMPRESS_TO_LABEL)).toBeInTheDocument();
    expect(screen.getByText(AGENT_SETTINGS_COMPRESS_AT_HINT)).toBeInTheDocument();
    expect(screen.getByText(AGENT_SETTINGS_COMPRESS_TO_HINT)).toBeInTheDocument();
  });

  it("steps the threshold by five percent", async () => {
    const onDraftChange = vi.fn();

    renderNumbers({}, onDraftChange);
    await userEvent.click(
      screen.getByRole("button", {
        name: `${AGENT_SETTINGS_COMPRESS_AT_LABEL}: ${STEPPER_MORE_LABEL}`,
      }),
    );

    expect(onDraftChange).toHaveBeenCalledWith({
      compressAt: 85,
    });
  });

  it("stops the threshold at its bounds, 70 and 90", () => {
    renderNumbers({
      compressAt: 70,
    });
    expect(
      screen.getByRole("button", {
        name: `${AGENT_SETTINGS_COMPRESS_AT_LABEL}: ${STEPPER_LESS_LABEL}`,
      }),
    ).toBeDisabled();
  });

  it("stops the target at its bounds, 10 and 30", () => {
    renderNumbers({
      compressTo: 30,
    });
    expect(
      screen.getByRole("button", {
        name: `${AGENT_SETTINGS_COMPRESS_TO_LABEL}: ${STEPPER_MORE_LABEL}`,
      }),
    ).toBeDisabled();
  });

  it("writes the least the row may hold on the first step up of an empty one", async () => {
    const onDraftChange = vi.fn();

    renderNumbers(
      {
        compressTo: null,
      },
      onDraftChange,
    );
    await userEvent.click(
      screen.getByRole("button", {
        name: `${AGENT_SETTINGS_COMPRESS_TO_LABEL}: ${STEPPER_MORE_LABEL}`,
      }),
    );

    expect(onDraftChange).toHaveBeenCalledWith({
      compressTo: 10,
    });
  });

  it("says under a row what it was, where the draft has moved it", () => {
    renderNumbers({}, vi.fn(), {
      ...nothingMoved,
      compressAt: "90 %",
    });

    expect(screen.getByText(`${FIELD_SLOT_WAS_PREFIX}90 %`)).toBeInTheDocument();
  });
});
