import type { ToolSource } from "../../../interfaces";

/** One function an agent may be given, from a command, a server or an agent; one list so the heads can divide it. */
export interface ToolChoice {
  /** The function's handle: a command's id, or a server's id and name together. */
  key: string;
  /** Which head this row stands under. */
  group: string;
  name: string;
  description: string;
  source: ToolSource;
  /** Set for a command only. */
  commandId: string | null;
  /** Set for a server's function only. */
  serverId: string | null;
  /** Set for an agent granted as a tool only. */
  agentId: string | null;
}
