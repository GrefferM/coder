import type { McpLook, ProjectCommand, ProjectMcpServer } from "../../../interfaces";

/**
 * Everything the arc needs to say what a source **is** — the commands the project declares, the servers
 * it names, and what each server said it hands over. The arc itself is built from the grants alone; this is only
 * for the words, and a source the project no longer holds simply has none.
 */
export interface SourcesSaid {
  commands: ProjectCommand[];
  servers: ProjectMcpServer[];
  /** What every server said this time, by server id; nothing for one nobody has asked yet. */
  looks: Record<string, McpLook>;
}
