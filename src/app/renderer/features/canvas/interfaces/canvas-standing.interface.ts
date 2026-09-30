import type { Agent, AgentTrouble, Link, ProjectModel, ProjectPrompt } from "../../../interfaces";

/** What stands drawn on the canvas — the project's own things, and what each of them wears. */
import type { GrantTargets } from "../../../interfaces";

export interface CanvasStanding {
  agents: Agent[];
  links: Link[];
  models: ProjectModel[];
  /** The trail says an agent stands on a prompt, and a prompt the project let go is not one. */
  prompts: ProjectPrompt[];
  troubles: Record<string, AgentTrouble | null>;
  /** The agents whose model stands on a provider that carries no functions; their arc is drawn quiet. */
  toolless: string[];
  /** Per-agent state colour for the dot beside the name. */
  states: Record<string, string>;
  /** What the sources say of themselves, so a mini-sphere can name the one it stands for. */
  sources: GrantTargets;
}
