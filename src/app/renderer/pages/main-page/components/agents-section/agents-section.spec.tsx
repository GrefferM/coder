import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AgentsSection } from "./agents-section";
import { AGENT_FORM_TITLE } from "../../../../features/agents/ui/agent-panel/components/agent-form/constants";
import { AGENT_SETTINGS_MODEL_LABEL } from "../../../../features/agents/ui/agent-panel/components/agent-settings/constants";
import type { AgentDraft, AgentDrafting, AgentSelection, AgentState } from "../../../../features/agents";
import type { AgentsSectionProps } from "./interfaces";
import type { OpenProject } from "../../../../interfaces";
import { aConfig, aDraft, aModel } from "../../../../testing";

const project: OpenProject = {
  directory: "/code/coder",
  config: aConfig({
    name: "Coder",
    models: [aModel()],
  }),
  view: null,
};

const draft: AgentDraft = aDraft({});

const state: AgentState = {
  label: "ГОТОВИЙ",
  color: "#4ade80",
  mark: "dot",
  at: null,
};

function agents(patch: Partial<AgentSelection> = {}): AgentSelection {
  return {
    selectedAgentId: "agent-1",
    takePut: vi.fn(),
    pending: null,
    doomedAgentId: null,
    select: vi.fn(),
    claimPoint: vi.fn(),
    claimCentre: vi.fn(),
    createAgent: vi.fn(async () => {}),
    requestDelete: vi.fn(),
    confirmDelete: vi.fn(),
    dismissDelete: vi.fn(),
    reset: vi.fn(),
    ...patch,
  };
}

function drafted(patch: Partial<AgentDrafting> = {}): AgentDrafting {
  return {
    draft,
    saved: draft,
    isDirty: false,
    isNameTaken: false,
    unsaved: null,
    drawnAgents: [],
    edit: vi.fn(),
    revert: vi.fn(),
    save: vi.fn(async () => {}),
    ...patch,
  };
}

function props(patch: Partial<AgentsSectionProps> = {}): AgentsSectionProps {
  return {
    project,
    looks: {},
    agents: agents(),
    drafted: drafted(),
    state,
    providers: [],
    suppliers: [],
    startedAt: null,
    isNamingCopy: false,
    mending: null,
    toolsPress: null,
    agentPress: null,
    onCollapse: vi.fn(),
    onRevert: vi.fn(),
    onDeleteAgent: vi.fn(),
    ...patch,
  };
}

describe("AgentsSection", () => {
  it("is the agent's own tab where one is selected", () => {
    render(<AgentsSection {...props()} />);

    expect(screen.getByText(AGENT_SETTINGS_MODEL_LABEL)).toBeInTheDocument();
  });

  it("is the create form while a place on the canvas stands claimed", () => {
    // A claim is the beginning of an agent, so the section becomes where one is made.
    render(
      <AgentsSection
        {...props({
          agents: agents({
            pending: {
              kind: "centre",
            },
          }),
        })}
      />,
    );

    expect(screen.getByText(AGENT_FORM_TITLE)).toBeInTheDocument();
  });

  it("deletes the selected agent and nothing where none is selected", async () => {
    const said = props({
      agents: agents({
        selectedAgentId: null,
      }),
      drafted: drafted({
        draft: null,
      }),
    });

    render(<AgentsSection {...said} />);

    expect(said.onDeleteAgent).not.toHaveBeenCalled();
    // With nobody selected the section is the form, and the form has nothing to delete.
    expect(screen.getByText(AGENT_FORM_TITLE)).toBeInTheDocument();
  });

  it("goes away by the way the section itself was given", async () => {
    const said = props({
      agents: agents({
        selectedAgentId: null,
      }),
      drafted: drafted({
        draft: null,
      }),
    });

    render(<AgentsSection {...said} />);
    await userEvent.click(screen.getByText("Скасувати"));

    expect(said.onCollapse).toHaveBeenCalledOnce();
  });
});
