import type {
  Agent,
  McpLook,
  ProjectCommand,
  ProjectMcpServer,
  ProjectModel,
  ProjectPrompt,
  ProviderState,
} from "../../../interfaces";

/** Everything an agent's tab chooses from: what the project declares and what the machine reports. */
export interface AgentCatalogue {
  models: ProjectModel[];
  /** Declared providers, so a model on an undeclared one is flagged under the field. */
  providers: ProviderState[];
  prompts: ProjectPrompt[];
  commands: ProjectCommand[];
  /** The project's servers and what each currently offers. */
  servers: ProjectMcpServer[];
  looks: Record<string, McpLook>;
  agents: Agent[];
}
