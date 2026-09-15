import type { Agent } from "./agent.interface";
import type { Link } from "./link.interface";
import type { ProjectCommand } from "./project-command.interface";
import type { ProjectMcpServer } from "./mcp-server.interface";
import type { ProjectModel } from "./project-model.interface";
import type { ProjectPrompt } from "./project-prompt.interface";

/** An open project, as `window.electronApi` delivers it — everything its folder's config file holds. */
export interface ProjectConfig {
  version: number;
  name: string;
  models: ProjectModel[];
  prompts: ProjectPrompt[];
  commands: ProjectCommand[];
  /** Each has a life of its own that a declared command has not: it is started, it answers or it falls. */
  servers: ProjectMcpServer[];
  agents: Agent[];
  links: Link[];
}
