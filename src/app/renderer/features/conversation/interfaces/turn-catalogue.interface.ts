import type { McpLook, ProjectCommand, ProjectMcpServer } from "../../../interfaces";

/**
 * What a turn may reach into — the commands the project declares and the servers it names.
 * They travel together because a granted function belongs to one or the other and to nothing else.
 */
export interface TurnCatalogue {
  commands: ProjectCommand[];
  servers: ProjectMcpServer[];
  /** What each server said it hands over, by server id; a server that did not answer has no entry. */
  looks: Record<string, McpLook>;
}
