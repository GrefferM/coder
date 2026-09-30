import { SERVER_AGENTS_ON_MARK } from "../constants";

/**
 * «2 АГ.» beside a function: how many agents hold it, a count and not a tick.
 *
 * A function nobody holds gets no text.
 */
export function agentsOn(count: number): string {
  return count === 0 ? "" : `${count} ${SERVER_AGENTS_ON_MARK}`;
}
