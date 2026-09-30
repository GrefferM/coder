import type { Agent, Link, ProjectCommand, ProjectMcpServer, ProjectModel, ProjectPrompt, ToolGrant } from "./";

/** Everything one deletion took or loosened: a model takes its agents and links; a command or prompt, its uses. */
export interface TakenThings {
  models: ProjectModel[];
  prompts: ProjectPrompt[];
  commands: ProjectCommand[];
  /** A server goes with its grants and returns with them on undo. */
  servers: ProjectMcpServer[];
  agents: Agent[];
  links: Link[];
  /** Staying agents that lost their prompt, with its id. */
  promptTakenFrom: { agentId: string; promptId: string }[];
  /** Staying agents that lost a granted function, of a command or a server. */
  grantsTakenFrom: { agentId: string; grant: ToolGrant }[];
}
