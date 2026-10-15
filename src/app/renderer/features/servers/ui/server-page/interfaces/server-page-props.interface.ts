import type { FunctionRow } from "../../../interfaces";
import type { McpLook, ProjectMcpServer } from "../../../../../interfaces";

/** One server as a step of the MCP tab. */
export interface ServerPageProps {
  server: ProjectMcpServer;
  look: McpLook | null;
  /** What it hands over now; empty where it has not answered. */
  rows: FunctionRow[];
  /** «N АГ.» — how many agents hold any function of this server. */
  agentCount: number;
  /** It is being raised right now; no process action is offered. */
  isAsking: boolean;
  /** «ЗАПУСТИТИ» and «ПЕРЕЗАПУСТИТИ»: let the process go and raise it afresh. */
  onRestart: () => void;
  /** «ПЕРЕПИТАТИ»: asks a remote server for its list again. */
  onAskAgain: () => void;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}
