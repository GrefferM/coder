import type { ProjectConfig } from "../../../interfaces";

/** Whom a converging point waits for — only a supplier that is live and that this run reaches. */
export function awaitedSuppliers(config: ProjectConfig, startAgentId: string, agentId: string): string[] {
  const reached = reachedFrom(config, startAgentId);

  return [
    ...new Set(config.links.filter((link) => link.to === agentId && reached.has(link.from)).map((link) => link.from)),
  ];
}

/** Every agent the run can reach, walking the lines out of the one the person spoke to. */
function reachedFrom(config: ProjectConfig, startAgentId: string): Set<string> {
  const live = new Set(config.agents.filter((agent) => agent.isActive).map((agent) => agent.id));
  const reached = new Set<string>();
  const ahead = live.has(startAgentId) ? [startAgentId] : [];

  while (ahead.length > 0) {
    const at = <string>ahead.pop();

    if (reached.has(at)) {
      continue;
    }

    reached.add(at);

    for (const link of config.links.filter((standing) => standing.from === at)) {
      if (live.has(link.to)) {
        ahead.push(link.to);
      }
    }
  }

  return reached;
}
