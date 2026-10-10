import type { McpLook } from "../mcp";
import type { Agent } from "./agent.interface";
import type { ProjectCommand } from "./project-command.interface";
import type { ProjectMcpServer } from "./mcp-server.interface";

/** Everything a grant can point at: declared commands, servers with what each said, and agents. */
export interface GrantTargets {
  commands: ProjectCommand[];
  servers: ProjectMcpServer[];
  /** What each server hands over, by server id; no entry for one that did not answer. */
  looks: Record<string, McpLook>;
  agents: Agent[];
}
