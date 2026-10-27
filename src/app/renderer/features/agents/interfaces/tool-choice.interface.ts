import type { SystemCommandId, ToolSource } from "../../../interfaces";

/** One function an agent may be given, from a command, a server or an agent. */
export interface ToolChoice {
  /** The source's handle (`handleOf`): kind and id, plus the function's name for a server's. */
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
  /** Set for a system command only. */
  systemCommand: SystemCommandId | null;
}
