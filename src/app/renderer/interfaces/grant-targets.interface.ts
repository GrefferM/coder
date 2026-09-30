import type { Agent, McpLook, ProjectCommand, ProjectMcpServer } from "../../../contracts";

/** Everything a grant can point at: declared commands, servers with what each said, and agents. */
export interface GrantTargets {
  commands: ProjectCommand[];
  servers: ProjectMcpServer[];
  /** What each server hands over, by server id; no entry for one that did not answer. */
  looks: Record<string, McpLook>;
  agents: Agent[];
}
