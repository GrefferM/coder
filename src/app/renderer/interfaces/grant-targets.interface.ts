import type { Agent, McpLook, ProjectCommand, ProjectMcpServer } from "../../../contracts";

/** Everything a grant can point at: the declared commands, the servers and what each said, and the agents. */
export interface GrantTargets {
  commands: ProjectCommand[];
  servers: ProjectMcpServer[];
  /** What each server said it hands over, by server id; a server that did not answer has no entry. */
  looks: Record<string, McpLook>;
  agents: Agent[];
}
