import type { LinkTally } from "../interfaces";
import type { Agent, Link } from "../../../interfaces";

/**
 * The lines of the selected agent, counted each way. Nothing is counted where nobody is selected, and an
 * agent with no lines at all is counted all the same — the canvas decides for itself whether to say a pair of zeroes.
 */
export function linkTally(agent: Agent | null, links: Link[]): LinkTally | null {
  if (agent === null) {
    return null;
  }

  return {
    outgoing: links.filter((link) => link.from === agent.id).length,
    incoming: links.filter((link) => link.to === agent.id).length,
    color: agent.color,
  };
}
