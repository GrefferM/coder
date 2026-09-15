import type { McpLook, ProjectMcpServer, ToolGrant } from "../../../../../../../../../interfaces";

export interface ServersSectionProps {
  servers: ProjectMcpServer[];
  /** What each server hands over right now; a server that did not answer offers nothing to connect to. */
  looks: Record<string, McpLook>;
  /** The whole draft's grants: this section changes only the servers' and leaves the commands' alone. */
  grants: ToolGrant[];
  wasValue: string | null;
  onGrantsChange: (grants: ToolGrant[]) => void;
  /** A connected server opens as a step of its own, the way an opened grant does. */
  onOpenServer: (serverId: string) => void;
}
