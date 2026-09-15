import { SERVER_AGENTS_ON_MARK } from "../constants";

/**
 * «2 АГ.» beside a function — how many agents hold it. It is a count and not a tick: the catalogue
 * hands nothing out, and the tick lives in the agent's own tab.
 *
 * A function nobody holds says nothing at all. Zero is a fact worth no ink here, and the same rule already stands
 * in the row's own facts, where a server with no agents simply leaves that fact out.
 */
export function agentsOn(count: number): string {
  return count === 0 ? "" : `${count} ${SERVER_AGENTS_ON_MARK}`;
}
