import { PERSON_COLOR, PERSON_NAME } from "../../../constants";
import type { NamedAgent } from "../../../interfaces";
import type { AskedStanding, RunHit } from "../interfaces";

/**
 * Whose message a found place is. The row of a place is the address of one message, so the name
 * on it is that message's own — not the flow's, and not whom the flow was asked last: a search that walks eight
 * steps of one run would otherwise sign all eight with the same name and tell the reader nothing.
 *
 * A place standing in the question is the person's own words, and the person is signed the way they are signed in
 * the stream. Everything else is an agent, looked up by id and never by what the record called it.
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
