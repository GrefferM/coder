import type { McpLook, ProjectMcpServer, ToolGrant } from "../../../../../../../../../interfaces";

export interface ServersSectionProps {
  servers: ProjectMcpServer[];
  /** What each server offers; one that did not answer offers nothing to connect. */
  looks: Record<string, McpLook>;
  /** The whole draft's grants; this section changes only the servers'. */
  grants: ToolGrant[];
  wasValue: string | null;
  /** The model's provider has no functions: nothing can be connected, existing grants stay. */
  isLocked: boolean;
  onGrantsChange: (grants: ToolGrant[]) => void;
  /** Opens a connected server as a step of its own. */
  onOpenServer: (serverId: string) => void;
}
