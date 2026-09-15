import type { Agent, Link } from "../../../interfaces";

/** Names at the other end of links the deletion would take, each once. */
export function doomedNeighbourNames(agents: Agent[], links: Link[], doomedAgentId: string): string[] {
  const neighbourIds = new Set(
    links
      .filter((link) => link.from === doomedAgentId || link.to === doomedAgentId)
      .map((link) => (link.from === doomedAgentId ? link.to : link.from)),
  );

  return [...neighbourIds]
    .map((agentId) => agents.find((agent) => agent.id === agentId)?.name)
    .filter((name): name is string => name !== undefined);
}
