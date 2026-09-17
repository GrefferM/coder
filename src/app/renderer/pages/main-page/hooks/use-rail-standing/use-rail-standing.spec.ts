import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useRailStanding } from "./use-rail-standing";
import { AGENTS_SECTION_ID, CHAT_SECTION_ID, MODELS_SECTION_ID, PROMPTS_SECTION_ID } from "../../constants";
import { aConfig, anAgent } from "../../../../testing";
import type { AgentSelection } from "../../../../features/agents";
import type { ModelSection } from "../../../../features/models";
import type { OpenedPassState } from "../../../../features/projection";
import type { OpenProject, ProjectView } from "../../../../interfaces";
import type { PageSubjects } from "../../interfaces";
import type { PromptSection } from "../../../../features/prompts";
import type { WayOut } from "../../../../hooks/use-way-out/interfaces";

const AGENT = anAgent({
  id: "agent-1",
  modelId: "model-1",
});

function project(view: ProjectView | null = null): OpenProject {
  return {
    directory: "/tmp/coder",
    config: aConfig({
      agents: [AGENT],
    }),
    view,
  };
}

/** The rail's neighbours, each standing in for what it does when the rail moves. */
function rail(
  stands: {
    view?: ProjectView | null;
    selectedAgentId?: string | null;
    /** A gate that holds every way out, as it does while a draft is unsaved. */
    isHeld?: boolean;
  } = {},
) {
  const agents = <AgentSelection>(<unknown>{
    selectedAgentId: stands.selectedAgentId ?? null,
    select: vi.fn(),
    claimCentre: vi.fn(),
    reset: vi.fn(),
  });
  const models = <ModelSection>(<unknown>{
    openForm: vi.fn(),
    editForm: vi.fn(),
  });
  const prompts = <PromptSection>(<unknown>{
    closeEditor: vi.fn(),
  });
  const pass = <OpenedPassState>(<unknown>{
    close: vi.fn(),
  });
  const wayOut = <WayOut>(<unknown>{
    guard: (go: () => void) => {
      if (stands.isHeld !== true) {
        go();
      }
    },
  });
  const subjects = <PageSubjects>(<unknown>{
    project: project(stands.view ?? null),
    agents,
    models,
    prompts,
    wayOut,
  });
  const rendered = renderHook(() => useRailStanding(subjects, pass));

  return {
    ...rendered,
    agents,
    models,
    prompts,
    pass,
  };
}

describe("useRailStanding · where the rail opens", () => {
  it("opens on the agents section, put away, when this machine noted nothing", () => {
    const { result } = rail();

    expect(result.current.activeSectionId).toBe(AGENTS_SECTION_ID);
    expect(result.current.isCollapsed).toBe(true);
  });

  it("opens where this machine left it in this project", () => {
    const { result } = rail({
      view: {
        sectionId: MODELS_SECTION_ID,
        isCollapsed: false,
        scale: 1,
        pan: {
          x: 0,
          y: 0,
        },
        aimedAgentId: null,
        fieldHeight: null,
      },
    });

    expect(result.current.activeSectionId).toBe(MODELS_SECTION_ID);
    expect(result.current.isCollapsed).toBe(false);
    expect(result.current.isPanelOnAgent).toBe(false);
  });
});

describe("useRailStanding · moving between sections", () => {
  it("lets the agent go when the rail moves to a catalogue, and puts the editor and the projection away", () => {
    const { result, agents, prompts, pass } = rail({
      selectedAgentId: "agent-1",
    });

    act(() => result.current.handleActiveIdChange(PROMPTS_SECTION_ID));

    expect(result.current.activeSectionId).toBe(PROMPTS_SECTION_ID);
    expect(result.current.isCollapsed).toBe(false);
    expect(agents.select).toHaveBeenCalledWith(null);
    expect(prompts.closeEditor).toHaveBeenCalled();
    expect(pass.close).toHaveBeenCalled();
  });

  it("keeps the selection when the rail moves to the chat, since the chat is aimed at it", () => {
    // The chat speaks to whoever is selected, so going there must not take the selection away.
    const { result, agents } = rail({
      selectedAgentId: "agent-1",
    });

    act(() => result.current.handleActiveIdChange(CHAT_SECTION_ID));

    expect(agents.select).not.toHaveBeenCalled();
    expect(result.current.isChatOpen).toBe(true);
    expect(result.current.isPanelOnAgent).toBe(false);
  });

  it("claims the middle for a new agent when the agents section opens with nobody selected", () => {
    const { result, agents } = rail();

    act(() => result.current.handleActiveIdChange(AGENTS_SECTION_ID));

    expect(agents.claimCentre).toHaveBeenCalled();
    expect(result.current.isPanelOnAgent).toBe(true);
  });

  it("claims nothing when the agents section opens on an agent already selected", () => {
    const { result, agents } = rail({
      selectedAgentId: "agent-1",
    });

    act(() => result.current.handleActiveIdChange(AGENTS_SECTION_ID));

    expect(agents.claimCentre).not.toHaveBeenCalled();
    expect(agents.select).not.toHaveBeenCalled();
  });

  it("moves nothing at all while the gate holds every way out", () => {
    // An unsaved draft asks first, and until it is answered the rail stands where it is.
    const { result, agents, prompts } = rail({
      isHeld: true,
    });

    act(() => result.current.handleActiveIdChange(PROMPTS_SECTION_ID));

    expect(result.current.activeSectionId).toBe(AGENTS_SECTION_ID);
    expect(result.current.isCollapsed).toBe(true);
    expect(agents.select).not.toHaveBeenCalled();
    expect(prompts.closeEditor).not.toHaveBeenCalled();
  });
});

describe("useRailStanding · opening and putting the panel away", () => {
  it("leaves the chat where it is when a canvas act asks for the agents section", () => {
    // An open chat keeps the rail — a click on a sphere aims the chat, it does not replace it.
    const { result } = rail();

    act(() => result.current.handleActiveIdChange(CHAT_SECTION_ID));
    act(() => result.current.openAgentsSection());

    expect(result.current.activeSectionId).toBe(CHAT_SECTION_ID);
  });

  it("brings the agents section forward from a catalogue", () => {
    const { result } = rail();

    act(() => result.current.handleActiveIdChange(PROMPTS_SECTION_ID));
    act(() => result.current.openAgentsSection());

    expect(result.current.activeSectionId).toBe(AGENTS_SECTION_ID);
    expect(result.current.isCollapsed).toBe(false);
  });

  it("puts the agent panel away on the empty canvas, and leaves a catalogue open", () => {
    // A catalogue is not the selection's, so a click on empty space says nothing to it.
    const { result } = rail();

    act(() => result.current.openAgentForm());
    act(() => result.current.closeAgentsSection());

    expect(result.current.isCollapsed).toBe(true);

    act(() => result.current.handleActiveIdChange(PROMPTS_SECTION_ID));
    act(() => result.current.closeAgentsSection());

    expect(result.current.isCollapsed).toBe(false);
  });

  it("clears the selection, the claim and the question when the panel is put away", () => {
    const { result, agents, prompts, pass } = rail();

    act(() => result.current.handleActiveIdChange(PROMPTS_SECTION_ID));
    act(() => result.current.handleCollapsedChange(true));

    expect(agents.reset).toHaveBeenCalled();
    expect(prompts.closeEditor).toHaveBeenCalled();
    expect(pass.close).toHaveBeenCalled();
    expect(result.current.activeSectionId).toBe(AGENTS_SECTION_ID);
    expect(result.current.isCollapsed).toBe(true);
  });

  it("leaves the projection whether the panel is opened or put away", () => {
    // The projection stands over the panel, so both ways are a way out of it.
    const { result, pass } = rail();

    act(() => result.current.handleCollapsedChange(false));

    expect(pass.close).toHaveBeenCalled();
    expect(result.current.isCollapsed).toBe(false);
  });
});

describe("useRailStanding · the press on the arc", () => {
  it("opens the agent's tab on its tools and claims no middle for a new one", () => {
    // The press names the agent it stands on and the page selects it in the same act, so the selection
    // this hook could read is still the one from before the press — and claiming on it would open the create form
    // over the very tools the press asked for.
    const { result, agents } = rail();

    act(() => result.current.openAgentTools("server:playwright-mcp", null));

    expect(result.current.activeSectionId).toBe(AGENTS_SECTION_ID);
    expect(result.current.isCollapsed).toBe(false);
    expect(agents.claimCentre).not.toHaveBeenCalled();
    expect(result.current.toolsPress?.group).toBe("server:playwright-mcp");
  });

  it("names the press anew every time, so the same head opens and lights twice", () => {
    // Every press is its own object — that is what makes the second press on the same mini-sphere a
    // second answer and not nothing at all. Two equal names would have looked like nothing happening.
    const { result } = rail({
      selectedAgentId: "agent-1",
    });

    act(() => result.current.openAgentTools("server:playwright-mcp", null));

    const first = result.current.toolsPress;

    act(() => result.current.openAgentTools("server:playwright-mcp", null));

    expect(result.current.toolsPress).not.toBe(first);
    expect(result.current.toolsPress?.group).toBe("server:playwright-mcp");
  });

  it("takes the light off when the rail is walked into a section by any other way", () => {
    const { result } = rail({
      selectedAgentId: "agent-1",
    });

    act(() => result.current.openAgentTools("server:playwright-mcp", null));
    act(() => result.current.handleActiveIdChange(AGENTS_SECTION_ID));

    expect(result.current.toolsPress).toBeNull();
  });

  it("opens nothing at all while the gate holds every way out", () => {
    // An unsaved draft asks first, and the arc is no way around it.
    const { result } = rail({
      isHeld: true,
    });

    act(() => result.current.openAgentTools("server:playwright-mcp", null));

    expect(result.current.isCollapsed).toBe(true);
  });
});

describe("useRailStanding · the ways a card opens a tab", () => {
  it("opens the agent's tab on the place a card named, and any other way in takes that aim off", () => {
    // Only a card's own act opens a tab on a field.
    const { result } = rail();

    act(() => result.current.openAgentAt("number"));

    expect(result.current.activeSectionId).toBe(AGENTS_SECTION_ID);
    expect(result.current.agentMend).toBe("number");

    act(() => result.current.handleActiveIdChange(AGENTS_SECTION_ID));

    expect(result.current.agentMend).toBeNull();
  });

  it("opens the model an agent stands on, on its own form", () => {
    // The ceiling is written on the model, so that is where the card's act leads.
    const { result, models } = rail();

    act(() => result.current.openAgentModel("agent-1"));

    expect(models.openForm).toHaveBeenCalledWith("model-1", true);
    expect(result.current.activeSectionId).toBe(MODELS_SECTION_ID);
    expect(result.current.isCollapsed).toBe(false);
  });

  it("goes nowhere for an agent the project does not have", () => {
    const { result, models } = rail();

    act(() => result.current.openAgentModel("agent-gone"));

    expect(models.openForm).not.toHaveBeenCalled();
    expect(result.current.activeSectionId).toBe(AGENTS_SECTION_ID);
  });

  it("takes an installed model up in the catalogue with its name and provider already in the form", () => {
    // The model is on the machine and not in the project, so the form opens filled in.
    const { result, models } = rail();

    act(() => result.current.takeUpModel("ollama", "qwen2.5-coder"));

    expect(models.openForm).toHaveBeenCalledWith("new");
    expect(models.editForm).toHaveBeenCalledWith({
      title: "qwen2.5-coder",
      provider: "ollama",
    });
    expect(result.current.activeSectionId).toBe(MODELS_SECTION_ID);
  });
});
