import { useState } from "react";

import { AGENTS_SECTION_ID, CHAT_SECTION_ID, MODELS_SECTION_ID } from "../../constants";
import type { OpenProject } from "../../../../interfaces";
import type { AgentMend, AgentPress, AgentSelection, ToolsPress } from "../../../../features/agents";
import type { ModelSection } from "../../../../features/models";
import type { PromptSection } from "../../../../features/prompts";
import type { OpenedPassState } from "../../../../features/projection";
import type { WayOut } from "../../../../hooks/use-way-out/interfaces";
import type { RailStanding } from "./interfaces";

/** Which section of the rail stands open, and every way in and out of it — the panel's own standing, nothing else. */
export function useRailStanding(
  project: OpenProject,
  agents: AgentSelection,
  models: ModelSection,
  prompts: PromptSection,
  pass: OpenedPassState,
  wayOut: WayOut,
): RailStanding {
  // Which section stands open is this machine's own note about this project, kept from last time.
  const [activeSectionId, setActiveSectionId] = useState(project.view?.sectionId ?? AGENTS_SECTION_ID);
  // Whether the panel stands open is the page's own state: the catalogues stay open with nothing selected.
  const [isCollapsed, setIsCollapsed] = useState(project.view?.isCollapsed ?? true);
  // Which place of the agent's tab the card's act named — its own numbers, its prompt, or its grants.
  const [agentMend, setAgentMend] = useState<AgentMend | null>(null);
  // The press on the arc the panel has not answered yet — it opens the list and lights one head.
  const [toolsPress, setToolsPress] = useState<ToolsPress | null>(null);
  // The press on the sphere itself the tab has not answered yet — it stands the tab back at its root.
  const [agentPress, setAgentPress] = useState<AgentPress | null>(null);

  /** Brings the agents section forward, where The question stands; An open chat keeps the rail. */
  function openAgentsSection() {
    if (activeSectionId === CHAT_SECTION_ID && !isCollapsed) {
      return;
    }

    openAgentForm();
  }

  /** The way in for the create-agent form: it lives in the agents section, so this moves the rail from anywhere. */
  function openAgentForm() {
    setActiveSectionId(AGENTS_SECTION_ID);
    setIsCollapsed(false);
  }

  /** The click on empty canvas puts the agent panel away; a catalogue is not the selection's and stays open. */
  function closeAgentsSection() {
    if (activeSectionId !== AGENTS_SECTION_ID) {
      return;
    }

    setIsCollapsed(true);
  }

  /**
   * Every way into a section, and nothing about the selection: an aim and a light are answers to the one act that
   * asked for them, so any other way in takes both off.
   */
  function openSection(sectionId: string) {
    // Only a card's own act opens a tab on a field, so any other way in takes that aim off.
    setAgentMend(null);
    // The open list and its light belong to the press; walking into the section is not that press.
    setToolsPress(null);
    setAgentPress(null);
    // The editor stands over the working area, not inside the panel, so leaving a section puts it away.
    prompts.closeEditor();
    // The projection stands over the panel, so going to a section is going out of it.
    pass.close();
    setActiveSectionId(sectionId);
    setIsCollapsed(false);
  }

  /** The rail's click: moving to a catalogue lets the agent go; agents with nobody selected claims the middle. */
  function handleActiveIdChange(sectionId: string) {
    wayOut.guard(() => {
      openSection(sectionId);

      // The chat is aimed at whoever is selected, so going to it keeps the selection.
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

  /** Collapsing clears the selection, the claim and the question, and returns to the agents section. */
  function handleCollapsedChange(isNowCollapsed: boolean) {
    // The projection covers the panel, so both opening and putting the panel away leave it.
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

  /** A card's act goes to the agent's tab and opens it on the place that card named. */
  function openAgentAt(place: AgentMend) {
    handleActiveIdChange(AGENTS_SECTION_ID);
    setAgentMend(place);
  }

  /**
   * A press on the arc opens the agent's tab on its tools, and what the mark stood for with it — the
   * tab knows the page, this only carries the press to it. It claims no middle for a new agent, and that is the
   * whole difference from the rail's own button: the press names the agent it stands on and the page selects it in
   * the same act, so there is nobody to claim a place for — while the selection this hook could read here is still
   * the one from before the press, and would have said «nobody» exactly when an agent had just been named.
   *
   * The press is named anew every time, so pressing the same mini-sphere twice opens its page twice — it is an
   * answer to a press, not a state of the panel, and that is what makes the way back and in again work.
   */
  function openAgentTools(group: string | null, grantId: string | null) {
    wayOut.guard(() => {
      openSection(AGENTS_SECTION_ID);
      // Every press is its own object, so a second press on the same mark opens the same page anew.
      setToolsPress({
        group,
        grantId,
      });
    });
  }

  /**
   * The press on the agent's own sphere. It brings the agents section forward as any other way to that
   * agent does, and says so to the tab: the sphere is the agent, so the tab stands at the agent — at its settings,
   * and not on whatever step of them was left open behind the canvas.
   */
  function openAgentSelf(agentId: string) {
    openAgentsSection();
    // Every press is its own object, so the sphere pressed twice brings the tab back twice.
    setAgentPress({
      agentId,
    });
  }

  /** The chat, opened because something outside it has an answer that lives there. */
  function openChat() {
    wayOut.guard(() => openSection(CHAT_SECTION_ID));
  }

  /** The model an agent stands on, opened on its own form — where the ceiling is written. */
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

  /** An installed, undeclared model is taken up in the catalogue with its name and provider in the form. */
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
    // The agents section is about one agent, so it dims the rest; the chat is not, so it does not.
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
