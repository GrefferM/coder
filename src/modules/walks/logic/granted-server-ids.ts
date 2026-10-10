import { isAgentGrant, isCommandGrant } from "../../../contracts";
import type { Agent, ProjectConfig } from "../../../contracts";

/** The ids of the servers whose functions the agent, or any agent it reaches as a tool, is granted. */
export function grantedServerIds(root: Agent, config: ProjectConfig): string[] {
  const seen = new Set<string>();
  const queue: string[] = [root.id];
  const servers = new Set<string>();

  while (queue.length > 0) {
    const id = queue.shift() ?? "";

    if (seen.has(id)) {
      continue;
    }

    seen.add(id);

    const agent = config.agents.find((held) => held.id === id) ?? null;

    if (agent === null) {
      continue;
    }

    for (const grant of agent.tools) {
      if (isAgentGrant(grant)) {
        queue.push(grant.agentId);

        continue;
      }

      if (isCommandGrant(grant)) {
        continue;
      }

      servers.add(grant.serverId);
    }
  }

  return [...servers];
}
