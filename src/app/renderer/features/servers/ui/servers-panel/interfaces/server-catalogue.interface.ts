import type { Agent, McpLook, ProjectMcpServer } from "../../../../../interfaces";

/** What stands in the catalogue: every declared server, what each said when last asked, and who is being asked. */
export interface ServerCatalogue {
  servers: ProjectMcpServer[];
  /** What each server said this time, by server id; a server not yet asked has no entry. */
  looks: Record<string, McpLook>;
  /** When each ask began, by server id; a server not being asked has no entry. */
  askingSince: Record<string, number>;
  /** «N АГЕНТІВ» is counted from the grants the agents hold, and from nothing else. */
  agents: Agent[];
}
