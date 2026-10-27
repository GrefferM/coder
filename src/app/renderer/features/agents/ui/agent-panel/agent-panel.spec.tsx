import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AgentPanel } from "./agent-panel";
import { AGENT_FORM_TITLE } from "./components/agent-form/constants";
import {
  AGENT_SETTINGS_MODEL_LABEL,
  AGENT_SETTINGS_SWITCH_LABEL,
  SETTINGS_BACK_LABEL,
} from "./components/agent-settings/constants";
import { TOOL_ROW_OPEN_LABEL } from "./components/agent-settings/components/tools-section/components/tool-row/constants";
import type { AgentDraft, AgentState } from "../../interfaces";
import type { AgentPanelProps } from "./interfaces";
import type { AgentCatalogue, AgentPanelActs, AgentPresses, AgentStanding, AgentWriting } from "../../interfaces";
import { aCommand, aDraft, aModel } from "../../../../testing";

const state: AgentState = {
  label: "ГОТОВИЙ",
  color: "#4ade80",
  mark: "dot",
  at: null,
};

const draft: AgentDraft = aDraft({
  tools: [
    {
      id: "grant-1",
      source: "command",
      commandId: "command-1",
      pinned: [],
    },
  ],
  temperature: 0.3,
});

/** Per-case overrides; everything left out stands as the fixture sets it. */
interface PanelOverrides {
  catalogue?: Partial<AgentCatalogue>;
  writing?: Partial<AgentWriting>;
  standing?: Partial<AgentStanding>;
  presses?: Partial<AgentPresses>;
  acts?: Partial<AgentPanelActs>;
}

function props(patch: PanelOverrides = {}): AgentPanelProps {
  return {
    agentId: "agent-1",
    catalogue: {
      models: [aModel()],
      providers: [],
      prompts: [],
      commands: [aCommand()],
      servers: [],
      looks: {},
      agents: [],
      ...patch.catalogue,
    },
    writing: {
      draft,
      saved: draft,
      isCreating: false,
      isNaming: false,
      isDirty: false,
      isNameTaken: false,
      ...patch.writing,
    },
    standing: {
      state,
      startedAt: null,
      suppliers: [],
      followers: [],
      ...patch.standing,
    },
    presses: {
      mending: null,
      tools: null,
      agent: null,
      ...patch.presses,
    },
    acts: {
      onCreate: vi.fn(async () => {}),
      onCancel: vi.fn(),
      onDraftChange: vi.fn(),
      onRevert: vi.fn(),
      onSave: vi.fn(async () => {}),
      onDelete: vi.fn(),
      ...patch.acts,
    },
  };
}

describe("AgentPanel", () => {
  it("is the create form while an agent is being made", () => {
    render(
      <AgentPanel
        {...props({
          writing: {
            isCreating: true,
          },
        })}
      />,
    );

    expect(screen.getByText(AGENT_FORM_TITLE)).toBeInTheDocument();
    // The form also names a model, so the settings are told apart by a row only they have.
    expect(screen.queryByText(AGENT_SETTINGS_SWITCH_LABEL)).not.toBeInTheDocument();
  });

  it("is the create form where there is no agent to show, whatever else was asked for", () => {
    // With nothing selected the panel shows the create form.
    render(
      <AgentPanel
        {...props({
          writing: {
            draft: null,
          },
        })}
      />,
    );

    expect(screen.getByText(AGENT_FORM_TITLE)).toBeInTheDocument();
  });

  it("is the agent's own settings, under its name, once one is selected", () => {
    render(<AgentPanel {...props()} />);

    expect(screen.getByText("Шукач")).toBeInTheDocument();
    expect(screen.getByText(AGENT_SETTINGS_MODEL_LABEL)).toBeInTheDocument();
    expect(screen.queryByText(AGENT_FORM_TITLE)).not.toBeInTheDocument();
  });

  it("gives the whole panel to one grant while it stands open, head and all", async () => {
    // The grant is read on its own, without the agent over it.
    render(<AgentPanel {...props()} />);
    await userEvent.click(
      screen.getByRole("button", {
        name: `${TOOL_ROW_OPEN_LABEL} open_pr`,
      }),
    );

    expect(
      screen.getByRole("button", {
        name: SETTINGS_BACK_LABEL,
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText(AGENT_SETTINGS_MODEL_LABEL)).not.toBeInTheDocument();
  });

  it("comes back to the settings from the grant, the agent's head with it", async () => {
    render(<AgentPanel {...props()} />);
    await userEvent.click(
      screen.getByRole("button", {
        name: `${TOOL_ROW_OPEN_LABEL} open_pr`,
      }),
    );
    await userEvent.click(
      screen.getByRole("button", {
        name: SETTINGS_BACK_LABEL,
      }),
    );

    expect(screen.getByText(AGENT_SETTINGS_MODEL_LABEL)).toBeInTheDocument();
  });

  it("stays out of the grant the arc sent it to, though the press is still standing", async () => {
    // The press stays until the rail takes it off, so leaving a step must not be heard as a fresh press; the tab keeps
    // its place while a step is open.
    render(
      <AgentPanel
        {...props({
          presses: {
            tools: {
              group: "commands",
              grantId: "grant-1",
            },
          },
        })}
      />,
    );

    await userEvent.click(
      screen.getByRole("button", {
        name: SETTINGS_BACK_LABEL,
      }),
    );

    expect(screen.getByText(AGENT_SETTINGS_MODEL_LABEL)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: SETTINGS_BACK_LABEL,
      }),
    ).not.toBeInTheDocument();
  });

  it("stands back at the settings when the agent's own sphere is pressed, from whatever step", () => {
    // The sphere returns from an open step to the agent's settings.
    const opened = props({
      presses: {
        tools: {
          group: "commands",
          grantId: "grant-1",
        },
      },
    });
    const { rerender } = render(<AgentPanel {...opened} />);

    expect(
      screen.getByRole("button", {
        name: SETTINGS_BACK_LABEL,
      }),
    ).toBeInTheDocument();

    rerender(
      <AgentPanel
        {...opened}
        presses={{
          ...opened.presses,
          agent: {
            agentId: "agent-1",
          },
        }}
      />,
    );

    expect(screen.getByText(AGENT_SETTINGS_MODEL_LABEL)).toBeInTheDocument();
  });
});
