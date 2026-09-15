import type { McpLook, ProjectMcpServer } from "../../../../../../../interfaces";

/** The boxed head of a server's page — what it is, how it is reached, and how fresh its answer is. */
export interface StateCardProps {
  server: ProjectMcpServer;
  look: McpLook | null;
  isAsking: boolean;
  /** «N АГ.» — counted from the grants the agents hold, and from nothing else. */
  agentCount: number;
  /** «Відповів 2 хв тому · оновлено вчора · 34 → 33», or nothing where it never answered. */
  freshness: string | null;
  onRestart: () => void;
  onAskAgain: () => void;
}
