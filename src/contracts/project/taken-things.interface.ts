import type { Agent, Link, ProjectCommand, ProjectMcpServer, ProjectModel, ProjectPrompt, ToolGrant } from "./";

/** Everything one deletion took or loosened: a model takes its agents and links; a command or prompt, its uses. */
export interface TakenThings {
  models: ProjectModel[];
  prompts: ProjectPrompt[];
  commands: ProjectCommand[];
  /** A server goes with its grants, and comes back with them if the undo is taken up. */
  servers: ProjectMcpServer[];
  agents: Agent[];
  links: Link[];
  /** Staying agents that lost their prompt, with that prompt's id. */
  promptTakenFrom: { agentId: string; promptId: string }[];
  /** Agents that stayed and lost a granted function — of a command or of a server alike. */
  grantsTakenFrom: { agentId: string; grant: ToolGrant }[];
}
