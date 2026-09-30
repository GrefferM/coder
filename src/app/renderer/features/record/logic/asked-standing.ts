import type { NamedAgent } from "../../../interfaces";
import type { AskedStanding, RunRow } from "../interfaces";

/**
 * The name on a history row's head: whom the flow was asked last. Follows `runStandings`' rule: today's name wins, the
 * record's stands only for an agent the project no longer holds; looked up by id.
 */
export function askedStanding(run: RunRow, today: NamedAgent[]): AskedStanding {
  const now = today.find((agent) => agent.id === run.askedAgentId) ?? null;

  return {
    name: now?.name ?? run.askedAgentName,
    color: now?.color ?? null,
    isGone: now === null,
  };
}
