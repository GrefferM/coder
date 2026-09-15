import type { FunctionRow } from "../../../interfaces";
import type { McpLook, ProjectMcpServer } from "../../../../../interfaces";

/** One server as a step of the MCP tab: everything it is, with nothing folded away. */
export interface ServerPageProps {
  server: ProjectMcpServer;
  look: McpLook | null;
  /** What it hands over now, and what a grant still points at; empty where it has not answered. */
  rows: FunctionRow[];
  /** «N АГ.» — how many agents hold any function of this server. */
  agentCount: number;
  /** It is being raised right now — the page says so and offers nothing about the process. */
  isAsking: boolean;
  /** «ЗАПУСТИТИ» and «ПЕРЕЗАПУСТИТИ»: let the process go and raise it afresh. */
  onRestart: () => void;
  /** «ПЕРЕПИТАТИ»: a remote server is a connection, so its list is asked for again and nothing dies. */
  onAskAgain: () => void;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}
