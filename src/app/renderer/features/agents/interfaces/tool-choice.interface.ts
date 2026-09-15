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
  source: "command" | "mcp";
  /** Set for a command, and nothing for a server's function. */
  commandId: string | null;
  /** Set for a server's function, and nothing for a command. */
  serverId: string | null;
}
