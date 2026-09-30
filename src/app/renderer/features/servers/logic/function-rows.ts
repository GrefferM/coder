import { isServerGrant, pointsAt } from "../../../interfaces";
import type { Agent, McpLook } from "../../../interfaces";
import type { FunctionRow } from "../interfaces";

/**
 * The lines of a server's page: what it hands over now, by name.
 *
 * A granted function the server no longer names is left out; that trouble shows among the agent's broken grants.
 */
export function functionRows(serverId: string, look: McpLook | null, agents: Agent[]): FunctionRow[] {
  // A server that has not answered hands nothing over, and its card does not open.
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

/** Counts agents, so an agent granted one function twice is one. */
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
