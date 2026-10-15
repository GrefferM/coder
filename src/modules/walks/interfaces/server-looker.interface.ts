import type { McpLook, ProjectMcpServer } from "../../../contracts";

export interface ServerLooker {
  look(server: ProjectMcpServer, directory: string): Promise<McpLook>;
}
