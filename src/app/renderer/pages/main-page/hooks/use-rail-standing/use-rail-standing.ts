import { useState } from "react";

import { AGENTS_SECTION_ID, CHAT_SECTION_ID, MODELS_SECTION_ID } from "../../constants";
import type { AgentMend, AgentPress, ToolsPress } from "../../../../features/agents";
import type { OpenedPassState } from "../../../../features/projection";
import type { PageSubjects } from "../../interfaces";
import type { RailStanding } from "./interfaces";

/** The open rail section and every way in and out of it. */
export function useRailStanding(subjects: PageSubjects, pass: OpenedPassState): RailStanding {
  const { project, agents, models, prompts, wayOut } = subjects;

  // The open section is remembered per machine and project.
  const [activeSectionId, setActiveSectionId] = useState(project.view?.sectionId ?? AGENTS_SECTION_ID);
  // Panel collapse is page state; catalogues stay open with nothing selected.
  const [isCollapsed, setIsCollapsed] = useState(project.view?.isCollapsed ?? true);
  // The place in the agent's tab a card named: numbers, prompt or grants.
  const [agentMend, setAgentMend] = useState<AgentMend | null>(null);
  // An arc press the panel has not yet answered; opens the list and highlights one head.
  const [toolsPress, setToolsPress] = useState<ToolsPress | null>(null);
  // A sphere press the tab has not yet answered; resets the tab to its root.
  const [agentPress, setAgentPress] = useState<AgentPress | null>(null);

  /** Brings the agents section forward. */
  function openAgentsSection() {
    if (activeSectionId === CHAT_SECTION_ID && !isCollapsed) {
      return;
    }

    openAgentForm();
  }

  /** Opens the create-agent form, moving the rail to the agents section from anywhere. */
  function openAgentForm() {
    setActiveSectionId(AGENTS_SECTION_ID);
    setIsCollapsed(false);
  }

  /** An empty-canvas click closes the agent panel; a catalogue stays open. */
  function closeAgentsSection() {
    if (activeSectionId !== AGENTS_SECTION_ID) {
      return;
    }

    setIsCollapsed(true);
  }

  /** Every way into a section; clears the aim and the highlight, which belong only to their own act. */
  function openSection(sectionId: string) {
    // Only a card's act opens a tab on a field.
    setAgentMend(null);
    // The open list and its highlight belong to the arc press.
    setToolsPress(null);
    setAgentPress(null);
    // The editor sits over the working area, so leaving a section closes it.
    prompts.closeEditor();
    // The projection sits over the panel, so entering a section leaves it.
    pass.close();
    setActiveSectionId(sectionId);
    setIsCollapsed(false);
  }

  /** A rail click: a catalogue releases the agent; agents with nobody selected claims the middle. */
  function handleActiveIdChange(sectionId: string) {
    wayOut.guard(() => {
      openSection(sectionId);

      // The chat targets the selection, so going to it keeps the selection.
      if (sectionId !== AGENTS_SECTION_ID && sectionId !== CHAT_SECTION_ID) {
        agents.select(null);

        return;
      }

      if (sectionId === CHAT_SECTION_ID) {
        return;
      }

      if (agents.selectedAgentId === null) {
        agents.claimCentre();
      }
    });
  }

  /** Collapsing clears the selection, claim and question, and returns to the agents section. */
  function handleCollapsedChange(isNowCollapsed: boolean) {
    // The projection covers the panel, so opening or closing the panel leaves it.
    pass.close();

    if (!isNowCollapsed) {
      setIsCollapsed(false);

      return;
    }

    wayOut.guard(() => {
      prompts.closeEditor();
      agents.reset();
      setToolsPress(null);
      setAgentPress(null);
      setActiveSectionId(AGENTS_SECTION_ID);
      setIsCollapsed(true);
    });
  }

  /** Goes to the agent's tab, on the place the card named. */
  function openAgentAt(place: AgentMend) {
    handleActiveIdChange(AGENTS_SECTION_ID);
    setAgentMend(place);
  }

  /**
   * An arc press opens the agent's tab on its tools, on the pressed head. Each press is a new object, so pressing the
   * same mini-sphere twice opens the page twice.
   */
  function openAgentTools(group: string | null, grantId: string | null) {
    wayOut.guard(() => {
      openSection(AGENTS_SECTION_ID);
      // A new object per press, so a repeat press reopens the page.
      setToolsPress({
        group,
        grantId,
      });
    });
  }

  /**
   * A press on the agent's own sphere; brings the agents section forward and resets the tab to the agent's settings.
   */
  function openAgentSelf(agentId: string) {
    openAgentsSection();
    // A new object per press, so a repeat press resets the tab again.
    setAgentPress({
      agentId,
    });
  }

  /** Opens the chat, where an answer from outside lives. */
  function openChat() {
    wayOut.guard(() => openSection(CHAT_SECTION_ID));
  }

  /** Opens an agent's model on its own form, where the ceiling is written. */
  function openAgentModel(agentId: string | null) {
    const agent = project.config.agents.find((standing) => standing.id === agentId) ?? null;

    if (agent === null) {
      return;
    }

    wayOut.guard(() => {
      prompts.closeEditor();
      models.openForm(agent.modelId, true);
      setActiveSectionId(MODELS_SECTION_ID);
      setIsCollapsed(false);
    });
  }

  /** Takes an installed, undeclared model up in the catalogue, name and provider prefilled. */
  function takeUpModel(providerId: string, title: string) {
    wayOut.guard(() => {
      prompts.closeEditor();
      models.openForm("new");
      models.editForm({
        title,
        provider: providerId,
      });
      setActiveSectionId(MODELS_SECTION_ID);
      setIsCollapsed(false);
    });
  }

  return {
    activeSectionId,
    isCollapsed,
    // The agents section dims the rest; the chat does not.
    isPanelOnAgent: activeSectionId === AGENTS_SECTION_ID && !isCollapsed,
    isChatOpen: activeSectionId === CHAT_SECTION_ID && !isCollapsed,
    agentMend,
    toolsPress,
    openAgentsSection,
    openChat,
    openAgentForm,
    closeAgentsSection,
    openAgentAt,
    openAgentTools,
    openAgentSelf,
    agentPress,
    openAgentModel,
    takeUpModel,
    handleActiveIdChange,
    handleCollapsedChange,
  };
}
