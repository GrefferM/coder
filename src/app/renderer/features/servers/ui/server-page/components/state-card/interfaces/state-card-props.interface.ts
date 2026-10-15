import type { McpLook, ProjectMcpServer } from "../../../../../../../interfaces";

export interface StateCardProps {
  server: ProjectMcpServer;
  look: McpLook | null;
  isAsking: boolean;
  /** «N АГ.», counted from the agents' grants only. */
  agentCount: number;
  /** «Відповів 2 хв тому · оновлено вчора · 34 → 33», or null where it never answered. */
  freshness: string | null;
  onRestart: () => void;
  onAskAgain: () => void;
}
