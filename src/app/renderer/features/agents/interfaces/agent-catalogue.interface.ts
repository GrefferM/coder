import type {
  Agent,
  McpLook,
  ProjectCommand,
  ProjectMcpServer,
  ProjectModel,
  ProjectPrompt,
  ProviderState,
} from "../../../interfaces";

/** Everything an agent's tab chooses from — what the project declares, and what the machine answers about it. */
export interface AgentCatalogue {
  models: ProjectModel[];
  /** The declared providers, so a model standing on one nobody announced says so under the field. */
  providers: ProviderState[];
  prompts: ProjectPrompt[];
  commands: ProjectCommand[];
  /** The servers the project names, and what each hands over right now. */
  servers: ProjectMcpServer[];
  looks: Record<string, McpLook>;
  agents: Agent[];
}
