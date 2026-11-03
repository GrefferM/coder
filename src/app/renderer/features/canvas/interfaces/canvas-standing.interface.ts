import type { Agent, AgentTrouble, Link, ProjectModel, ProjectPrompt } from "../../../interfaces";

import type { GrantTargets } from "../../../interfaces";

/** What is drawn on the canvas: the project's own things and what each wears. */
export interface CanvasStanding {
  agents: Agent[];
  links: Link[];
  models: ProjectModel[];
  /** Prompts the project has; the trail only marks an agent as standing on one of these. */
  prompts: ProjectPrompt[];
  troubles: Record<string, AgentTrouble | null>;
  /** Agents whose model is on a provider without functions; their arc is drawn quiet. */
  toolless: string[];
  /** Per-agent state colour for the dot beside the name. */
  states: Record<string, string>;
  /** What the sources say of themselves, so a mini-sphere can name its source. */
  sources: GrantTargets;
}
