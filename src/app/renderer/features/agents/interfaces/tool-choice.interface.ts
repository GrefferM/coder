import type { ToolSource } from "../../../interfaces";

/**
 * One function an agent may be given, whatever it came from. Commands and a server's functions stand in
 * one list because they are one choice — mixing thirty-three of the server's with four commands is the mess the
 * heads are there to undo, and the heads need one list to divide.
 */
export interface ToolChoice {
  /** The one handle on this function: a command by its id, a server's by the server and the name together. */
  key: string;
  /** Which head this row stands under. */
  group: string;
  name: string;
  description: string;
  source: ToolSource;
  /** Set for a command, and nothing for a server's function or an agent. */
  commandId: string | null;
  /** Set for a server's function, and nothing for a command or an agent. */
  serverId: string | null;
  /** Set for an agent granted as a tool, and nothing for a command or a server's function. */
  agentId: string | null;
}
