import type { McpLook, ProjectMcpServer } from "../../../contracts";

/** One look at a declared server: what it hands over now. */
export interface ServerLooker {
  look(server: ProjectMcpServer, directory: string): Promise<McpLook>;
}
