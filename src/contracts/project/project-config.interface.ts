import type { Agent } from "./agent.interface";
import type { Link } from "./link.interface";
import type { ProjectCommand } from "./project-command.interface";
import type { ProjectMcpServer } from "./mcp-server.interface";
import type { ProjectModel } from "./project-model.interface";
import type { ProjectPrompt } from "./project-prompt.interface";

/** An open project as `window.electronApi` delivers it: everything its config file holds. */
export interface ProjectConfig {
  version: number;
  name: string;
  models: ProjectModel[];
  prompts: ProjectPrompt[];
  commands: ProjectCommand[];
  servers: ProjectMcpServer[];
  agents: Agent[];
  links: Link[];
}
