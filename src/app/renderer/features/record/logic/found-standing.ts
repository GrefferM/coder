import { PERSON_COLOR, PERSON_NAME } from "../../../constants";
import type { NamedAgent } from "../../../interfaces";
import type { AskedStanding, RunHit } from "../interfaces";

/**
 * Whose message a found place is: the name on a place row is that message's own, not the flow's or the last-asked
 * agent's. A place in the question is the person's words, signed as in the stream; anything else is an agent, looked up
 * by id.
 */
export function foundStanding(found: RunHit, today: NamedAgent[]): AskedStanding {
  if (found.stepId === null) {
    return {
      name: PERSON_NAME,
      color: PERSON_COLOR,
      isGone: false,
    };
  }

  const now = today.find((agent) => agent.id === found.agentId) ?? null;

  return {
    name: now?.name ?? found.agentName ?? "",
    color: now?.color ?? null,
    isGone: now === null,
  };
}
