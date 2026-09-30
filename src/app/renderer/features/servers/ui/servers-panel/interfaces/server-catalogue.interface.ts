import type { Agent, McpLook, ProjectMcpServer } from "../../../../../interfaces";

/** Every declared server, what each said when last asked, and who is being asked. */
export interface ServerCatalogue {
  servers: ProjectMcpServer[];
  /** What each server said, by server id; no entry before it is asked. */
  looks: Record<string, McpLook>;
  /** When each ask began, by server id; no entry when not being asked. */
  askingSince: Record<string, number>;
  /** «N АГЕНТІВ» is counted from the agents' grants only. */
  agents: Agent[];
}
