import type { LinkTally } from "../interfaces";
import type { Agent, Link } from "../../../interfaces";

/** The selected agent's lines counted each way; null when nobody is selected, zeroes for an agent with no lines. */
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
