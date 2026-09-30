import { MCP_CONNECT_TIMEOUT_MS } from "../../../../../contracts";
import { MS_IN_SECOND, SECONDS_IN_MINUTE } from "../../../utils/dates/constants";
import { SERVER_STARTING_CEILING_HEAD, SERVER_STARTING_CEILING_TAIL } from "../constants";

/** «СПИНИМО ЧЕРЕЗ 2 ХВ»: the handshake ceiling, the timer's own value rounded up. */
export function startingCeiling(): string {
  const minutes = Math.ceil(MCP_CONNECT_TIMEOUT_MS / (MS_IN_SECOND * SECONDS_IN_MINUTE));

  return `${SERVER_STARTING_CEILING_HEAD}${minutes}${SERVER_STARTING_CEILING_TAIL}`;
}
