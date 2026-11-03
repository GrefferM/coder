import type { ProjectMcpServer } from "../../../contracts/project/mcp-server.interface";

/** What the client asks before it starts a local server: whether this machine agreed to its run line. */
export interface McpConsentGate {
  isGiven(server: ProjectMcpServer): Promise<boolean>;
}
