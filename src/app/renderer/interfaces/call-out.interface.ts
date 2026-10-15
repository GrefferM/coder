import type { ToolSource } from "../../../contracts";

/**
 * What one agent has out now, as the canvas needs it: a name to say and its source. A server's call is named by the
 * server, not the function.
 */
export interface CallOut {
  /** A command's or an agent's own name, or the server's; never a server's function. */
  name: string;
  /** The colour the pill wears is the source's, not the agent's. */
  source: ToolSource;
}
