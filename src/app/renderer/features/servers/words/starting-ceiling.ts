import { MCP_CONNECT_TIMEOUT_MS } from "../../../../../contracts";
import { MS_IN_SECOND, SECONDS_IN_MINUTE } from "../../../utils/dates/constants";
import { SERVER_STARTING_CEILING_HEAD, SERVER_STARTING_CEILING_TAIL } from "../constants";

/**
 * «СПИНИМО ЧЕРЕЗ 2 ХВ» — the ceiling of the handshake said on the screen, so a wait has an end the
 * person can see coming. The number is the timer's own, rounded up: a ceiling said shorter than it is would have
 * the row still turning while the sentence says the waiting is over.
 */
export function startingCeiling(): string {
  const minutes = Math.ceil(MCP_CONNECT_TIMEOUT_MS / (MS_IN_SECOND * SECONDS_IN_MINUTE));

  return `${SERVER_STARTING_CEILING_HEAD}${minutes}${SERVER_STARTING_CEILING_TAIL}`;
}
