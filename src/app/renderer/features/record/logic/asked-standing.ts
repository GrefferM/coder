import type { NamedAgent } from "../../../interfaces";
import type { AskedStanding, RunRow } from "../interfaces";

/**
 * The name the head of a history row wears — whom the flow was asked last. The rule is
 * `runStandings`' own, said here for a row that has no walk to read: today's name wins, and the record's stands only
 * for an agent the project no longer holds. A list must not dress itself again on every rename, so the name is
 * looked up by the agent's id and never by what the record called it.
 */
export function askedStanding(run: RunRow, today: NamedAgent[]): AskedStanding {
  const now = today.find((agent) => agent.id === run.askedAgentId) ?? null;

  return {
    name: now?.name ?? run.askedAgentName,
    color: now?.color ?? null,
    isGone: now === null,
  };
}
