import { cannotDrawLink } from "../../links";
import type { SphereScene, SphereStanding } from "../interfaces";
import type { Agent } from "../../../interfaces";

/**
 * How a sphere stands. While a line is drawn: the source is the picked sphere, spheres it must not land on stand back,
 * the aim is ignored. Otherwise the picked sphere is the selection's, the aimed one the chat's, and the rest stand back
 * only when the panel is about a selected agent or a link is chosen.
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
