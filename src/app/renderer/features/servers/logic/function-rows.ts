import { isServerGrant, pointsAt } from "../../../interfaces";
import type { Agent, McpLook } from "../../../interfaces";
import type { FunctionRow } from "../interfaces";

/**
 * The lines of a server's page: what it hands over **now**, by name, and nothing else.
 *
 * A function an agent was granted and the server no longer names is not among them: the catalogue says what a
 * server gives, nothing on this page mends a grant, and the same trouble is told among the agent's broken
 * grants. Standing here too, it would make the head's count and the list's disagree.
 */
export function functionRows(serverId: string, look: McpLook | null, agents: Agent[]): FunctionRow[] {
  // A server that has not answered hands nothing over, and nothing of its is lost: the card does not open at all.
  if (look === null || !look.isUp) {
    return [];
  }

  const held = heldNames(serverId, agents);

  return [...look.functions]
    .sort((one, other) => one.name.localeCompare(other.name))
    .map((one) => ({
      name: one.name,
      description: one.description,
      agents: held.get(one.name)?.size ?? 0,
    }));
}

/** «2 АГ.» counts **agents**, so an agent granted one function twice is still one agent. */
function heldNames(serverId: string, agents: Agent[]): Map<string, Set<string>> {
  const held = new Map<string, Set<string>>();

  for (const agent of agents) {
    for (const grant of agent.tools) {
      if (!isServerGrant(grant) || !pointsAt(grant, serverId)) {
        continue;
      }

      const holders = held.get(grant.functionName) ?? new Set<string>();

      holders.add(agent.id);
      held.set(grant.functionName, holders);
    }
  }

  return held;
}
