import { cannotDrawLink } from "../../links";
import type { SphereScene, SphereStanding } from "../interfaces";
import type { Agent } from "../../../interfaces";

/**
 * How a sphere stands. While a line is being drawn everything is about that line — the sphere
 * it comes from is the picked one, and every sphere the line must not land on stands back; the aim says nothing then,
 * since a line is a moment and an aim stands for hours. Otherwise the picked sphere is the selection's, the aimed one
 * is the chat's, and the rest stand back only when the panel is about a selected agent or a link is chosen.
 */
export function sphereStanding(agent: Agent, scene: SphereScene): SphereStanding {
  const { picked, drawnFrom, isLinkChosen, links } = scene;

  if (drawnFrom !== null) {
    return {
      isSelected: agent.id === drawnFrom,
      isAimed: false,
      isDimmed: cannotDrawLink(links, drawnFrom, agent.id),
    };
  }

  return {
    isSelected: agent.id === picked.selectedAgentId,
    isAimed: agent.id === picked.aimedAgentId,
    isDimmed:
      isLinkChosen || (picked.isPanelOnAgent && picked.selectedAgentId !== null && agent.id !== picked.selectedAgentId),
  };
}
