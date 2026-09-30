import type { AgentWrites } from "../../../../../features/agents";
import type { LinkWrites } from "../../../../../features/links";
import type { ModelWrites } from "../../../../../features/models";
import type { CommandWrites } from "../../../../../features/commands";
import type { ServerWrites } from "../../../../../features/servers";
import type { PromptWrites } from "../../../../../features/prompts";
import type { ProjectWrite } from "../../../../../features/project";

/** The project's writer plus each subject's writes over it. */
export type ProjectActions = ProjectWrite &
  AgentWrites &
  LinkWrites &
  ModelWrites &
  CommandWrites &
  ServerWrites &
  PromptWrites;
